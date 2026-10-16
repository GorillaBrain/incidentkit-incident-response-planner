import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  Incident,
  EvidenceRecord,
  TimelineEvent,
  PostIncidentReview,
} from '../types/incident'
import * as storage from '../services/storage'
import {
  generateIncidentId,
  generateEvidenceId,
  generateTimelineId,
} from '../services/validation'
import { createPlaybookInstance } from '../constants/playbooks'

export type MainNavTab = 'dashboard' | 'incidents' | 'playbooks' | 'calculator' | 'education' | 'glossary';
export type IncidentDetailTab = 'overview' | 'playbook' | 'evidence' | 'timeline' | 'report' | 'review';

export interface FilterState {
  search: string;
  severity: string;
  status: string;
  category: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface IncidentContextType {
  incidents: Incident[];
  isLoading: boolean;
  activeNavTab: MainNavTab;
  setActiveNavTab: (tab: MainNavTab) => void;
  selectedIncident: Incident | null;
  selectIncident: (id: string | null, detailTab?: IncidentDetailTab) => void;
  incidentDetailTab: IncidentDetailTab;
  setIncidentDetailTab: (tab: IncidentDetailTab) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  // CRUD operations
  createIncident: (incidentData: Partial<Incident>) => Promise<Incident>;
  updateIncident: (incident: Incident) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  // Playbook actions
  attachPlaybook: (incidentId: string, templateId: string) => Promise<void>;
  togglePlaybookTask: (
    incidentId: string,
    stageId: string,
    taskId: string,
    completed: boolean,
    notes?: string
  ) => Promise<void>;
  // Evidence actions
  addEvidence: (
    incidentId: string,
    evidenceData: Omit<EvidenceRecord, 'id' | 'incidentId' | 'recordedAt'>
  ) => Promise<void>;
  deleteEvidence: (incidentId: string, evidenceId: string) => Promise<void>;
  // Timeline actions
  addTimelineEvent: (
    incidentId: string,
    eventData: Omit<TimelineEvent, 'id' | 'incidentId' | 'enteredAt'>
  ) => Promise<void>;
  deleteTimelineEvent: (incidentId: string, eventId: string) => Promise<void>;
  // Post-Incident Review actions
  updatePostIncidentReview: (incidentId: string, review: PostIncidentReview) => Promise<void>;
  toggleActionItemStatus: (
    incidentId: string,
    actionId: string,
    newStatus: 'Pending' | 'In Progress' | 'Completed'
  ) => Promise<void>;
  // Demo & Reset
  loadDemoData: () => Promise<void>;
  removeDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  // Export & Import
  exportAll: () => Promise<string>;
  exportSingle: (id: string) => Promise<string>;
  importJson: (jsonString: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  // UI Dialogs
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isPrivacyModalOpen: boolean;
  setIsPrivacyModalOpen: (open: boolean) => void;
  editingIncident: Incident | null;
  setEditingIncident: (inc: Incident | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  storageInfo: { engine: string; isPersisted: boolean; count: number };
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentDetailTab, setIncidentDetailTab] = useState<IncidentDetailTab>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ engine: string; isPersisted: boolean; count: number }>({
    engine: 'IndexedDB',
    isPersisted: true,
    count: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    severity: 'all',
    status: 'all',
    category: 'all',
  });

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      severity: 'all',
      status: 'all',
      category: 'all',
    });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Initial load from storage
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const loaded = await storage.loadIncidents();
        if (isMounted) {
          setIncidents(loaded);
          const status = await storage.getStorageStatus();
          setStorageInfo(status);
        }
      } catch (err) {
        console.error('Failed to load incidents from storage:', err);
        showToast('Warning: Could not initialize browser storage.', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;

  const selectIncident = useCallback(
    (id: string | null, detailTab: IncidentDetailTab = 'overview') => {
      setSelectedIncidentId(id);
      setIncidentDetailTab(detailTab);
      if (id) {
        setActiveNavTab('incidents');
      }
    },
    []
  );

  const createIncident = useCallback(
    async (incidentData: Partial<Incident>): Promise<Incident> => {
      const now = new Date().toISOString();
      const newId = generateIncidentId(incidents);

      const newIncident: Incident = {
        id: newId,
        title: incidentData.title || 'Untitled Incident',
        type: incidentData.type || 'Other',
        description: incidentData.description || '',
        severity: incidentData.severity || 'Medium',
        severityAssessment: incidentData.severityAssessment,
        status: incidentData.status || 'New',
        detectedAt: incidentData.detectedAt || now,
        reportedAt: incidentData.reportedAt || now,
        affectedSystems: incidentData.affectedSystems || [],
        suspectedAttackVector: incidentData.suspectedAttackVector || '',
        impactAssessment: incidentData.impactAssessment || '',
        assignedResponder: incidentData.assignedResponder || 'Unassigned',
        tags: incidentData.tags || [],
        responseNotes: incidentData.responseNotes || '',
        resolutionSummary: '',
        createdAt: now,
        updatedAt: now,
        evidence: [],
        timeline: [
          {
            id: generateTimelineId(0),
            incidentId: newId,
            timestamp: incidentData.detectedAt || now,
            enteredAt: now,
            title: 'Incident Detected & Logged',
            description: `Incident created with status ${incidentData.status || 'New'} and severity ${incidentData.severity || 'Medium'}.`,
            category: 'Detection',
          },
        ],
        isDemo: false,
      };

      // If user selected a playbook template during creation
      if (incidentData.playbook?.templateId) {
        newIncident.playbook = createPlaybookInstance(incidentData.playbook.templateId);
      }

      const updated = await storage.upsertIncident(newIncident);
      setIncidents(updated);
      setStorageInfo((prev) => ({ ...prev, count: updated.length }));
      showToast(`Incident ${newId} created successfully.`, 'success');
      return newIncident;
    },
    [incidents, showToast]
  );

  const updateIncident = useCallback(
    async (updated: Incident) => {
      const list = await storage.upsertIncident(updated);
      setIncidents(list);
      setStorageInfo((prev) => ({ ...prev, count: list.length }));
      showToast(`Incident ${updated.id} updated.`, 'success');
    },
    [showToast]
  );

  const deleteIncident = useCallback(
    async (id: string) => {
      const list = await storage.deleteIncident(id);
      setIncidents(list);
      setStorageInfo((prev) => ({ ...prev, count: list.length }));
      if (selectedIncidentId === id) {
        setSelectedIncidentId(null);
      }
      showToast(`Incident ${id} deleted.`, 'info');
    },
    [selectedIncidentId, showToast]
  );

  const attachPlaybook = useCallback(
    async (incidentId: string, templateId: string) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const instance = createPlaybookInstance(templateId);
      if (!instance) return;

      const updated: Incident = {
        ...target,
        playbook: instance,
        timeline: [
          ...target.timeline,
          {
            id: generateTimelineId(target.timeline.length),
            incidentId: target.id,
            timestamp: new Date().toISOString(),
            enteredAt: new Date().toISOString(),
            title: `Playbook Attached: ${instance.title}`,
            description: `Standard response procedures initialized for ${instance.category}.`,
            category: 'Triage',
          },
        ],
      };

      await updateIncident(updated);
      showToast(`Playbook attached to ${incidentId}.`, 'success');
    },
    [incidents, updateIncident, showToast]
  );

  const togglePlaybookTask = useCallback(
    async (
      incidentId: string,
      stageId: string,
      taskId: string,
      completed: boolean,
      notes?: string
    ) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target || !target.playbook) return;

      let taskTitle = '';
      const updatedStages = target.playbook.stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          tasks: stage.tasks.map((task) => {
            if (task.id !== taskId) return task;
            taskTitle = task.title;
            return {
              ...task,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
              notes: notes !== undefined ? notes : task.notes,
            };
          }),
        };
      });

      const updatedPlaybook = {
        ...target.playbook,
        stages: updatedStages,
      };

      // Add timeline event if completing a task
      let newTimeline = target.timeline;
      if (completed && taskTitle) {
        newTimeline = [
          ...target.timeline,
          {
            id: generateTimelineId(target.timeline.length),
            incidentId: target.id,
            timestamp: new Date().toISOString(),
            enteredAt: new Date().toISOString(),
            title: `Playbook Task Completed: ${taskTitle}`,
            description: notes ? `Notes: ${notes}` : 'Marked completed in response checklist.',
            category: 'Containment',
          },
        ];
      }

      const updated: Incident = {
        ...target,
        playbook: updatedPlaybook,
        timeline: newTimeline,
      };

      await updateIncident(updated);
    },
    [incidents, updateIncident]
  );

  const addEvidence = useCallback(
    async (
      incidentId: string,
      evidenceData: Omit<EvidenceRecord, 'id' | 'incidentId' | 'recordedAt'>
    ) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const now = new Date().toISOString();
      const newEvdId = generateEvidenceId(target.evidence.length);

      const record: EvidenceRecord = {
        ...evidenceData,
        id: newEvdId,
        incidentId,
        recordedAt: now,
      };

      const updated: Incident = {
        ...target,
        evidence: [record, ...target.evidence],
        timeline: [
          ...target.timeline,
          {
            id: generateTimelineId(target.timeline.length),
            incidentId: target.id,
            timestamp: evidenceData.collectedAt || now,
            enteredAt: now,
            title: `Evidence Preserved: ${evidenceData.fileOrRefName || evidenceData.evidenceType}`,
            description: `${evidenceData.description} (Collector: ${evidenceData.collectorName})`,
            category: 'Triage',
            associatedEvidenceId: newEvdId,
          },
        ],
      };

      await updateIncident(updated);
      showToast(`Evidence ${newEvdId} recorded.`, 'success');
    },
    [incidents, updateIncident, showToast]
  );

  const deleteEvidence = useCallback(
    async (incidentId: string, evidenceId: string) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const updated: Incident = {
        ...target,
        evidence: target.evidence.filter((e) => e.id !== evidenceId),
      };

      await updateIncident(updated);
      showToast(`Evidence item removed.`, 'info');
    },
    [incidents, updateIncident, showToast]
  );

  const addTimelineEvent = useCallback(
    async (
      incidentId: string,
      eventData: Omit<TimelineEvent, 'id' | 'incidentId' | 'enteredAt'>
    ) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const now = new Date().toISOString();
      const newEvtId = generateTimelineId(target.timeline.length);

      const newEvent: TimelineEvent = {
        ...eventData,
        id: newEvtId,
        incidentId,
        enteredAt: now,
      };

      // Keep timeline sorted chronologically by event occurrence timestamp
      const updatedTimeline = [...target.timeline, newEvent].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const updated: Incident = {
        ...target,
        timeline: updatedTimeline,
      };

      await updateIncident(updated);
      showToast('Timeline event added.', 'success');
    },
    [incidents, updateIncident, showToast]
  );

  const deleteTimelineEvent = useCallback(
    async (incidentId: string, eventId: string) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const updated: Incident = {
        ...target,
        timeline: target.timeline.filter((e) => e.id !== eventId),
      };

      await updateIncident(updated);
      showToast('Timeline event deleted.', 'info');
    },
    [incidents, updateIncident, showToast]
  );

  const updatePostIncidentReview = useCallback(
    async (incidentId: string, review: PostIncidentReview) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target) return;

      const updated: Incident = {
        ...target,
        postIncidentReview: review,
      };

      await updateIncident(updated);
      showToast('Post-Incident Review saved.', 'success');
    },
    [incidents, updateIncident, showToast]
  );

  const toggleActionItemStatus = useCallback(
    async (
      incidentId: string,
      actionId: string,
      newStatus: 'Pending' | 'In Progress' | 'Completed'
    ) => {
      const target = incidents.find((i) => i.id === incidentId);
      if (!target || !target.postIncidentReview) return;

      const updatedActions = target.postIncidentReview.actionItems.map((act) => {
        if (act.id !== actionId) return act;
        return { ...act, status: newStatus };
      });

      const updatedReview: PostIncidentReview = {
        ...target.postIncidentReview,
        actionItems: updatedActions,
      };

      const updated: Incident = {
        ...target,
        postIncidentReview: updatedReview,
      };

      await updateIncident(updated);
      showToast(`Action item marked ${newStatus}.`, 'success');
    },
    [incidents, updateIncident, showToast]
  );

  const loadDemoData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await storage.loadDemoData();
      setIncidents(result);
      setStorageInfo((prev) => ({ ...prev, count: result.length }));
      showToast('Synthetic demo incidents loaded.', 'success');
    } catch {
      showToast('Failed to load demo data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const removeDemoData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await storage.removeDemoData();
      setIncidents(result);
      setStorageInfo((prev) => ({ ...prev, count: result.length }));
      showToast('Demo incidents removed. Clean workspace restored.', 'info');
    } catch {
      showToast('Failed to remove demo data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await storage.clearAllData();
      setIncidents([]);
      setSelectedIncidentId(null);
      setStorageInfo((prev) => ({ ...prev, count: 0 }));
      showToast('All local incident records purged.', 'info');
    } catch {
      showToast('Failed to clear data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const exportAll = useCallback(async () => {
    return await storage.exportToJson();
  }, []);

  const exportSingle = useCallback(async (id: string) => {
    return await storage.exportToJson(id);
  }, []);

  const importJson = useCallback(
    async (jsonString: string) => {
      const result = await storage.importFromJson(jsonString);
      if (result.success && result.incidents) {
        setIncidents(result.incidents);
        setStorageInfo((prev) => ({ ...prev, count: result.incidents?.length || 0 }));
        showToast(`Successfully imported ${result.importedCount} incident(s).`, 'success');
        return { success: true, count: result.importedCount };
      } else {
        showToast(result.error || 'Failed to import JSON.', 'error');
        return { success: false, error: result.error };
      }
    },
    [showToast]
  );

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        isLoading,
        activeNavTab,
        setActiveNavTab,
        selectedIncident,
        selectIncident,
        incidentDetailTab,
        setIncidentDetailTab,
        filters,
        setFilters,
        resetFilters,
        createIncident,
        updateIncident,
        deleteIncident,
        attachPlaybook,
        togglePlaybookTask,
        addEvidence,
        deleteEvidence,
        addTimelineEvent,
        deleteTimelineEvent,
        updatePostIncidentReview,
        toggleActionItemStatus,
        loadDemoData,
        removeDemoData,
        clearAllData,
        exportAll,
        exportSingle,
        importJson,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isPrivacyModalOpen,
        setIsPrivacyModalOpen,
        editingIncident,
        setEditingIncident,
        toasts,
        showToast,
        storageInfo,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export function useIncidentContext(): IncidentContextType {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidentContext must be used within an IncidentProvider');
  }
  return context;
}
