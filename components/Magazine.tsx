"use client";

import React, { useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as fabric from "fabric";

interface MagazineProps {
  canvas: fabric.Canvas;
}

interface PageProps {
  children: React.ReactNode;
  bgColor: string;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div className={`${props.bgColor} w-full h-full flex items-center justify-center`} ref={ref}>
      <h2 className="text-6xl font-bold text-white">{props.children}</h2>
    </div>
  );
});

Page.displayName = "Page";

export default function Magazine({ canvas }: MagazineProps) {
  const bookRef = useRef<any>(null);

  const spreads = [
    { left: "bg-red-500", right: "bg-blue-500" },
    { left: "bg-green-500", right: "bg-yellow-500" },
    { left: "bg-purple-500", right: "bg-orange-500" },
  ];

  return (
    <div className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        renderOnlyPageLengthChange={false}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {spreads.flatMap((spread, index) => [
          <Page key={`left-${index}`} bgColor={spread.left}>L{index + 1}</Page>,
          <Page key={`right-${index}`} bgColor={spread.right}>R{index + 1}</Page>,
        ])}
      </HTMLFlipBook>
    </div>
  );
}