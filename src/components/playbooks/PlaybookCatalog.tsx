import React, { useState } from 'react'
import { PLAYBOOK_TEMPLATES } from '../../constants/playbooks'
import { PriorityBadge } from '../common/Badge'
import { BookOpen, ChevronDown, ChevronRight, Plus, ArrowRight } from 'lucide-react'

export interface PlaybookCatalogProps {
  onAttachToIncident?: (templateId: string) => void;
  onCreateIncidentWithPlaybook?: (templateId: string) => void;
}

export const PlaybookCatalog: React.FC<PlaybookCatalogProps> = ({
  onAttachToIncident,
  onCreateIncidentWithPlaybook,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    PLAYBOOK_TEMPLATES[0].id
  );
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    'stg-prep': true,
    'stg-id': true,
  });

  const selectedTemplate =
    PLAYBOOK_TEMPLATES.find((t) => t.id === selectedTemplateId) || PLAYBOOK_TEMPLATES[0];

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Standard Incident Response Playbook Library
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Battle-tested operational checklists aligned with NIST SP 800-61 Rev 2 and SANS 6-step IR methodologies
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Templates + Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Playbook Selector Column */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Available Playbooks ({PLAYBOOK_TEMPLATES.length})
          </span>

          <div className="space-y-2">
            {PLAYBOOK_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              const totalTasksCount = tmpl.stages.reduce(
                (acc, s) => acc + s.tasks.length,
                0
              );

              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tmpl.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {totalTasksCount} Tasks
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-2">
                    {tmpl.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Playbook Inspector */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Template ID: {selectedTemplate.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedTemplate.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {selectedTemplate.overview}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {onCreateIncidentWithPlaybook && (
                  <button
                    onClick={() => onCreateIncidentWithPlaybook(selectedTemplate.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Incident with Playbook</span>
                  </button>
                )}
                {onAttachToIncident && (
                  <button
                    onClick={() => onAttachToIncident(selectedTemplate.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <span>Attach to Current</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Stages & Tasks Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Playbook Stages & Execution Checklist
              </span>

              {selectedTemplate.stages.map((stage, sIdx) => {
                const isExpanded = expandedStages[stage.id] ?? false;

                return (
                  <div
                    key={stage.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleStage(stage.id)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center font-bold">
                          {sIdx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">
                            {stage.name}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          {stage.tasks.length} tasks
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 divide-y divide-slate-800/60 border-t border-slate-800/60 space-y-2">
                        {stage.tasks.map((task) => (
                          <div key={task.id} className="pt-2 first:pt-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-slate-200">
                                {task.title}
                              </span>
                              <PriorityBadge priority={task.priority} />
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {task.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
