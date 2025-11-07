"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface AssemblySpaceProps {
  onToggle: () => void;
}

export default function AssemblySpace({ onToggle }: AssemblySpaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#1f2937", // gray-800
    });

    fabricCanvasRef.current = canvas;

    // Create a sample rectangle
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 20,
      height: 20,
      selectable: true,
    });

    // Add rectangle to canvas
    canvas.add(rect);

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
    <div className="relative h-screen w-full bg-gray-800">
      <canvas ref={canvasRef} id="c" />
      <button
        onClick={onToggle}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-gray-800 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors z-10"
      >
        look down
      </button>
    </div>
  );
}
