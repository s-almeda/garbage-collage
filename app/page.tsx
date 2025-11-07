"use client";

import { useState } from "react";
import AssemblySpace from "@/components/AssemblySpace";
import MaterialSpace from "@/components/MaterialSpace";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"top" | "bottom">("top");

  const toggleScreen = () => {
    setCurrentScreen(currentScreen === "top" ? "bottom" : "top");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Container that holds both screens and pans vertically */}
      <div
        className={`absolute w-full transition-transform duration-700 ease-in-out ${
          currentScreen === "top" ? "translate-y-0" : "-translate-y-1/2"
        }`}
        style={{ height: "200vh" }}
      >
        <AssemblySpace onToggle={toggleScreen} />
        <MaterialSpace onToggle={toggleScreen} isActive={currentScreen === "bottom"} />
      </div>
    </div>
  );
}
