"use client";

import { useRef } from "react";
import { useDragHandler, DragItem } from '@/context/DnDContext';

interface CollectionProps {
  id: string;
  coverImage?: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}

export default function Collection({ id, coverImage, title, subtitle, onClick }: CollectionProps) {
  const { handleMouseDown } = useDragHandler();
  const isDraggingRef = useRef(false);

  const dragItem: DragItem = {
    type: 'collection',
    id,
    data: {
      id,
      title,
      subtitle,
      coverImage,
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    isDraggingRef.current = false;
    handleMouseDown(e, dragItem, () => {
      isDraggingRef.current = true;
    });
  };

  const handleClick = () => {
    if (!isDraggingRef.current) {
      onClick();
    }
    isDraggingRef.current = false;
  };

  return (
    <button
      onMouseDown={handleDragStart}
      onClick={handleClick}
      className="w-full flex flex-col gap-2 p-2  hover:bg-neutral-600 transition-colors group"
    >
      {/* Cover Image - magazine style (taller than wide) */}
      <div className="w-full aspect-[3/4] bg-neutral-800  overflow-hidden flex items-center justify-center border-2 border-neutral-600 group-hover:border-neutral-500">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-neutral-500 text-3xl">📁</div>
        )}
      </div>
      
      {/* Title - centered, uppercase */}
      <div className="text-center">
        <p className="text-white text-xs font-bold uppercase italic tracking-wide">{title}</p>
        {subtitle && (
          <p className="text-neutral-400 text-[10px] font-sans truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </button>
  );
}
