import React from 'react'
import { IncidentProvider, useIncidentContext } from './context/IncidentContext'
import { Header } from './components/common/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { IncidentList } from './components/incidents/IncidentList'
import { IncidentDetail } from './components/incidents/IncidentDetail'
import { IncidentForm } from './components/incidents/IncidentForm'
import { PlaybookCatalog } from './components/playbooks/PlaybookCatalog'
import { SeverityCalculatorView } from './components/calculator/SeverityCalculatorView'
import { EducationalHub } from './components/educational/EducationalHub'
import { GlossaryView } from './components/educational/GlossaryView'
import { PrivacyModal } from './components/privacy/PrivacyModal'
import { ToastContainer } from './components/common/Toast'
import { Shield, Database } from 'lucide-react'

const AppContent: React.FC = () => {
  const {
    activeNavTab,
    selectedIncident,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    editingIncident,
    setEditingIncident,
    createIncident,
    updateIncident,
    toasts,
    storageInfo,
    selectIncident,
  } = useIncidentContext();

  const handleFormSubmit = async (data: any) => {
    if (editingIncident) {
      await updateIncident(data);
    } else {
      const created = await createIncident(data);
      selectIncident(created.id, 'overview');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If an incident is selected, render its comprehensive detail file */}
        {selectedIncident ? (
          <IncidentDetail incident={selectedIncident} />
        ) : (
          <>
            {activeNavTab === 'dashboard' && <Dashboard />}
            {activeNavTab === 'incidents' && <IncidentList />}
            {activeNavTab === 'playbooks' && (
              <PlaybookCatalog
                onCreateIncidentWithPlaybook={(_templateId) => {
                  setEditingIncident(null);
                  setIsCreateModalOpen(true);
                }}
              />
            )}
            {activeNavTab === 'calculator' && <SeverityCalculatorView />}
            {activeNavTab === 'education' && <EducationalHub />}
            {activeNavTab === 'glossary' && <GlossaryView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              <strong>IncidentKit</strong> — Computer System Security Incident Response Planner & Operations Hub
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Database className="w-3 h-3 text-emerald-400" />
              100% Client-Side / {storageInfo.engine}
            </span>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-cyan-400 underline transition-colors"
            >
              Privacy & Threat Model
            </button>
            <span className="font-mono text-[11px]">v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {isCreateModalOpen && (
        <IncidentForm
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingIncident(null);
          }}
          initialData={editingIncident}
          onSubmit={handleFormSubmit}
        />
      )}

      {isPrivacyModalOpen && (
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default function App() {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
}
