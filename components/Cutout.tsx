"use client";

import { useRef, useState, useEffect } from "react";
import { useApp, Cutout as CutoutType } from "@/context/AppContext";
import { useDnD } from "@/context/DnDContext";

interface CutoutProps {
  cutout: CutoutType;
}

export default function Cutout({ cutout }: CutoutProps) {
  const { currentTool, updateCutoutPosition, removeCutout } = useApp();
  const { startDrag, updateDragPosition, endDrag } = useDnD();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cutoutRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool !== "hand") return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startPos = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: e.clientX - cutout.position.x,
      y: e.clientY - cutout.position.y,
    });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = { x: moveEvent.clientX, y: moveEvent.clientY };
      
      // Start drag if we've moved enough (prevents accidental drags on clicks)
      const distance = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
      );
      
      if (distance > 5) {
        setIsDragging(true);
        // Start DnD context drag
        startDrag({
          type: 'cutout',
          id: cutout.id,
          data: cutout
        }, currentPos);
        
        document.removeEventListener('mousemove', handleMouseMove);
        
        // Switch to drag mode
        const handleDragMove = (dragEvent: MouseEvent) => {
          const newX = dragEvent.clientX - dragOffset.x;
          const newY = dragEvent.clientY - dragOffset.y;
          
          updateCutoutPosition(cutout.id, { x: newX, y: newY });
          updateDragPosition({ x: dragEvent.clientX, y: dragEvent.clientY });
        };
        
        const handleDragEnd = () => {
          setIsDragging(false);
          endDrag();
          document.removeEventListener('mousemove', handleDragMove);
          document.removeEventListener('mouseup', handleDragEnd);
        };
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getCursorClass = () => {
    if (currentTool === "hand") {
      return isDragging ? "cursor-grabbing" : "cursor-grab";
    }
    return "cursor-default";
  };

  return (
    <div
      ref={cutoutRef}
      className={`absolute ${getCursorClass()}`}
      style={{
        left: cutout.position.x,
        top: cutout.position.y,
        width: cutout.size.width,
        height: cutout.size.height,
        zIndex: 20,
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
      }}
      onMouseDown={handleMouseDown}
    >
      {cutout.imageData ? (
        <img
          src={cutout.imageData}
          alt="Cutout"
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-stone-400/30 border-2 border-dashed border-stone-400 flex items-center justify-center">
          <span className="text-stone-500 text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
}
