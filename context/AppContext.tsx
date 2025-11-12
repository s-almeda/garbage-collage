"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CollectionListItem } from "@/lib/types/collections";

export type ToolType = "pointer" | "scissors-rectangle" | "scissors-freehand" | "hand";

export interface MagazineInstance {
  id: string;
  collection: any;
  position: { x: number; y: number };
}

export interface Cutout {
  id: string;
  imageData: string; // base64 data URL
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface TransitioningCutout {
  cutout: Cutout;
  mouseOffset: { x: number; y: number };
}

export interface CompositionCanvas {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface AppContextType {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  toolbarPosition: { x: number; y: number };
  setToolbarPosition: (position: { x: number; y: number }) => void;
  collections: CollectionListItem[];
  setCollections: (collections: CollectionListItem[]) => void;
  isLoadingCollections: boolean;
  setIsLoadingCollections: (loading: boolean) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  magazines: MagazineInstance[];
  setMagazines: (magazines: MagazineInstance[]) => void;
  updateMagazinePosition: (id: string, position: { x: number; y: number }) => void;
  cutouts: Cutout[];
  setCutouts: (cutouts: Cutout[]) => void;
  addCutout: (cutout: Cutout) => void;
  removeCutout: (id: string) => void;
  updateCutoutPosition: (id: string, position: { x: number; y: number }) => void;
  updateCutout: (id: string, updates: Partial<Cutout>) => void;
  transitioningCutout: TransitioningCutout | null;
  setTransitioningCutout: (cutout: TransitioningCutout | null) => void;
  compositionCanvas: CompositionCanvas;
  setCompositionCanvas: (canvas: CompositionCanvas) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentTool, setCurrentTool] = useState<ToolType>("pointer");
  const [toolbarPosition, setToolbarPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0, 
    y: 32 
  });
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [currentUser, setCurrentUser] = useState("shm"); // Hardcoded for now
  const [magazines, setMagazines] = useState<MagazineInstance[]>([]);
  const [cutouts, setCutouts] = useState<Cutout[]>([]);
  const [transitioningCutout, setTransitioningCutout] = useState<TransitioningCutout | null>(null);
  const [compositionCanvas, setCompositionCanvas] = useState<CompositionCanvas>({
    position: { x: 0, y: 0 }, // Will be centered on mount
    size: { width: 600, height: 800 } // Portrait letter ratio (3:4)
  });

  const updateMagazinePosition = (id: string, position: { x: number; y: number }) => {
    setMagazines(prev => 
      prev.map(mag => 
        mag.id === id ? { ...mag, position } : mag
      )
    );
  };

  const addCutout = (cutout: Cutout) => {
    setCutouts(prev => [...prev, cutout]);
  };

  const removeCutout = (id: string) => {
    setCutouts(prev => prev.filter(c => c.id !== id));
  };

  const updateCutoutPosition = (id: string, position: { x: number; y: number }) => {
    setCutouts(prev =>
      prev.map(cutout =>
        cutout.id === id ? { ...cutout, position } : cutout
      )
    );
  };

  const updateCutout = (id: string, updates: Partial<Cutout>) => {
    setCutouts(prev =>
      prev.map(cutout =>
        cutout.id === id ? { ...cutout, ...updates } : cutout
      )
    );
  };

  return (
    <AppContext.Provider value={{ 
      currentTool, 
      setCurrentTool, 
      toolbarPosition, 
      setToolbarPosition,
      collections,
      setCollections,
      isLoadingCollections,
      setIsLoadingCollections,
      currentUser,
      setCurrentUser,
      magazines,
      setMagazines,
      updateMagazinePosition,
      cutouts,
      setCutouts,
      addCutout,
      removeCutout,
      updateCutoutPosition,
      updateCutout,
      transitioningCutout,
      setTransitioningCutout,
      compositionCanvas,
      setCompositionCanvas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
