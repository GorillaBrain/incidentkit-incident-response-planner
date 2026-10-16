import { get, set, del } from 'idb-keyval'
import type { Incident, AppExportData } from '../types/incident'
import { DEMO_INCIDENTS } from '../constants/demoData'
import { validateAndParseImportJson } from './validation'

const STORAGE_KEY = 'incidentkit_records_v1';
const LOCAL_STORAGE_BACKUP_KEY = 'incidentkit_records_ls_v1';

// In-memory fallback if both IndexedDB and localStorage are blocked (e.g. strict browser sandboxing)
let inMemoryStore: Incident[] = [];

/**
 * Checks which storage mechanism is currently available.
 */
export async function getStorageStatus(): Promise<{
  engine: 'IndexedDB' | 'localStorage' | 'Memory';
  isPersisted: boolean;
  count: number;
}> {
  try {
    const records = await loadIncidents();
    if (typeof indexedDB !== 'undefined') {
      return { engine: 'IndexedDB', isPersisted: true, count: records.length };
    }
    if (typeof localStorage !== 'undefined') {
      return { engine: 'localStorage', isPersisted: true, count: records.length };
    }
  } catch {
    // fallback
  }
  return { engine: 'Memory', isPersisted: false, count: inMemoryStore.length };
}

/**
 * Loads all stored incidents from IndexedDB, falling back to localStorage or in-memory store.
 */
export async function loadIncidents(): Promise<Incident[]> {
  try {
    if (typeof indexedDB !== 'undefined') {
      const data = await get<Incident[]>(STORAGE_KEY);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[IncidentKit] IndexedDB read failed, falling back to localStorage:', err);
  }

  // Fallback to localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[IncidentKit] localStorage read failed, falling back to in-memory store:', err);
  }

  return inMemoryStore;
}

/**
 * Saves all incidents to IndexedDB with localStorage mirrored backup.
 */
export async function saveIncidents(incidents: Incident[]): Promise<void> {
  inMemoryStore = [...incidents];

  try {
    if (typeof indexedDB !== 'undefined') {
      await set(STORAGE_KEY, incidents);
    }
  } catch (err) {
    console.warn('[IncidentKit] IndexedDB write failed:', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(incidents));
    }
  } catch (err) {
    console.warn('[IncidentKit] localStorage backup write failed:', err);
  }
}

/**
 * Retrieves a single incident by its ID.
 */
export async function getIncidentById(id: string): Promise<Incident | undefined> {
  const all = await loadIncidents();
  return all.find((item) => item.id === id);
}

/**
 * Adds or updates an incident.
 */
export async function upsertIncident(incident: Incident): Promise<Incident[]> {
  const current = await loadIncidents();
  const index = current.findIndex((item) => item.id === incident.id);
  let updated: Incident[];

  const timestamp = new Date().toISOString();
  const itemToSave: Incident = {
    ...incident,
    updatedAt: timestamp,
  };

  if (index >= 0) {
    updated = [...current];
    updated[index] = itemToSave;
  } else {
    updated = [itemToSave, ...current];
  }

  await saveIncidents(updated);
  return updated;
}

/**
 * Deletes an incident by its ID.
 */
export async function deleteIncident(id: string): Promise<Incident[]> {
  const current = await loadIncidents();
  const updated = current.filter((item) => item.id !== id);
  await saveIncidents(updated);
  return updated;
}

/**
 * Loads synthetic demo incidents into storage (merges or overwrites demo tagged records).
 */
export async function loadDemoData(): Promise<Incident[]> {
  const current = await loadIncidents();
  // Filter out any existing demo data to prevent duplication
  const userIncidents = current.filter((item) => !item.isDemo);
  const combined = [...DEMO_INCIDENTS, ...userIncidents];
  await saveIncidents(combined);
  return combined;
}

/**
 * Removes all demo incidents while preserving user-created incidents.
 */
export async function removeDemoData(): Promise<Incident[]> {
  const current = await loadIncidents();
  const filtered = current.filter((item) => !item.isDemo);
  await saveIncidents(filtered);
  return filtered;
}

/**
 * Completely purges all locally stored records.
 */
export async function clearAllData(): Promise<void> {
  inMemoryStore = [];

  try {
    if (typeof indexedDB !== 'undefined') {
      await del(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[IncidentKit] IndexedDB delete error:', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
    }
  } catch (err) {
    console.warn('[IncidentKit] localStorage clear error:', err);
  }
}

/**
 * Generates an export payload of all incidents or a single incident.
 */
export async function exportToJson(singleIncidentId?: string): Promise<string> {
  const all = await loadIncidents();
  const incidentsToExport = singleIncidentId
    ? all.filter((item) => item.id === singleIncidentId)
    : all;

  const exportPayload: AppExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    source: 'IncidentKit',
    incidents: incidentsToExport,
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Imports incidents from a JSON string, validating data and saving to storage.
 */
export async function importFromJson(rawJson: string): Promise<{
  success: boolean;
  importedCount?: number;
  incidents?: Incident[];
  error?: string;
}> {
  const validation = validateAndParseImportJson(rawJson);
  if (!validation.success || !validation.data) {
    return { success: false, error: validation.error };
  }

  const newIncidents = validation.data.incidents;
  const current = await loadIncidents();

  // Merge: update existing by ID, append new ones
  const map = new Map<string, Incident>();
  current.forEach((item) => map.set(item.id, item));
  newIncidents.forEach((item) => map.set(item.id, item));

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  await saveIncidents(merged);
  return {
    success: true,
    importedCount: newIncidents.length,
    incidents: merged,
  };
}
