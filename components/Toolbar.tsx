"use client";

import { MousePointer, Scissors, Hand, GripVertical, Square, LineSquiggle } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

type Tool = "pointer" | "scissors" | "hand";
type ScissorMode = "rectangle" | "freehand";

export default function Toolbar() {
  const { currentTool, setCurrentTool, toolbarPosition, setToolbarPosition } = useApp();
  const [activeTool, setActiveTool] = useState<Tool>("pointer");
  const [scissorMode, setScissorMode] = useState<ScissorMode>("rectangle");
  const [showScissorDrawer, setShowScissorDrawer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const tools = [
    { id: "pointer" as Tool, icon: MousePointer, label: "Pointer" },
    { id: "scissors" as Tool, icon: Scissors, label: "Scissors" },
    { id: "hand" as Tool, icon: Hand, label: "Hand" },
  ];

  const scissorModes = [
    { id: "rectangle" as ScissorMode, icon: Square, label: "Rectangle Select" },
    { id: "freehand" as ScissorMode, icon: LineSquiggle, label: "Freehand Select" },
  ];

  const handleToolClick = (toolId: Tool) => {
    setActiveTool(toolId);
    if (toolId === "scissors") {
      setShowScissorDrawer(true);
    } else {
      setShowScissorDrawer(false);
      // Update global tool for non-scissor tools
      setCurrentTool(toolId);
    }
  };

  const handleScissorModeClick = (mode: ScissorMode) => {
    setScissorMode(mode);
    // Update global tool with specific scissor mode
    setCurrentTool(`scissors-${mode}` as any);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - toolbarPosition.x,
      y: e.clientY - toolbarPosition.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setToolbarPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div className="absolute z-30" style={{ left: `${toolbarPosition.x}px`, top: `${toolbarPosition.y}px` }}>
      {/* Main toolbar */}
      <div className="flex flex-col bg-stone-300 rounded-lg shadow-lg">
        {/* Draggable handle */}
        <div
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing p-2 border-b border-gray-200 flex justify-center"
        >
          <GripVertical size={20} className="text-gray-400" />
        </div>

        {/* Tool buttons */}
        <div className="p-2 flex flex-col gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.id} className="relative">
                <button
                  onClick={() => handleToolClick(tool.id)}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTool === tool.id
                      ? "bg-stone-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title={tool.label}
                >
                  <Icon size={24} />
                </button>

                {/* Scissor drawer - positioned absolutely to not affect layout */}
                {tool.id === "scissors" && showScissorDrawer && (
                  <div className="absolute left-[calc(100%+4px)] top-0 bg-stone-300 rounded-lg shadow-lg p-2 top-[-8]  flex flex-row gap-2 animate-in slide-in-from-left">
                    {scissorModes.map((mode) => {
                      const ModeIcon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => handleScissorModeClick(mode.id)}
                          className={`p-3 rounded-lg transition-colors ${
                            scissorMode === mode.id
                              ? "bg-stone-100 text-stone-600 border-2 border-stone-500"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                          title={mode.label}
                        >
                          <ModeIcon size={24} strokeDasharray="4 4" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
