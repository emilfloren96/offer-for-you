import { useState } from 'react';
import { ModelViewer } from './components/ModelViewer';
import { OfferPanel } from './components/OfferPanel';

function App() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState('rectangular');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <ModelViewer
          selectedPart={selectedPart}
          onSelectPart={setSelectedPart}
          selectedShape={selectedShape}
          onSelectShape={setSelectedShape}
        />
        {selectedPart && (
          <OfferPanel
            partId={selectedPart}
            onClose={() => setSelectedPart(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
