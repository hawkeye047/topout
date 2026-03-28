'use client';
import { useState, useMemo } from 'react';
import { addChangeOrder, saveProject } from '@/lib/dataModel';
import { formatDate } from '@/lib/utils';

const CO_REASONS = [
  { key: 'owner-change', label: 'Owner Change' },
  { key: 'design-change', label: 'Design Change' },
  { key: 'unforeseen-condition', label: 'Unforeseen Condition' },
  { key: 'code-requirement', label: 'Code Requirement' },
  { key: 'value-engineering', label: 'Value Engineering' },
];

const CO_STATUS_STYLES = {
  pending: 'bg-primary/20 text-primary',
  approved: 'bg-tertiary/20 text-tertiary',
  rejected: 'bg-error-container text-on-error-container',
};

export default function CostDashboard({ project, onProjectUpdate, isReadOnly }) {
  const [showAddCO, setShowAddCO] = useState(false);
  const [coForm, setCoForm] = useState({ description: '', reason: 'owner-change', costImpact: '', scheduleImpact: '' });

  const costs = useMemo(() => {
    const phases = project.schedule.phases;
    let totalBudgeted = 0;
    let totalActual = 0;
    const perPhase = phases.map((phase) => {
      let phaseBudgeted = 0;
      let phaseActual = 0;
      for (const act of phase.activities) {
        phaseBudgeted += act.budgetedCost || 0;
        phaseActual += act.actualCost || 0;
      }
      totalBudgeted += phaseBudgeted;
      totalActual += phaseActual;
      return { name: phase.name, budgeted: phaseBudgeted, actual: phaseActual };
    });

    const approvedCOs = (project.changeOrders || [])
      .filter((co) => co.status === 'approved')
      .reduce((sum, co) => sum + (co.costImpact || 0), 0);

    const projectedBudget = (project.schedule.totalBudget || totalBudgeted) + approvedCOs;

    return { totalBudgeted: project.schedule.totalBudget || totalBudgeted, totalActual, approvedCOs, projectedBudget, perPhase };
  }, [project]);

  const maxPhaseCost = Math.max(...costs.perPhase.map((p) => Math.max(p.budgeted, p.actual)), 1);

  const handleAddCO = () => {
    const updated = JSON.parse(JSON.stringify(project));
    addChangeOrder(updated, {
      description: coForm.description,
      reason: coForm.reason,
      costImpact: parseFloat(coForm.costImpact) || 0,
      scheduleImpact: parseInt(coForm.scheduleImpact) || 0,
    });
    // Update projected budget
    const approvedCOs = updated.changeOrders
      .filter((co) => co.status === 'approved')
      .reduce((sum, co) => sum + (co.costImpact || 0), 0);
    updated.schedule.projectedBudget = (updated.schedule.totalBudget || 0) + approvedCOs;
    saveProject(updated);
    onProjectUpdate(updated);
    setCoForm({ description: '', reason: 'owner-change', costImpact: '', scheduleImpact: '' });
    setShowAddCO(false);
  };

  const handleCOStatusChange = (coId, newStatus) => {
    const updated = JSON.parse(JSON.stringify(project));
    const co = updated.changeOrders.find((c) => c.id === coId);
    if (co) co.status = newStatus;
    // Recalculate projected budget
    const approvedCOs = updated.changeOrders
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + (c.costImpact || 0), 0);
    updated.schedule.projectedBudget = (updated.schedule.totalBudget || 0) + approvedCOs;
    saveProject(updated);
    onProjectUpdate(updated);
  };

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Budget Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/10">
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Original Budget</p>
          <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">
            ${(costs.totalBudgeted / 1000000).toFixed(2)}M
          </h3>
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Approved COs</p>
          <h3 className={`text-2xl font-black font-headline tracking-tight ${costs.approvedCOs > 0 ? 'text-primary' : 'text-on-surface'}`}>
            {costs.approvedCOs >= 0 ? '+' : ''}${Math.abs(costs.approvedCOs).toLocaleString()}
          </h3>
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Projected Total</p>
          <h3 className="text-2xl font-black font-headline tracking-tight text-primary">
            ${(costs.projectedBudget / 1000000).toFixed(2)}M
          </h3>
        </div>
        <div className="bg-surface-container-low p-5">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Billed to Date</p>
          <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">
            ${costs.totalActual.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Per-Phase Cost Bars */}
      <div>
        <h3 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase mb-4">Cost by Phase</h3>
        <div className="bg-surface-container-low p-5 space-y-4">
          {costs.perPhase.filter((p) => p.budgeted > 0).map((phase) => (
            <div key={phase.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-on-surface uppercase tracking-tight">{phase.name}</span>
                <span className="text-[10px] font-bold text-secondary">
                  ${phase.budgeted.toLocaleString()}
                </span>
              </div>
              <div className="relative h-3 bg-surface-container-highest overflow-hidden">
                <div
                  className="absolute h-full bg-secondary/40"
                  style={{ width: `${(phase.budgeted / maxPhaseCost) * 100}%` }}
                />
                {phase.actual > 0 && (
                  <div
                    className="absolute h-full bg-primary"
                    style={{ width: `${(phase.actual / maxPhaseCost) * 100}%` }}
                  />
                )}
              </div>
            </div>
          ))}
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary/40" />
              <span className="text-[10px] font-bold text-secondary uppercase">Budgeted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary" />
              <span className="text-[10px] font-bold text-secondary uppercase">Actual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Order Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase">Change Orders</h3>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddCO(!showAddCO)}
              className="px-4 py-1.5 machine-gradient text-surface-container-lowest
                         font-headline font-bold text-[10px] uppercase tracking-widest
                         active:scale-95 transition-transform"
            >
              {showAddCO ? 'Cancel' : 'Add CO'}
            </button>
          )}
        </div>

        {/* Add CO Form */}
        {showAddCO && (
          <div className="bg-surface-container-low p-5 mb-4 space-y-4 animate-fade-in">
            <div>
              <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Description</label>
              <input
                type="text"
                value={coForm.description}
                onChange={(e) => setCoForm({ ...coForm, description: e.target.value })}
                placeholder="What changed and why"
                className="w-full bg-surface-container p-3 text-on-surface text-sm
                           border-b-2 border-outline-variant focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Reason</label>
              <div className="flex flex-wrap gap-2">
                {CO_REASONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setCoForm({ ...coForm, reason: r.key })}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors
                      ${coForm.reason === r.key
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-secondary hover:bg-surface-container-high'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Cost Impact ($)</label>
                <input
                  type="number"
                  value={coForm.costImpact}
                  onChange={(e) => setCoForm({ ...coForm, costImpact: e.target.value })}
                  placeholder="+15000 or -5000"
                  className="w-full bg-surface-container p-3 text-on-surface text-sm
                             border-b-2 border-outline-variant focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-secondary tracking-widest uppercase mb-2">Schedule Impact (days)</label>
                <input
                  type="number"
                  value={coForm.scheduleImpact}
                  onChange={(e) => setCoForm({ ...coForm, scheduleImpact: e.target.value })}
                  placeholder="0"
                  className="w-full bg-surface-container p-3 text-on-surface text-sm
                             border-b-2 border-outline-variant focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddCO}
              disabled={!coForm.description.trim()}
              className="w-full py-3 machine-gradient text-surface-container-lowest
                         font-headline font-extrabold text-sm uppercase tracking-[0.2em]
                         disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Submit Change Order
            </button>
          </div>
        )}

        {/* CO Table */}
        {(project.changeOrders || []).length === 0 && !showAddCO ? (
          <div className="bg-surface-container-low p-8 text-center">
            <p className="text-secondary text-sm">No change orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(project.changeOrders || []).map((co) => (
              <div key={co.id} className="bg-surface-container-low p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-primary tracking-widest">{co.number}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${CO_STATUS_STYLES[co.status] || ''}`}>
                      {co.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-on-surface tracking-tight truncate">{co.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] text-secondary font-bold uppercase">{formatDate(co.date)}</span>
                    <span className="text-[10px] text-secondary font-bold uppercase">
                      {CO_REASONS.find((r) => r.key === co.reason)?.label || co.reason}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className={`text-lg font-black font-headline ${co.costImpact >= 0 ? 'text-error' : 'text-tertiary'}`}>
                    {co.costImpact >= 0 ? '+' : ''}${Math.abs(co.costImpact).toLocaleString()}
                  </div>
                  {co.scheduleImpact !== 0 && (
                    <div className="text-[10px] font-bold text-secondary">
                      {co.scheduleImpact > 0 ? '+' : ''}{co.scheduleImpact}d
                    </div>
                  )}
                  {!isReadOnly && co.status === 'pending' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleCOStatusChange(co.id, 'approved')}
                        className="text-[10px] font-bold text-tertiary hover:bg-tertiary/20 px-2 py-0.5"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleCOStatusChange(co.id, 'rejected')}
                        className="text-[10px] font-bold text-error hover:bg-error/20 px-2 py-0.5"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
