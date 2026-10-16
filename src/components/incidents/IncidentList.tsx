import React, { useState, useMemo } from 'react'
import type { Incident, SeverityLevel } from '../../types/incident'
import { useIncidentContext } from '../../context/IncidentContext'
import { SeverityBadge, StatusBadge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { INCIDENT_CATEGORIES } from '../../constants/categories'
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Clock,
  Sparkles,
  Download,
  Trash2,
  Edit,
  Shield,
  ChevronRight,
} from 'lucide-react'

export const IncidentList: React.FC = () => {
  const {
    incidents,
    selectIncident,
    filters,
    setFilters,
    resetFilters,
    setIsCreateModalOpen,
    setEditingIncident,
    deleteIncident,
    exportSingle,
    showToast,
  } = useIncidentContext();

  const [sortBy, setSortBy] = useState<'updatedAt' | 'detectedAt' | 'severity'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Filtered & Sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchId = inc.id.toLowerCase().includes(q);
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchDesc = inc.description.toLowerCase().includes(q);
          const matchSystems = inc.affectedSystems.some((s) => s.toLowerCase().includes(q));
          const matchTags = inc.tags.some((t) => t.toLowerCase().includes(q));
          const matchResponder = inc.assignedResponder.toLowerCase().includes(q);
          if (
            !matchId &&
            !matchTitle &&
            !matchDesc &&
            !matchSystems &&
            !matchTags &&
            !matchResponder
          ) {
            return false;
          }
        }

        // Severity filter
        if (filters.severity !== 'all' && inc.severity !== filters.severity) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all' && inc.status !== filters.status) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && inc.type !== filters.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const severityOrder: Record<SeverityLevel, number> = {
            Critical: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };
          const valA = severityOrder[a.severity];
          const valB = severityOrder[b.severity];
          return sortDirection === 'desc' ? valB - valA : valA - valB;
        }

        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [incidents, filters, sortBy, sortDirection]);

  const handleExportSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const json = await exportSingle(id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${id} to JSON.`, 'success');
    } catch {
      showToast('Failed to export incident.', 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete incident ${id}?`)) {
      await deleteIncident(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, inc: Incident) => {
    e.stopPropagation();
    setEditingIncident(inc);
    setIsCreateModalOpen(true);
  };

  const hasActiveFilters =
    filters.search ||
    filters.severity !== 'all' ||
    filters.status !== 'all' ||
    filters.category !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search by ID, title, affected host, tag, or responder..."
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* New Incident Button */}
          <button
            onClick={() => {
              setEditingIncident(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Severity: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Status: All</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Contained">Contained</option>
            <option value="Recovering">Recovering</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 max-w-[160px] truncate"
          >
            <option value="all">Category: All</option>
            {INCIDENT_CATEGORIES.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'detectedAt' | 'severity')}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="updatedAt">Sort: Recently Updated</option>
              <option value="detectedAt">Sort: Date Detected</option>
              <option value="severity">Sort: Risk Severity</option>
            </select>
            <button
              onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
            >
              {sortDirection === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-cyan-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Incident Records Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents
        </span>
      </div>

      {/* Incidents Table / Card List */}
      {filteredIncidents.length > 0 ? (
        <div className="space-y-2">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => selectIncident(inc.id, 'overview')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: ID, Badges, Title, Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    {inc.id}
                  </span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                  <StatusBadge status={inc.status} size="sm" />
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {inc.type}
                  </span>
                  {inc.isDemo && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Sparkles className="w-2.5 h-2.5" />
                      Demo
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                  {inc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {inc.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <span>
                    Lead: <strong className="text-slate-300">{inc.assignedResponder || 'Unassigned'}</strong>
                  </span>
                  {inc.affectedSystems && inc.affectedSystems.length > 0 && (
                    <span className="truncate max-w-sm">
                      Assets: <span className="text-slate-300">{inc.affectedSystems.join(', ')}</span>
                    </span>
                  )}
                  {inc.tags && inc.tags.length > 0 && (
                    <span className="truncate max-w-xs text-cyan-400/80">
                      #{inc.tags.join(' #')}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Timestamps & Quick Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Detected: {new Date(inc.detectedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Updated: {new Date(inc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleExportSingle(e, inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Export single incident JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleEdit(e, inc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit incident"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete incident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-5 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? 'No Matching Incidents' : 'No Incidents in Database'}
          description={
            hasActiveFilters
              ? 'No incidents matched your search or filter parameters. Try clearing the filters.'
              : 'Create your first incident record or load realistic synthetic demo scenarios to get started.'
          }
          icon={<Shield className="w-8 h-8" />}
          actionText={hasActiveFilters ? 'Reset Filters' : 'Create New Incident'}
          onAction={hasActiveFilters ? resetFilters : () => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  );
};
