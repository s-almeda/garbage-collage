"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import Magazine from "./Magazine";
import Toolbar from "./Toolbar";
import MaterialDrawer from "./MaterialDrawer";
import { useApp } from "@/context/AppContext";

interface MaterialSpaceProps {
  onToggle: () => void;
  isActive: boolean;
}

export default function MaterialSpace({ onToggle, isActive }: MaterialSpaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [showContent, setShowContent] = useState(false);
  const { currentTool } = useApp();

  const getCursorClass = () => {
    if (currentTool === "hand") return "cursor-grab";
    if (currentTool === "scissors-rectangle" || currentTool === "scissors-freehand") return "cursor-crosshair";
    return "cursor-default";
  };

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
    <div className={`relative h-screen w-full bg-stone-800 ${getCursorClass()}`}>
      <canvas ref={canvasRef} id="materialCanvas" />
      <button
        onClick={onToggle}
        className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-stone-800 rounded-lg font-semibold shadow-lg hover:bg-stone-100 transition-colors z-10"
      >
        look up
      </button>
      {showContent && <MaterialDrawer />}
      {showContent && <Toolbar />}
      {fabricCanvasRef.current && showContent && (
        <Magazine canvas={fabricCanvasRef.current} />
      )}
    </div>
  );
}
