import React, { useState } from 'react'
import type { PlaybookInstance } from '../../types/incident'
import { PriorityBadge } from '../common/Badge'
import {
  CheckCircle2,
  Circle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Edit3,
  BookOpen,
} from 'lucide-react'

export interface PlaybookViewProps {
  incidentId: string;
  playbook: PlaybookInstance;
  onToggleTask: (
    incidentId: string,
    stageId: string,
    taskId: string,
    completed: boolean,
    notes?: string
  ) => Promise<void>;
  onChangePlaybook?: () => void;
}

export const PlaybookView: React.FC<PlaybookViewProps> = ({
  incidentId,
  playbook,
  onToggleTask,
  onChangePlaybook,
}) => {
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
    // Open first 2 stages by default
    const initial: Record<string, boolean> = {};
    playbook.stages.forEach((s, idx) => {
      initial[s.id] = idx < 2 || !s.tasks.every((t) => t.completed);
    });
    return initial;
  });

  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [taskNotesInput, setTaskNotesInput] = useState<string>('');

  // Calculate total progress
  let totalTasks = 0;
  let completedTasks = 0;

  playbook.stages.forEach((stage) => {
    stage.tasks.forEach((task) => {
      totalTasks++;
      if (task.completed) completedTasks++;
    });
  });

  const percentComplete =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleStartEditNotes = (taskId: string, currentNotes?: string) => {
    setEditingNotesTaskId(taskId);
    setTaskNotesInput(currentNotes || '');
  };

  const handleSaveNotes = async (stageId: string, taskId: string, isCompleted: boolean) => {
    await onToggleTask(incidentId, stageId, taskId, isCompleted, taskNotesInput);
    setEditingNotesTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Playbook Header & Overall Progress */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{playbook.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {playbook.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {playbook.description}
              </p>
            </div>
          </div>

          {onChangePlaybook && (
            <button
              onClick={onChangePlaybook}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0 self-start sm:self-center"
            >
              Switch Playbook
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Response Checklist Completion</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {completedTasks} of {totalTasks} Tasks ({percentComplete}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentComplete === 100
                  ? 'bg-emerald-500'
                  : percentComplete >= 50
                  ? 'bg-cyan-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Defensive Safety Disclaimer */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 text-slate-400 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Defensive Protocol Notice:</strong> Tasks below represent standard operational checklists and analytical recommendations. IncidentKit is a decision-support planner and does not execute destructive automated commands, modify infrastructure, or disable real accounts.
          </p>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {playbook.stages.map((stage, stageIdx) => {
          const isOpen = openStages[stage.id] ?? false;
          const stageTotal = stage.tasks.length;
          const stageCompleted = stage.tasks.filter((t) => t.completed).length;
          const isStageFinished = stageTotal > 0 && stageTotal === stageCompleted;

          return (
            <div
              key={stage.id}
              className={`rounded-xl border transition-all ${
                isStageFinished
                  ? 'border-emerald-500/30 bg-slate-900/40'
                  : isOpen
                  ? 'border-slate-700 bg-slate-900/80 shadow-md'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              {/* Stage Header Accordion Toggle */}
              <button
                type="button"
                onClick={() => toggleStage(stage.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isStageFinished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {stageIdx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <span>{stage.name}</span>
                      {isStageFinished && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {stageCompleted}/{stageTotal}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Tasks List */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 divide-y divide-slate-800/60 border-t border-slate-800/60">
                  {stage.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="py-3 flex items-start gap-3 group transition-colors"
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleTask(
                            incidentId,
                            stage.id,
                            task.id,
                            !task.completed,
                            task.notes
                          )
                        }
                        className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                        title={task.completed ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-medium ${
                              task.completed
                                ? 'text-slate-400 line-through decoration-slate-600'
                                : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                          {task.completed && task.completedAt && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {new Date(task.completedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {task.explanation}
                        </p>

                        {/* Task Notes */}
                        {editingNotesTaskId === task.id ? (
                          <div className="mt-2 space-y-2 p-2.5 rounded-lg bg-slate-950 border border-slate-700">
                            <textarea
                              rows={2}
                              value={taskNotesInput}
                              onChange={(e) => setTaskNotesInput(e.target.value)}
                              placeholder="Add analyst notes or execution details..."
                              className="w-full text-xs bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingNotesTaskId(null)}
                                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveNotes(stage.id, task.id, task.completed)
                                }
                                className="px-2.5 py-1 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 pt-0.5">
                            {task.notes && (
                              <p className="text-xs text-cyan-300/90 italic bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/40">
                                Note: {task.notes}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartEditNotes(task.id, task.notes)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-cyan-300 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{task.notes ? 'Edit Note' : 'Add Note'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
