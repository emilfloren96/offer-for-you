import { useState, useRef, useCallback } from 'react';
import {
  deriveQuantity,
  type Material,
  type SelectedMaterial,
  type CustomerInfo,
  type OfferLineItem,
} from '../data/materials';

const BACKEND = 'http://localhost:3001';

export interface HouseConfiguratorState {
  selectedPart: string | null;
  setSelectedPart: (part: string | null) => void;
  selectedShape: string;
  selectedFloors: number;
  selectedWindows: number;
  meshAreas: Record<string, number>;
  selections: Record<string, SelectedMaterial>;
  offerFormOpen: boolean;
  cartModalOpen: boolean;
  offerRef: React.RefObject<HTMLDivElement | null>;
  runningTotal: number;
  categoryColours: Record<string, number>;
  hasSelections: boolean;
  handleAreasCalculated: (areas: Record<string, number>) => void;
  handleSelectShape: (shape: string) => void;
  handleSelectFloors: (floors: number) => void;
  handleSelectWindows: (count: number) => void;
  handleSelectMaterial: (category: string, material: Material) => void;
  handleCartAddMore: () => void;
  handleCartSubmit: () => void;
  handleOpenOfferForm: () => void;
  handleCloseOfferForm: () => void;
  /** Close the offer form panel without resetting selections */
  dismissOfferForm: () => void;
  handleSubmitOffer: (customer: CustomerInfo) => Promise<void>;
}

export const useHouseConfigurator = (): HouseConfiguratorState => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState('rectangular');
  const [selectedFloors, setSelectedFloors] = useState(1);
  const [selectedWindows, setSelectedWindows] = useState(4);
  const [meshAreas, setMeshAreas] = useState<Record<string, number>>({});
  const [selections, setSelections] = useState<Record<string, SelectedMaterial>>({});
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const offerRef = useRef<HTMLDivElement | null>(null);

  const runningTotal =
    Math.round(Object.values(selections).reduce((sum, sel) => sum + sel.lineTotal, 0) * 100) / 100;

  const categoryColours: Record<string, number> = Object.fromEntries(
    Object.entries(selections).map(([cat, sel]) => [cat, sel.material.colour])
  );

  const hasSelections = Object.keys(selections).length > 0;

  const handleAreasCalculated = useCallback((areas: Record<string, number>) => {
    setMeshAreas(areas);
  }, []);

  const handleSelectShape = (shape: string) => {
    setSelectedShape(shape);
    setMeshAreas({});
    setSelections({});
    setSelectedPart(null);
    setOfferFormOpen(false);
  };

  const handleSelectFloors = (floors: number) => {
    setSelectedFloors(floors);
    setMeshAreas({});
    setSelections({});
    setSelectedPart(null);
    setOfferFormOpen(false);
  };

  const handleSelectWindows = (count: number) => {
    setSelectedWindows(count);
    setSelections((prev) => {
      if (!prev['windows']) return prev;
      const sel = prev['windows'];
      const lineTotal = Math.round(sel.material.price * count * 100) / 100;
      return { ...prev, windows: { ...sel, quantity: count, lineTotal } };
    });
  };

  const handleSelectMaterial = (category: string, material: Material) => {
    const area = meshAreas[category] ?? 0;
    const quantity = category === 'windows' ? selectedWindows : deriveQuantity(material.unit, area);
    const lineTotal = Math.round(material.price * quantity * 100) / 100;
    setSelections((prev) => ({
      ...prev,
      [category]: { category, material, quantity, lineTotal },
    }));
    setCartModalOpen(true);
  };

  const handleCartAddMore = () => {
    setCartModalOpen(false);
    setSelectedPart(null);
  };

  const handleCartSubmit = () => {
    setCartModalOpen(false);
    setSelectedPart(null);
    setOfferFormOpen(true);
    setTimeout(() => offerRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleOpenOfferForm = () => {
    setOfferFormOpen(true);
    setTimeout(() => offerRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleCloseOfferForm = () => {
    setOfferFormOpen(false);
    setSelectedPart(null);
    setSelections({});
  };

  const dismissOfferForm = () => {
    setOfferFormOpen(false);
  };

  const handleSubmitOffer = async (customer: CustomerInfo): Promise<void> => {
    const items: OfferLineItem[] = Object.values(selections).map((sel) => ({
      category: sel.category,
      materialId: sel.material.id,
      materialName: sel.material.name,
      unit: sel.material.unit,
      quantity: sel.quantity,
      unitPrice: sel.material.price,
      lineTotal: sel.lineTotal,
    }));

    const res = await fetch(`${BACKEND}/api/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        shape: selectedShape,
        floors: selectedFloors,
        totalPrice: runningTotal,
        items,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Kunde inte skicka offert');
    }
  };

  return {
    selectedPart,
    setSelectedPart,
    selectedShape,
    selectedFloors,
    selectedWindows,
    meshAreas,
    selections,
    offerFormOpen,
    cartModalOpen,
    offerRef,
    runningTotal,
    categoryColours,
    hasSelections,
    handleAreasCalculated,
    handleSelectShape,
    handleSelectFloors,
    handleSelectWindows,
    handleSelectMaterial,
    handleCartAddMore,
    handleCartSubmit,
    handleOpenOfferForm,
    handleCloseOfferForm,
    dismissOfferForm,
    handleSubmitOffer,
  };
};
