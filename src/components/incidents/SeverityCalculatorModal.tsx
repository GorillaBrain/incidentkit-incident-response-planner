import React, { useState } from 'react'
import type { SeverityFactors, SeverityLevel } from '../../types/incident'
import {
  calculateSeverity,
  SCORING_MATRIX,
  DEFAULT_SEVERITY_FACTORS,
} from '../../services/severityCalculator'
import { Modal } from '../common/Modal'
import { SeverityBadge } from '../common/Badge'
import { Check, Info, Sliders } from 'lucide-react'

export interface SeverityCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFactors?: SeverityFactors;
  onApply: (factors: SeverityFactors, severity: SeverityLevel, rationale: string[]) => void;
}

export const SeverityCalculatorModal: React.FC<SeverityCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialFactors,
  onApply,
}) => {
  const [factors, setFactors] = useState<SeverityFactors>(
    initialFactors || DEFAULT_SEVERITY_FACTORS
  );
  const [manualOverride, setManualOverride] = useState<SeverityLevel | null>(null);

  const result = calculateSeverity(factors);
  const effectiveSeverity = manualOverride || result.suggestedSeverity;

  const handleApply = () => {
    onApply(factors, effectiveSeverity, result.rationale);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Incident Severity Assessment Tool"
      subtitle="Multi-factor decision support guidance based on NIST SP 800-61 Rev 2 criteria"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Guidance disclaimer banner */}
        <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Decision Support Notice:</p>
            <p className="leading-relaxed text-slate-300">
              Severity recommendations calculated here are structured decision-support guidance, not definitive incident classifications. IncidentKit does not automatically detect real attacks or override human analyst judgment.
            </p>
          </div>
        </div>

        {/* 6 Assessment Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Business Impact */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              1. Business & Operational Impact
            </label>
            <select
              value={factors.businessImpact}
              onChange={(e) =>
                setFactors({ ...factors, businessImpact: e.target.value as SeverityFactors['businessImpact'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.businessImpact).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Direct impact on core business transactions, revenue, customer trust, or legal duties.
            </p>
          </div>

          {/* 2. Scope */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              2. Affected Scope (Systems / Users)
            </label>
            <select
              value={factors.affectedScope}
              onChange={(e) =>
                setFactors({ ...factors, affectedScope: e.target.value as SeverityFactors['affectedScope'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.affectedScope).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Number of workstations, servers, databases, or compromised user accounts involved.
            </p>
          </div>

          {/* 3. Data Sensitivity */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              3. Sensitivity of Affected Data
            </label>
            <select
              value={factors.dataSensitivity}
              onChange={(e) =>
                setFactors({ ...factors, dataSensitivity: e.target.value as SeverityFactors['dataSensitivity'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.dataSensitivity).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Classification of data exposed or targeted (PII, trade secrets, passwords, public info).
            </p>
          </div>

          {/* 4. Service Availability */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              4. Availability of Critical Services
            </label>
            <select
              value={factors.serviceAvailability}
              onChange={(e) =>
                setFactors({ ...factors, serviceAvailability: e.target.value as SeverityFactors['serviceAvailability'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.serviceAvailability).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Operational health of public portals, authentication realms, or payment systems.
            </p>
          </div>

          {/* 5. Active Malicious Activity */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              5. Ongoing Malicious Activity
            </label>
            <select
              value={factors.activeMaliciousActivity}
              onChange={(e) =>
                setFactors({ ...factors, activeMaliciousActivity: e.target.value as SeverityFactors['activeMaliciousActivity'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.activeMaliciousActivity).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Whether an adversary is currently active in the network or if the threat was blocked.
            </p>
          </div>

          {/* 6. Spread Potential */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              6. Potential for Further Spread
            </label>
            <select
              value={factors.spreadPotential}
              onChange={(e) =>
                setFactors({ ...factors, spreadPotential: e.target.value as SeverityFactors['spreadPotential'] })
              }
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(SCORING_MATRIX.spreadPotential).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (+{item.points} pts)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Risk of automated propagation (worms, ransomware, lateral movement via domain admin).
            </p>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="p-5 rounded-xl border border-slate-700 bg-slate-950 p-5 space-y-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Calculated Risk Score
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold font-mono text-white">
                  {result.score}
                </span>
                <span className="text-sm text-slate-400">/ 100 Points</span>
                <SeverityBadge severity={result.suggestedSeverity} size="lg" />
              </div>
            </div>

            {/* Manual Override Selector */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyst Manual Override (Optional):</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(['Low', 'Medium', 'High', 'Critical'] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setManualOverride(manualOverride === level ? null : level)
                    }
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                      effectiveSeverity === level
                        ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Score Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                result.score >= 75
                  ? 'bg-rose-500'
                  : result.score >= 50
                  ? 'bg-amber-500'
                  : result.score >= 25
                  ? 'bg-cyan-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>

          {/* Rationale explanations */}
          <div className="space-y-1.5 text-xs">
            <span className="font-semibold text-slate-300">Assessment Justification:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              {result.rationale.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Apply Severity ({effectiveSeverity})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
