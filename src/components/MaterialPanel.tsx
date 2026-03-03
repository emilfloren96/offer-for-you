import {
  MATERIAL_LIBRARY,
  MESH_TO_MATERIAL,
  UNIT_LABEL,
  CATEGORY_LABELS_SV,
  type Material,
  type SelectedMaterial,
} from '../data/materials';

interface MaterialPanelProps {
  category: string;
  area: number;
  currentSelection: SelectedMaterial | null;
  onSelectMaterial: (material: Material) => void;
  windowCount: number;
  onChangeWindowCount: (count: number) => void;
  onOpenOfferForm: () => void;
  onClose: () => void;
}

export function MaterialPanel({
  category,
  area,
  currentSelection,
  onSelectMaterial,
  windowCount,
  onChangeWindowCount,
  onOpenOfferForm,
  onClose,
}: MaterialPanelProps) {
  const matCategory = MESH_TO_MATERIAL[category];
  const materials = matCategory ? MATERIAL_LIBRARY[matCategory] : null;
  const titleSv = CATEGORY_LABELS_SV[category] ?? category;

  return (
    <div className="bg-white shadow-lg p-6 sm:p-8" style={{ borderRadius: 'var(--border-radius)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--primary-blue)' }}>
          {titleSv}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="w-12 h-[3px] mb-4" style={{ backgroundColor: 'var(--accent-red)' }} />

      {/* Area display */}
      {area > 0 && (
        <p className="text-sm mb-4" style={{ opacity: 0.6 }}>
          Beräknad yta: <strong>{area.toFixed(1)} m²</strong>
        </p>
      )}

      {/* Window count stepper — only for windows category */}
      {category === 'windows' && (
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50" style={{ borderRadius: 'var(--border-radius)' }}>
          <span className="text-sm font-semibold flex-1">Antal fönster</span>
          <button
            onClick={() => onChangeWindowCount(Math.max(1, windowCount - 1))}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold border border-gray-300 rounded transition hover:border-blue-400"
            style={{ color: 'var(--primary-blue)' }}
          >
            −
          </button>
          <span className="w-6 text-center font-bold text-base" style={{ color: 'var(--primary-blue)' }}>
            {windowCount}
          </span>
          <button
            onClick={() => onChangeWindowCount(Math.min(30, windowCount + 1))}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold border border-gray-300 rounded transition hover:border-blue-400"
            style={{ color: 'var(--primary-blue)' }}
          >
            +
          </button>
        </div>
      )}

      {materials ? (
        <>
          <p className="text-sm mb-4" style={{ opacity: 0.7 }}>
            Välj ett material för {titleSv.toLowerCase()}:
          </p>

          <div className="space-y-2 mb-6">
            {materials.map((mat) => {
              const isActive = currentSelection?.material.id === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => onSelectMaterial(mat)}
                  className="w-full flex items-center gap-3 p-3 text-left transition"
                  style={{
                    border: isActive
                      ? '2px solid var(--primary-blue)'
                      : '1px solid #e5e7eb',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: isActive ? '#f0f5ff' : '#fff',
                  }}
                >
                  {/* Colour swatch */}
                  <span
                    className="shrink-0 w-6 h-6 rounded-sm border border-gray-200"
                    style={{ backgroundColor: `#${mat.colour.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="flex-1 font-medium text-sm">{mat.name}</span>
                  <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--primary-blue)' }}>
                    {mat.price.toLocaleString('sv-SE')} kr/{UNIT_LABEL[mat.unit]}
                  </span>
                  {isActive && (
                    <span className="text-xs font-bold shrink-0" style={{ color: 'var(--primary-blue)' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
          Klicka på en annan del av modellen för att välja material, eller skicka en offertförfrågan för {titleSv.toLowerCase()}.
        </p>
      )}

      <button
        onClick={onOpenOfferForm}
        className="w-full py-3 text-white font-semibold transition hover:opacity-90"
        style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
      >
        Skicka Offert
      </button>
    </div>
  );
}
