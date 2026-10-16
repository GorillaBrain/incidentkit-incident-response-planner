import React from 'react'
import type { Incident, SeverityLevel, IncidentStatus } from '../../types/incident'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

export interface SeverityChartProps {
  incidents: Incident[];
}

export const SeverityChart: React.FC<SeverityChartProps> = ({ incidents }) => {
  // Aggregate by severity
  const severityCounts: Record<SeverityLevel, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  // Aggregate by status
  const statusCounts: Record<IncidentStatus, number> = {
    New: 0,
    Investigating: 0,
    Contained: 0,
    Recovering: 0,
    Resolved: 0,
    Closed: 0,
  };

  incidents.forEach((inc) => {
    if (severityCounts[inc.severity] !== undefined) {
      severityCounts[inc.severity]++;
    }
    if (statusCounts[inc.status] !== undefined) {
      statusCounts[inc.status]++;
    }
  });

  const severityData = [
    { name: 'Critical', count: severityCounts.Critical, color: '#f43f5e' }, // rose-500
    { name: 'High', count: severityCounts.High, color: '#f59e0b' },     // amber-500
    { name: 'Medium', count: severityCounts.Medium, color: '#06b6d4' },   // cyan-500
    { name: 'Low', count: severityCounts.Low, color: '#64748b' },      // slate-500
  ];

  const statusData = [
    { name: 'New', count: statusCounts.New, color: '#6366f1' },
    { name: 'Investigating', count: statusCounts.Investigating, color: '#0ea5e9' },
    { name: 'Contained', count: statusCounts.Contained, color: '#f59e0b' },
    { name: 'Recovering', count: statusCounts.Recovering, color: '#a855f7' },
    { name: 'Resolved', count: statusCounts.Resolved, color: '#10b981' },
    { name: 'Closed', count: statusCounts.Closed, color: '#64748b' },
  ].filter((d) => d.count > 0);

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Severity Distribution Bar Chart */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Severity Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Incidents classified by risk level
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {incidents.length} Total
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: unknown) => [String(val), 'Incidents']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-slate-800/80 text-center">
          {severityData.map((item) => (
            <div key={item.name} className="flex flex-col items-center">
              <span className="text-[11px] text-slate-400">{item.name}</span>
              <span className="text-sm font-bold font-mono text-white mt-0.5">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Status Pipeline */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Lifecycle Status Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Response phase progression
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {incidents.filter((i) => i.status !== 'Closed' && i.status !== 'Resolved').length} Active
          </span>
        </div>

        <div className="h-52 w-full flex items-center justify-center">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [String(val), 'Incidents']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-500">No active incidents</div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 pt-3 border-t border-slate-800/80 text-xs">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300">{item.name}</span>
              <span className="font-mono text-slate-400 font-bold">({item.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
