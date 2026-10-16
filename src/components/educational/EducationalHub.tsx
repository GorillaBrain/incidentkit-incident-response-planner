import React, { useState } from 'react'
import { EDUCATIONAL_TOPICS } from '../../constants/educational'
import {
  GraduationCap,
  RotateCcw,
  ShieldAlert,
  Database,
  Clock,
  Sliders,
  FileCheck,
  CheckCircle2,
} from 'lucide-react'

export const EducationalHub: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(EDUCATIONAL_TOPICS[0].id);

  const selectedTopic =
    EDUCATIONAL_TOPICS.find((t) => t.id === selectedTopicId) || EDUCATIONAL_TOPICS[0];

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCcw':
        return <RotateCcw className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5" />;
      case 'FileCheck':
      default:
        return <FileCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cybersecurity Incident Response Fundamentals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Core frameworks, operational principles, and interview preparation for aspiring security analysts
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Topic List on Left, Topic Reader on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Curriculum Modules ({EDUCATIONAL_TOPICS.length})
          </span>

          <div className="space-y-2">
            {EDUCATIONAL_TOPICS.map((topic, idx) => {
              const isSelected = topic.id === selectedTopicId;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getTopicIcon(topic.iconName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Module 0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 truncate">
                      {topic.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {topic.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Educational Content Reader */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-6">
            {/* Topic Header */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                {getTopicIcon(selectedTopic.iconName)}
                <span>Incident Response Theory & Applied Practice</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {selectedTopic.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedTopic.summary}
              </p>
            </div>

            {/* Key Takeaways Card */}
            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Key Operational Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedTopic.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In-Depth Sections */}
            <div className="space-y-6">
              {selectedTopic.content.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{sec.heading}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pl-3.5 border-l border-slate-800">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
