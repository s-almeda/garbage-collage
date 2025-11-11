"use client";

import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import * as fabric from "fabric";
import { useApp } from "@/context/AppContext";
import { getCollection, getImageUrl } from "@/lib/api/collections";

interface MagazineProps {
  canvas: fabric.Canvas;
  collection?: any;
  position?: { x: number; y: number };
  id?: string;
}

interface PageProps {
  children: React.ReactNode;
  type?: 'text' | 'image';
  className?: string;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center p-4 bg-white border border-gray-200 ${props.className || ''}`} 
      ref={ref}
    >
      {props.children}
    </div>
  );
});

Page.displayName = "Page";

export default function Magazine({ canvas, collection, position, id }: MagazineProps) {
  const bookRef = useRef<any>(null);
  const magazineRef = useRef<HTMLDivElement>(null);
  const { currentTool, updateMagazinePosition } = useApp();
  const [collectionData, setCollectionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const magazineStartPos = useRef<{ x: number; y: number } | null>(null);

  // Fetch full collection data when collection prop changes
  useEffect(() => {
    if (collection?.id) {
      setIsLoading(true);
      getCollection(collection.id)
        .then(data => {
          console.log('Loaded collection data:', data);
          setCollectionData(data);
        })
        .catch(error => {
          console.error('Failed to load collection:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [collection?.id]);

  const getCursorClass = () => {
    if (currentTool === "hand") return "cursor-grab active:cursor-grabbing";
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") return "cursor-crosshair";
    return "cursor-default";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === "hand" && id && position) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      magazineStartPos.current = { ...position };
    }
  };

  useEffect(() => {
    if (!isDragging || !id) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartPos.current && magazineStartPos.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        const newPosition = {
          x: magazineStartPos.current.x + deltaX,
          y: magazineStartPos.current.y + deltaY
        };
        
        updateMagazinePosition(id, newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartPos.current = null;
      magazineStartPos.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, updateMagazinePosition]);

  const positionStyle = position ? {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)'
  } : {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  };

  // Default spreads if no collection data
  const defaultSpreads = [
    { left: "bg-red-500", right: "bg-blue-500" },
    { left: "bg-green-500", right: "bg-yellow-500" },
    { left: "bg-purple-500", right: "bg-orange-500" },
  ];

  // Render loading state
  if (collection && isLoading) {
    return (
      <div 
        className={`absolute z-20 ${getCursorClass()}`}
        style={positionStyle}
      >
        <div className="w-[400px] h-[500px] bg-white border-2 border-gray-300 flex items-center justify-center">
          <div className="text-gray-500">Loading collection...</div>
        </div>
      </div>
    );
  }

  // Generate pages from collection data
  const generatePages = () => {
    if (!collectionData?.pages) {
      // Fallback to default spreads
      return defaultSpreads.flatMap((spread, index) => [
        <Page key={`left-${index}`} className={spread.left}>
          <h2 className="text-6xl font-bold text-white">L{index + 1}</h2>
        </Page>,
        <Page key={`right-${index}`} className={spread.right}>
          <h2 className="text-6xl font-bold text-white">R{index + 1}</h2>
        </Page>,
      ]);
    }

    const pages = collectionData.pages;
    const renderedPages = [];

    // Add cover page
    renderedPages.push(
      <Page key="cover" type="image" className="bg-gray-100">
        <div className="text-center">
          {collectionData.cover_image ? (
            <img 
              src={getImageUrl(collectionData.cover_image)} 
              alt={collectionData.name}
              className="max-w-full max-h-80 object-contain mb-4"
            />
          ) : (
            <div className="w-32 h-40 bg-gray-300 mb-4 flex items-center justify-center">
              <span className="text-gray-600">📁</span>
            </div>
          )}
            <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase">{collectionData.name}</h3>
          <p className="text-sm text-gray-600">{collectionData.description}</p>
        </div>
      </Page>
    );

    // Add content pages
    pages.forEach((page: any, index: number) => {
      if (page.type === 'text') {
        renderedPages.push(
          <Page key={page.uid} type="text" className="bg-white">
            <div className="text-sm text-gray-800 leading-relaxed overflow-hidden">
              <p className="whitespace-pre-wrap">{page.content}</p>
            </div>
          </Page>
        );
      } else if (page.type === 'image') {
        renderedPages.push(
          <Page key={page.uid} type="image" className="bg-gray-50">
            <img 
              src={getImageUrl(page.content)} 
              alt={`Page ${index + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </Page>
        );
      }
    });

    // Ensure even number of pages for proper spreads
    if (renderedPages.length % 2 !== 0) {
      renderedPages.push(
        <Page key="blank" className="bg-white">
          <div className="text-gray-400">End</div>
        </Page>
      );
    }

    return renderedPages;
  };

  return (
    <div 
      ref={magazineRef}
      className={`absolute z-20 ${getCursorClass()} ${isDragging ? 'select-none' : ''}`}
      style={positionStyle}
      onMouseDown={currentTool === "hand" ? handleMouseDown : undefined}
    >
      <HTMLFlipBook
        width={400}
        height={500}
        size="fixed"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={false}
        ref={bookRef}
        className=""
        style={{}}
        startPage={0}
        drawShadow={true}
        flippingTime={1000}
        usePortrait={false}
        startZIndex={0}
        autoSize={true}
        clickEventForward={currentTool !== "hand"}
        useMouseEvents={currentTool !== "hand"}
        swipeDistance={30}
        renderOnlyPageLengthChange={false}
        showPageCorners={true}
        disableFlipByClick={currentTool === "hand"}
      >
        {generatePages()}
      </HTMLFlipBook>
    </div>
  );
}