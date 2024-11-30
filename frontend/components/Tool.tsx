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
import Image from './ui/image';

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

  const imageClasses = '';
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;

  // Render the image and the predicted mask image on top
  return (
    <>
      {image?.src && (
        <Image
          width={500}
          height={400}
          alt="image"
          draggable={false}
          onClick={handleMouseClick}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseMove}
          src={image.src}
          className={`${
            shouldFitToWidth ? 'w-full' : 'h-full'
          } ${imageClasses}`}
        />
      )}
      {maskImg?.src && (
        <Image
          width={500}
          height={400}
          alt="mask"
          draggable={false}
          src={maskImg.src}
          className={`${
            shouldFitToWidth ? 'w-full' : 'h-full'
          } ${maskImageClasses}`}
        />
      )}
    </>
  );
};

export default Tool;
