// context/DnDContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface DragItem {
  type: 'collection' | 'magazine' | 'page' | 'cutout';
  id: string;
  data: any; // Additional data specific to each type
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragPosition: { x: number; y: number } | null;
}

interface DnDContextType {
  dragState: DragState;
  startDrag: (item: DragItem, position: { x: number; y: number }) => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  endDrag: () => void;
  isValidDropTarget: (targetType: string) => boolean;
  isMouseDown: boolean;
  currentMousePosition: { x: number; y: number } | null;
}

const DnDContext = createContext<DnDContextType | undefined>(undefined);

interface DnDProviderProps {
  children: ReactNode;
}

export function DnDProvider({ children }: DnDProviderProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItem: null,
    dragPosition: null,
  });

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Global mouse tracking
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCurrentMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsMouseDown(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = (item: DragItem, position: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      dragItem: item,
      dragPosition: position,
    });
  };

  const updateDragPosition = (position: { x: number; y: number }) => {
    setDragState(prev => ({
      ...prev,
      dragPosition: position,
    }));
  };

  const endDrag = () => {
    setDragState({
      isDragging: false,
      dragItem: null,
      dragPosition: null,
    });
  };

  const isValidDropTarget = (targetType: string): boolean => {
    if (!dragState.dragItem) return false;
    
    // Define drop rules
    const dropRules: Record<string, string[]> = {
      'material-space': ['collection'], // Collections can be dropped on MaterialSpace
      'magazine': ['page'], // Pages can be dropped on Magazine
      'canvas': ['page', 'cutout'], // Pages and cutouts can be dropped on canvas
      'look-up-button': ['cutout'], // Cutouts can be dropped on look up button
    };
    
    return dropRules[targetType]?.includes(dragState.dragItem.type) || false;
  };

  const value: DnDContextType = {
    dragState,
    startDrag,
    updateDragPosition,
    endDrag,
    isValidDropTarget,
    isMouseDown,
    currentMousePosition,
  };

  return (
    <DnDContext.Provider value={value}>
      {children}
      {/* Drag Preview */}
      {dragState.isDragging && dragState.dragPosition && dragState.dragItem && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: dragState.dragPosition.x,
            top: dragState.dragPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {dragState.dragItem.type === 'collection' && (
            <div className="w-32 bg-neutral-800 border-2 border-neutral-600 shadow-2xl opacity-80">
              <div className="w-full aspect-[3/4] bg-neutral-900 overflow-hidden flex items-center justify-center">
                {dragState.dragItem.data.coverImage ? (
                  <img 
                    src={dragState.dragItem.data.coverImage} 
                    alt={dragState.dragItem.data.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-neutral-500 text-2xl">📁</div>
                )}
              </div>
              <div className="p-2 text-center">
                <p className="text-white text-[10px] font-bold uppercase">{dragState.dragItem.data.title}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const context = useContext(DnDContext);
  if (context === undefined) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
}

// Helper hook for drag operations
export function useDragHandler() {
  const { startDrag, updateDragPosition, endDrag } = useDnD();

  const handleMouseDown = (
    e: React.MouseEvent,
    item: DragItem,
    onDragStart?: () => void
  ) => {
    e.preventDefault();
    const startPos = { x: e.clientX, y: e.clientY };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = { x: moveEvent.clientX, y: moveEvent.clientY };
      
      // Start drag if we've moved enough (prevents accidental drags on clicks)
      const distance = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
      );
      
      if (distance > 5) {
        startDrag(item, currentPos);
        onDragStart?.();
        document.removeEventListener('mousemove', handleMouseMove);
        
        // Switch to drag mode
        const handleDragMove = (dragEvent: MouseEvent) => {
          updateDragPosition({ x: dragEvent.clientX, y: dragEvent.clientY });
        };
        
        const handleDragEnd = () => {
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

  return { handleMouseDown };
}

// Helper component for drop zones
interface DropZoneProps {
  onDrop: (item: DragItem) => void;
  targetType: string;
  children: ReactNode;
  className?: string;
}

export function DropZone({ onDrop, targetType, children, className = '' }: DropZoneProps) {
  const { dragState, isValidDropTarget, endDrag } = useDnD();
  const [isHovered, setIsHovered] = useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const isValidTarget = isValidDropTarget(targetType);
  const showDropIndicator = dragState.isDragging && isValidTarget && isHovered;

  const handleMouseEnter = () => {
    console.log("DropZone mouseEnter - isDragging:", dragState.isDragging, "isValidTarget:", isValidTarget);
    if (dragState.isDragging && isValidTarget) {
      console.log("Setting hovered to true");
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    console.log("DropZone mouseLeave");
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    console.log("DropZone mouseUp - isDragging:", dragState.isDragging, "isValidTarget:", isValidTarget, "isHovered:", isHovered, "dragItem:", dragState.dragItem);
    
    // Check if the drop position is within this drop zone
    if (dragState.isDragging && isValidTarget && dragState.dragItem && dragState.dragPosition && dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      const isInBounds = 
        dragState.dragPosition.x >= rect.left &&
        dragState.dragPosition.x <= rect.right &&
        dragState.dragPosition.y >= rect.top &&
        dragState.dragPosition.y <= rect.bottom;
      
      console.log("Position check - x:", dragState.dragPosition.x, "y:", dragState.dragPosition.y);
      console.log("Bounds - left:", rect.left, "right:", rect.right, "top:", rect.top, "bottom:", rect.bottom);
      console.log("Is in bounds:", isInBounds);
      
      if (isInBounds) {
        console.log("Calling onDrop with item:", dragState.dragItem);
        onDrop(dragState.dragItem);
      }
    }
    setIsHovered(false);
  };

  return (
    <div
      ref={dropZoneRef}
      className={`${className} ${showDropIndicator ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 bg-opacity-10' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
}