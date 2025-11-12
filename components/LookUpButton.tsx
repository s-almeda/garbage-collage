"use client";

import { useState, useEffect, useRef } from "react";
import { useDnD } from "@/context/DnDContext";
import { useApp } from "@/context/AppContext";

interface LookUpButtonProps {
  onToggle: () => void;
}

export default function LookUpButton({ onToggle }: LookUpButtonProps) {
  const { dragState, currentMousePosition } = useDnD();
  const { removeCutout, setTransitioningCutout } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverStartTimeRef = useRef<number | null>(null);

  const isDraggingCutout = dragState.isDragging && dragState.dragItem?.type === 'cutout';

  const HOLD_DURATION = 500; // 0.5 seconds

  useEffect(() => {
    const checkHover = () => {
      if (!buttonRef.current || !dragState.dragPosition || !isDraggingCutout) {
        if (isHovered) {
          setIsHovered(false);
          hoverStartTimeRef.current = null;
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
          }
        }
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const isInBounds =
        dragState.dragPosition.x >= rect.left &&
        dragState.dragPosition.x <= rect.right &&
        dragState.dragPosition.y >= rect.top &&
        dragState.dragPosition.y <= rect.bottom;

      if (isInBounds && !isHovered) {
        // Just entered
        setIsHovered(true);
        hoverStartTimeRef.current = Date.now();

        // Set timer to trigger action
        hoverTimerRef.current = setTimeout(() => {
          console.log("🚀 Hold complete! Transitioning cutout to canvas");
          
          // Get the cutout being dragged
          const cutout = dragState.dragItem?.data;
          if (cutout && currentMousePosition) {
            // Check if image data is loaded
            if (!cutout.imageData || cutout.imageData === '') {
              console.warn("⚠️ Cutout image not loaded yet, cannot transition");
              alert("Please wait for the cutout to finish loading before moving it to the canvas.");
              return;
            }
            
            // Calculate mouse offset (where user grabbed the cutout)
            const mouseOffset = {
              x: currentMousePosition.x - cutout.position.x,
              y: currentMousePosition.y - cutout.position.y
            };
            
            // Set transitioning state for AssemblySpace to pick up
            setTransitioningCutout({ cutout, mouseOffset });
            
            // Remove from MaterialSpace
            removeCutout(cutout.id);
            
            // Switch to AssemblySpace
            onToggle();
          }
          
          hoverStartTimeRef.current = null;
        }, HOLD_DURATION);
      } else if (!isInBounds && isHovered) {
        // Just left
        setIsHovered(false);
        hoverStartTimeRef.current = null;
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
      }
    };

    if (isDraggingCutout) {
      const interval = setInterval(checkHover, 50);
      return () => clearInterval(interval);
    }
  }, [dragState.dragPosition, isDraggingCutout, isHovered, onToggle, currentMousePosition, removeCutout, setTransitioningCutout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const isActive = isDraggingCutout && isHovered;

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      className={`absolute top-8 left-1/2 -translate-x-1/2 font-semibold shadow-lg transition-all duration-200 z-10 ${
        isActive
          ? 'px-12 py-6 bg-white/50 text-stone-800 rounded-2xl text-xl scale-125'
          : 'px-6 py-3 bg-white text-stone-800 rounded-lg hover:bg-stone-100'
      }`}
      style={{
        pointerEvents: isDraggingCutout ? 'none' : 'auto',
      }}
    >
      <div className="relative">
        {isActive ? 'move to canvas' : 'look up'}
      </div>
    </button>
  );
}
