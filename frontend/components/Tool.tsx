// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Modifications made by: Albert Zhao
// Date: Nov 12 2024
// Add right click to set background labeled points

'use client';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from './hooks/createContext';
import { ToolProps } from './helpers/Interfaces';

const Tool = ({ handleMouseMove, handleMouseClick }: ToolProps) => {
  const {
    image: [image],
    maskImg: [maskImg],
  } = useContext(AppContext)!;

  // Determine if we should shrink or grow the images to match the
  // width or the height of the page and setup a ResizeObserver to
  // monitor changes in the size of the page
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  const imageClasses = 'absolute inset-0 mx-auto';
  const maskImageClasses = `absolute opacity-40 pointer-events-none inset-0 mx-auto`;

  // Render the image and the predicted mask image on top
  return (
    <div className="relative w-[500px] h-[500px] mx-auto">
      {image && (
        <img
          draggable={false}
          onClick={handleMouseClick}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseMove}
          src={image.src}
          className={`${
            shouldFitToWidth ? 'w-full' : 'h-full'
          } ${imageClasses}`}
        ></img>
      )}
      {maskImg && (
        <img
          draggable={false}
          src={maskImg.src}
          className={`${
            shouldFitToWidth ? 'w-full' : 'h-full'
          } ${maskImageClasses}`}
        ></img>
      )}
    </div>
  );
};

export default Tool;
