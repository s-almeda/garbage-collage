"use client";

import { useRef, useState, useEffect } from "react";
import { useApp, Cutout as CutoutType } from "@/context/AppContext";

interface CutoutProps {
  cutout: CutoutType;
}

export default function Cutout({ cutout }: CutoutProps) {
  const { currentTool, updateCutoutPosition, removeCutout } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cutoutRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool !== "hand") return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - cutout.position.x,
      y: e.clientY - cutout.position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    updateCutoutPosition(cutout.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={cutout.imageData}
        alt="Cutout"
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
}
