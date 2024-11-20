// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable */
// Helper function for handling image scaling needed for SAM
const handleImageScale = (image: HTMLImageElement) => {
  // Input images to SAM must be resized so the longest side is 1024
  const LONG_SIDE_LENGTH = 1024;
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { height: h, width: w, samScale };
};

//Alber Zhao Nov 20 2024 used to resize the mask data
const resizeMaskData = (maskData:any, originalWidth:number, originalHeight:number, targetWidth:number, targetHeight:number) => {
  const resizedMask = new Uint8ClampedArray(targetWidth * targetHeight);
  const scaleX = originalWidth / targetWidth;
  const scaleY = originalHeight / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      resizedMask[y * targetWidth + x] = maskData[srcY * originalWidth + srcX];
    }
  }

  return resizedMask;
};

export { handleImageScale,resizeMaskData };
