"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ToolType = "pointer" | "scissors-rectangle" | "scissors-freehand" | "hand";

interface AppContextType {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  toolbarPosition: { x: number; y: number };
  setToolbarPosition: (position: { x: number; y: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentTool, setCurrentTool] = useState<ToolType>("pointer");
  const [toolbarPosition, setToolbarPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 300 : 0, 
    y: 32 
  });

  return (
    <AppContext.Provider value={{ currentTool, setCurrentTool, toolbarPosition, setToolbarPosition }}>
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
