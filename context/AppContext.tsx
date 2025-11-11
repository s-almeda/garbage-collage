"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CollectionListItem } from "@/lib/types/collections";

export type ToolType = "pointer" | "scissors-rectangle" | "scissors-freehand" | "hand";

export interface MagazineInstance {
  id: string;
  collection: any;
  position: { x: number; y: number };
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

  const updateMagazinePosition = (id: string, position: { x: number; y: number }) => {
    setMagazines(prev => 
      prev.map(mag => 
        mag.id === id ? { ...mag, position } : mag
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
