import React, { useState, useRef } from 'react'
import { useIncidentContext, type MainNavTab } from '../../context/IncidentContext'
import {
  ShieldAlert,
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Calculator,
  GraduationCap,
  Plus,
  Download,
  Upload,
  Database,
  Trash2,
  Sparkles,
  Menu,
  X,
  FileText,
} from 'lucide-react'

export const Header: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    incidents,
    selectIncident,
    setIsCreateModalOpen,
    setIsPrivacyModalOpen,
    loadDemoData,
    removeDemoData,
    clearAllData,
    exportAll,
    importJson,
    showToast,
    storageInfo,
  } = useIncidentContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasDemo = incidents.some((i) => i.isDemo);

  const handleExport = async () => {
    try {
      const json = await exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidentkit-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Export file downloaded successfully.', 'success');
      setIsDataMenuOpen(false);
    } catch {
      showToast('Failed to export incidents.', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text) {
          await importJson(text);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsDataMenuOpen(false);
        }
      };
      reader.readAsText(file);
    } catch {
      showToast('Error reading import file.', 'error');
    }
  };

  const navItems: { id: MainNavTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: <FolderGit2 className="w-4 h-4" />,
      count: incidents.length,
    },
    { id: 'playbooks', label: 'Playbooks', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'calculator', label: 'Severity Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'education', label: 'Educational Hub', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'glossary', label: 'Glossary', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                selectIncident(null);
                setActiveNavTab('dashboard');
              }}
              className="flex items-center gap-3 group text-left"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    IncidentKit
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    CSIRT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Incident Response Planner & Ops Console
                </p>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeNavTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectIncident(null);
                      setActiveNavTab(item.id);
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800/90 text-cyan-300 border border-slate-700/80 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-300 font-mono">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Storage & Privacy Pill */}
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Click to view local storage and privacy architecture details"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{storageInfo.engine}</span>
            </button>

            {/* Data Management Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDataMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <span>Data</span>
                <span className="text-[10px] text-slate-500">▼</span>
              </button>

              {isDataMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsDataMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-40 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Backup & Scenarios
                    </div>

                    <button
                      onClick={handleExport}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-left"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Export All Incidents (JSON)</span>
                    </button>

                    <label className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-left cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Import Incidents (JSON)</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={async () => {
                        await loadDemoData();
                        setIsDataMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Load Demo Scenarios</span>
                    </button>

                    {hasDemo && (
                      <button
                        onClick={async () => {
                          await removeDemoData();
                          setIsDataMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-300 hover:bg-slate-800 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Demo Scenarios</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete ALL stored incident records? This action cannot be undone.'
                          )
                        ) {
                          await clearAllData();
                        }
                        setIsDataMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Purge All Records</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Incident</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    selectIncident(null);
                    setActiveNavTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-200">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Storage: {storageInfo.engine} ({storageInfo.count} items)
              </span>
              <button
                onClick={() => {
                  setIsPrivacyModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-cyan-400 hover:underline"
              >
                Privacy Notice
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
