"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import html2canvas from "html2canvas-pro";
import { useApp } from "@/context/AppContext";

interface AssemblySpaceProps {
  onToggle: () => void;
}

export default function AssemblySpace({ onToggle }: AssemblySpaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const compositionCanvasRef = useRef<fabric.Rect | null>(null);
  const { transitioningCutout, setTransitioningCutout, compositionCanvas, setCompositionCanvas } = useApp();
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#1f2937", // gray-800
    });

    fabricCanvasRef.current = canvas;

    // Create composition canvas (white rectangle in center)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Custom resize handler that keeps the rectangle centered
    const resizeFromCenter = (
      eventData: fabric.TPointerEvent,
      transform: fabric.Transform,
      x: number,
      y: number
    ) => {
      const target = transform.target as fabric.Rect;
      const centerX = target.left! + (target.width! / 2);
      const centerY = target.top! + (target.height! / 2);
      
      // Calculate new dimensions based on which control is being used
      let newWidth = target.width!;
      let newHeight = target.height!;
      
      if (x !== 0) {
        // Horizontal resize (left or right)
        const pointer = canvas.getScenePoint(eventData);
        const delta = (pointer.x - centerX) * x * 2; // x2 because we're changing both sides
        newWidth = target.width! + delta;
      }
      
      if (y !== 0) {
        // Vertical resize (top or bottom)
        const pointer = canvas.getScenePoint(eventData);
        const delta = (pointer.y - centerY) * y * 2; // x2 because we're changing both sides
        newHeight = target.height! + delta;
      }
      
      // Enforce minimum size
      newWidth = Math.max(100, newWidth);
      newHeight = Math.max(100, newHeight);
      
      // Update size and re-center
      target.set({
        width: newWidth,
        height: newHeight,
        left: centerX - (newWidth / 2),
        top: centerY - (newHeight / 2),
      });
      
      return true;
    };
    
    const compositionRect = new fabric.Rect({
      left: centerX - compositionCanvas.size.width / 2,
      top: centerY - compositionCanvas.size.height / 2,
      width: compositionCanvas.size.width,
      height: compositionCanvas.size.height,
      fill: 'white',
      stroke: '#d1d5db', // gray-300
      strokeWidth: 2,
      selectable: false, // Not selectable/resizable by default
      lockRotation: true, // Can't rotate
      lockMovementX: true, // NEVER moveable
      lockMovementY: true, // NEVER moveable
      hasControls: false, // No resize controls by default
      hasBorders: false,
      evented: false, // Can't be interacted with
      cornerColor: '#3b82f6', // blue-500
      cornerSize: 12,
      transparentCorners: false,
      // Custom property to identify this as the composition canvas
      data: { isCompositionCanvas: true },
    });

    // Define custom controls for center-based resizing
    compositionRect.controls = {
      ml: new fabric.Control({
        x: -0.5,
        y: 0,
        cursorStyle: 'ew-resize',
        actionHandler: resizeFromCenter,
        actionName: 'resizing',
      }),
      mr: new fabric.Control({
        x: 0.5,
        y: 0,
        cursorStyle: 'ew-resize',
        actionHandler: resizeFromCenter,
        actionName: 'resizing',
      }),
      mt: new fabric.Control({
        x: 0,
        y: -0.5,
        cursorStyle: 'ns-resize',
        actionHandler: resizeFromCenter,
        actionName: 'resizing',
      }),
      mb: new fabric.Control({
        x: 0,
        y: 0.5,
        cursorStyle: 'ns-resize',
        actionHandler: resizeFromCenter,
        actionName: 'resizing',
      }),
    };

    compositionCanvasRef.current = compositionRect;
    canvas.add(compositionRect);
    canvas.sendObjectToBack(compositionRect); // Always in background

    // Enforce layer order: composition always in back, cutouts always in front
    const enforceLayerOrder = () => {
      const objects = canvas.getObjects();
      const composition = objects.find((obj: any) => obj.data?.isCompositionCanvas);
      const cutouts = objects.filter((obj: any) => !obj.data?.isCompositionCanvas);
      
      if (composition) {
        canvas.sendObjectToBack(composition);
      }
      cutouts.forEach(cutout => {
        canvas.bringObjectToFront(cutout);
      });
      canvas.renderAll();
    };

    // Enforce layer order on various events
    canvas.on('object:modified', enforceLayerOrder);
    canvas.on('selection:created', enforceLayerOrder);
    canvas.on('selection:cleared', enforceLayerOrder);
    canvas.on('object:added', enforceLayerOrder);

    // Update AppContext when composition canvas is modified
    compositionRect.on('modified', () => {
      setCompositionCanvas({
        position: { x: compositionRect.left!, y: compositionRect.top! },
        size: { 
          width: compositionRect.width!,
          height: compositionRect.height!
        }
      });
    });

    // // Create a sample rectangle
    // const rect = new fabric.Rect({
    //   left: 100,
    //   top: 100,
    //   fill: "red",
    //   width: 20,
    //   height: 20,
    //   selectable: true,
    // });

    // Add rectangle to canvas
    // canvas.add(rect);

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      // Re-center composition canvas
      if (compositionCanvasRef.current) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        compositionCanvasRef.current.set({
          left: centerX - (compositionCanvas.size.width / 2),
          top: centerY - (compositionCanvas.size.height / 2)
        });
      }
      
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // Handle transitioning cutout from MaterialSpace
  useEffect(() => {
    if (!transitioningCutout || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const { cutout } = transitioningCutout;

    console.log("🎨 Receiving cutout in AssemblySpace:", cutout.id);

    // Create fabric.Image from base64
    const loadImage = async () => {
      try {
        // Create a regular Image element first to ensure it loads properly
        const htmlImg = new Image();
        
        await new Promise((resolve, reject) => {
          htmlImg.onload = () => {
            console.log("✅ Image loaded:", { width: htmlImg.width, height: htmlImg.height });
            resolve(htmlImg);
          };
          htmlImg.onerror = (error) => {
            console.error("❌ Image failed to load:", error);
            console.log("Image data preview:", cutout.imageData.substring(0, 100));
            reject(error);
          };
          htmlImg.src = cutout.imageData;
        });
        
        // Create fabric image from loaded HTML image
        const img = new fabric.FabricImage(htmlImg);
        
        // Center it on the canvas
        const left = (canvas.width! - img.width!) / 2;
        const top = (canvas.height! - img.height!) / 2;
        
        console.log("📍 Centering at:", { left, top, imgWidth: img.width, imgHeight: img.height });

        img.set({
          left,
          top,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          // Mark as cutout (not composition canvas)
          data: { isCompositionCanvas: false },
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        console.log("✅ Added to canvas! Total objects:", canvas.getObjects().length);
      } catch (error) {
        console.error("❌ Failed to load cutout image:", error);
        alert("Failed to load cutout image. Check console for details.");
      }
    };

    loadImage();
    setTransitioningCutout(null);
  }, [transitioningCutout, setTransitioningCutout]);

  // Toggle resize mode for composition canvas
  useEffect(() => {
    if (compositionCanvasRef.current) {
      compositionCanvasRef.current.set({
        selectable: isResizing,
        hasControls: isResizing,
        hasBorders: isResizing,
        evented: isResizing,
      });
      fabricCanvasRef.current?.renderAll();
    }
  }, [isResizing]);

  const toggleResize = () => {
    setIsResizing(!isResizing);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    console.log("📸 Exporting composition canvas...");
    
    // Get the canvas element
    const canvasElement = canvasRef.current;
    const parentDiv = canvasElement.parentElement;
    
    if (!parentDiv) return;

    try {
      // Capture the entire canvas area
      const screenshot = await html2canvas(parentDiv, {
        backgroundColor: "#1f2937",
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Crop to just the composition canvas area
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = compositionCanvas.size.width;
      croppedCanvas.height = compositionCanvas.size.height;
      const ctx = croppedCanvas.getContext('2d');

      if (ctx) {
        // Draw just the composition canvas area
        ctx.drawImage(
          screenshot,
          compositionCanvas.position.x * 2, // Account for scale=2
          compositionCanvas.position.y * 2,
          compositionCanvas.size.width * 2,
          compositionCanvas.size.height * 2,
          0,
          0,
          compositionCanvas.size.width,
          compositionCanvas.size.height
        );

        // Download the image
        croppedCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `collage-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            console.log("✅ Exported successfully!");
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert("Failed to export. Error: " + (error as Error).message);
    }
  };

  return (
    <div className="relative h-screen w-full bg-stone-500">
      <canvas ref={canvasRef} id="c" />
      <button
        onClick={onToggle}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-stone-800 rounded-lg font-semibold shadow-lg hover:bg-stone-100 transition-colors z-10"
      >
        look down
      </button>
      <div className="absolute top-8 right-8 flex gap-4 z-10">
        <button
          onClick={toggleResize}
          className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors ${
            isResizing 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-white text-stone-800 hover:bg-stone-100'
          }`}
        >
          {isResizing ? 'Done Resizing' : 'Resize Composition'}
        </button>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors"
        >
          Export Collage
        </button>
      </div>
    </div>
  );
}
