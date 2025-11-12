"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import html2canvas from "html2canvas-pro";
import { MagazineContainer } from "./Magazine";
import Toolbar from "./Toolbar";
import MaterialDrawer from "./MaterialDrawer";
import Cutout from "./Cutout";
import LookUpButton from "./LookUpButton";
import { useApp } from "@/context/AppContext";
import { getAllCollections } from "@/lib/api/collections";
import { DropZone, DragItem, useDnD } from '@/context/DnDContext';

interface MaterialSpaceProps {
  onToggle: () => void;
  isActive: boolean;
}

export default function MaterialSpace({ onToggle, isActive }: MaterialSpaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const materialSpaceRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);
  const { currentTool, setCollections, setIsLoadingCollections, magazines, setMagazines, addCutout, updateCutout, cutouts } = useApp();
  const { dragState } = useDnD();
  
  // Selection rectangle state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  const getCursorClass = () => {
    if (currentTool === "hand") return "cursor-grab";
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") return "cursor-crosshair";
    return "cursor-default";
  };

  const handleDrop = (item: DragItem) => {
    console.log("handleDrop called with item:", item);
    if (item.type === 'collection') {
      console.log("Creating magazine from collection:", item.data);
      const newMagazine = {
        id: `magazine-${item.id}-${Date.now()}`,
        collection: item.data,
        position: dragState.dragPosition || { x: 400, y: 300 } // fallback position
      };
      console.log("New magazine:", newMagazine);
      setMagazines([...magazines, newMagazine]);
    } else {
      console.log("Item type is not collection:", item.type);
    }
  };

  // Calculate selection rectangle for rendering
  const getSelectionRect = () => {
    if (!selectionStart || !selectionEnd) return null;
    
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    return { x, y, width, height };
  };

  // Use CAPTURE phase to intercept scissors events BEFORE they reach children
  const handleMouseDownCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") {
      console.log("✂️ scissors tool active (capture phase), currentTool:", currentTool);
      e.preventDefault();
      e.stopPropagation();
      
      if (currentTool === "scissors-rectangle") {
        setIsSelecting(true);
        setSelectionStart({ x: e.clientX, y: e.clientY });
        setSelectionEnd({ x: e.clientX, y: e.clientY });
      }
    }
  };

    // Capture phase for mouse move
  const handleMouseMoveCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") {
      e.preventDefault();
      e.stopPropagation();
      
      if (isSelecting && currentTool === "scissors-rectangle") {
        setSelectionEnd({ x: e.clientX, y: e.clientY });
      }
    }
  };

  // Capture phase for mouse up
  const handleMouseUpCapture = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") {
      e.preventDefault();
      e.stopPropagation();
      
      if (!isSelecting || currentTool !== "scissors-rectangle" || !materialSpaceRef.current) {
        setIsSelecting(false);
        return;
      }
      
      const rect = getSelectionRect();
      if (!rect || rect.width < 5 || rect.height < 5) {
        // Ignore very small selections
        console.log("✂️ selection too small, ignoring");
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }
      
      console.log("✂️ making a cutout", rect);
      
      // Create placeholder cutout immediately with offset
      const cutoutId = `cutout-${Date.now()}`;
      const offsetX = rect.x + 20; // Offset by 20px so it's visible
      const offsetY = rect.y + 20;
      
      const placeholderCutout = {
        id: cutoutId,
        imageData: '', // Empty initially
        position: { x: offsetX, y: offsetY },
        size: { width: rect.width, height: rect.height }
      };
      
      addCutout(placeholderCutout);
      
      try {
        // Temporarily hide the selection overlay
        const selectionOverlay = document.querySelector('.selection-overlay') as HTMLElement;
        if (selectionOverlay) {
          selectionOverlay.style.display = 'none';
        }
        
        // Capture the entire MaterialSpace with html2canvas-pro (supports lab() colors!)
        const canvas = await html2canvas(materialSpaceRef.current, {
          backgroundColor: "#292524",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        
        // Restore selection overlay
        if (selectionOverlay) {
          selectionOverlay.style.display = '';
        }
        
        // Create a temporary canvas to crop the selection
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = rect.width;
        croppedCanvas.height = rect.height;
        const ctx = croppedCanvas.getContext('2d');
        
        if (ctx) {
          // Draw the cropped portion
          ctx.drawImage(
            canvas,
            rect.x, rect.y, rect.width, rect.height,
            0, 0, rect.width, rect.height
          );
          
          // Convert to base64
          const imageData = croppedCanvas.toDataURL('image/png');
          
          // Update cutout with actual image data
          console.log("✂️ cutout created!", cutoutId);
          updateCutout(cutoutId, { imageData });
        }
      } catch (error) {
        console.error("✂️ Failed to capture selection:", error);
        alert("Failed to create cutout. Error: " + (error as Error).message);
      }
      
      // Reset selection
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  const selectionRect = getSelectionRect();

  useEffect(() => {
    if (isActive) {
      // Show content immediately when becoming active
      setShowContent(true);
    } else {
      // Delay hiding content to allow transition to complete
      const timer = setTimeout(() => {
        setShowContent(false);
      }, 1000); // Match this to your transition duration
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Fetch collections when MaterialSpace becomes active
  useEffect(() => {
    if (isActive) {
      const fetchCollections = async () => {
        setIsLoadingCollections(true);
        try {
          const collections = await getAllCollections();
          setCollections(collections);
        } catch (error) {
          console.error("Failed to fetch collections:", error);
        } finally {
          setIsLoadingCollections(false);
        }
      };

      fetchCollections();
    }
  }, [isActive, setCollections, setIsLoadingCollections]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#292524", // stone-800
    });

    fabricCanvasRef.current = canvas;

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  return (
    <DropZone targetType="material-space" onDrop={handleDrop} className={`relative   h-screen w-full bg-stone-500 ${getCursorClass()}`}>
      <div 
        ref={materialSpaceRef}
        className="absolute inset-0"
        onMouseDownCapture={handleMouseDownCapture}
        onMouseMoveCapture={handleMouseMoveCapture}
        onMouseUpCapture={handleMouseUpCapture}
      >
        <canvas ref={canvasRef} id="materialCanvas" />
        <LookUpButton onToggle={onToggle} />
        {showContent && <MaterialDrawer />}
        {showContent && <Toolbar />}
        {fabricCanvasRef.current && showContent && 
          magazines.map(magazine => (
            <MagazineContainer
              key={magazine.id}
              id={magazine.id}
              canvas={fabricCanvasRef.current!} 
              collection={magazine.collection}
              position={magazine.position}
            />
          ))
        }
        
        {/* Render cutouts */}
        {showContent && cutouts.map(cutout => (
          <Cutout key={cutout.id} cutout={cutout} />
        ))}
        
        {/* Selection rectangle overlay */}
        {isSelecting && selectionRect && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none selection-overlay"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              zIndex: 50,
            }}
          />
        )}
      </div>
    </DropZone>
  );
}
