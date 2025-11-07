"use client";

import { MousePointer, Scissors, Hand, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";

type Tool = "pointer" | "scissors" | "hand";

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<Tool>("pointer");
  const [position, setPosition] = useState({ x: 32, y: 300 }); // left-8 = 32px, approximate center
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const tools = [
    { id: "pointer" as Tool, icon: MousePointer, label: "Pointer" },
    { id: "scissors" as Tool, icon: Scissors, label: "Scissors" },
    { id: "hand" as Tool, icon: Hand, label: "Hand" },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
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
    <div
      className="absolute z-30 flex flex-col bg-white rounded-lg shadow-lg"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
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
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-3 rounded-lg transition-colors ${
                activeTool === tool.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={tool.label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
