import { useState } from 'react';
import { CATEGORY_LABELS_SV, UNIT_LABEL, type SelectedMaterial } from '../data/materials';

interface CostSummaryProps {
  selections: Record<string, SelectedMaterial>;
  total: number;
  onOpenOfferForm: () => void;
}

export function CostSummary({ selections, total, onOpenOfferForm }: CostSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const items = Object.values(selections);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Breakdown (collapsible) */}
      {expanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 border-b border-gray-100">
          <div className="space-y-1">
            {items.map((sel) => (
              <div key={sel.category} className="flex justify-between text-sm">
                <span style={{ opacity: 0.75 }}>
                  {CATEGORY_LABELS_SV[sel.category]}: {sel.material.name}
                  <span className="ml-2 text-xs" style={{ opacity: 0.5 }}>
                    {sel.quantity} {UNIT_LABEL[sel.material.unit]} × {sel.material.price.toLocaleString('sv-SE')} kr
                  </span>
                </span>
                <span className="font-semibold ml-4 shrink-0">
                  {sel.lineTotal.toLocaleString('sv-SE')} kr
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Toggle breakdown */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--text-main)' }}
        >
          <span>{expanded ? '▾' : '▸'}</span>
          <span className="hidden sm:inline">{items.length} val</span>
        </button>

        {/* Total */}
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.5 }}>
            Totalt
          </span>
          <div className="text-lg font-extrabold" style={{ color: 'var(--primary-blue)' }}>
            {total.toLocaleString('sv-SE')} kr
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onOpenOfferForm}
          className="px-5 sm:px-8 py-2.5 text-white font-semibold text-sm transition hover:opacity-90 shrink-0"
          style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
        >
          Skicka Offert
        </button>
      </div>
    </div>
  );
}
