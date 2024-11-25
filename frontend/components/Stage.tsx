// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Modifications made by: Albert Zhao
// Date: Nov 12 2024
// Add click instead of hover
// Right click to set background labeled points
// Provide annotation record of tags, rate, and comment
// Provide image clipping
// Provide cache for image

import React, { useContext, useEffect, useState } from 'react';
import * as _ from 'underscore';
import Tool from './Tool';
import { modelInputProps } from './helpers/Interfaces';
import AppContext from './hooks/createContext';
import Toolbar from './StageToolbar';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from 'react-hot-toast';
import { handleImageScale } from './helpers/scaleHelper';
import { resizeMaskData } from './helpers/scaleHelper';
import { app_url } from '@/constants';
import { Eraser, Pencil, SquareDashedMousePointer } from 'lucide-react';

type formDataProps = {
  tags: string[];
  rate: number;
  info: string;
};

const Stage = () => {
  const {
    clickMode: [clickMode],
    clicks: [clicks, setClicks],
    annotation: [, setAnnotation_id],
    image: [image],
    maskImg: [maskImg],
    original_id: [original_id],
    maskData,
  } = useContext(AppContext)!;

  let [_maskData, w, h] = [null, 0, 0];

  if (maskData[0] !== null) {
    [_maskData, w, h] = maskData[0];
  }

  const getClick = (x: number, y: number): modelInputProps => {
    const clickType = 1;
    return { x, y, clickType };
  };
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<formDataProps>({
    tags: [],
    rate: 0,
    info: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    toast.success('Rating updated');
    setSubmitted(false);
  };

  const handleTagInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' && tagInput.trim() !== '') {
      event.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setSubmitted(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (tags.length === 0) toast.error('Tag cannot be empty');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setSubmitted(false);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTagInput(e.target.value);
  };
  const [add, setAdd] = useState(true);

  // Get mouse position and scale the (x, y) coordinates back to the natural
  // scale of the image. Update the state of clicks with setClicks to trigger
  // the ONNX model to run and generate a new mask via a useEffect in App.tsx
  /* eslint-disable */
  const handleMouseMove = _.throttle((e: any) => {
    if (clickMode) return;
    const el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    if (click) setClicks([click]);
    setSubmitted(false);
  }, 15);

  // change hover to click
  // Albert, Nov 12 2024
  const handleMouseClick = (e: any) => {
    if (!clickMode) return;
    const el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    console.log(clicks);
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    if (add) {
      const click = getClick(x, y);
      if (click) setClicks(clicks ? [...clicks, click] : [click]);
    } else {
      const click = { x, y, clickType: 0 };
      if (click) setClicks(clicks ? [...clicks, click] : [click]);
    }
    setSubmitted(false);
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, info: e.target.value });
    setSubmitted(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tags.length === 0) {
      toast.error('Tags cannot be empty');
      return;
    }
    if (maskImg === null) {
      toast.error('Please annotate the image');
      return;
    }
    const imgUrl = maskImg?.src;
    fetch(`${app_url}/annotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        tags,
        rate: rating,
        info: formData.info,
        image_data: imgUrl,
        original_id: original_id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setAnnotation_id(data.id);
        toast.success('Congratulations! submitted successfully');
        setSubmitted(true);
      })
      .catch((error) => {
        console.log('Error:', error);
        toast.error('Failed to submit annotation');
      });
  };

  const flexCenterClasses = 'flex items-center justify-center';

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx || !_maskData || !image?.src) return;

    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    const fetchAndCacheImage = async (url: string) => {
      const cache = await caches.open('image-cache');
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const reader = new FileReader();
        reader.onload = (event) => {
          originalImage.src = event.target?.result as string;
        };
        reader.readAsDataURL(blob);
      } else {
        const response = await fetch(url);
        const responseClone = response.clone();
        cache.put(url, responseClone);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (event) => {
          originalImage.src = event.target?.result as string;
        };
        reader.readAsDataURL(blob);
      }
    };

    fetchAndCacheImage(image.src);

    originalImage.onerror = (error) => {
      console.log(originalImage.crossOrigin);
      console.log('Failed to load image', error);
    };

    originalImage.onload = () => {
      const { width, height, samScale } = handleImageScale(originalImage);
      console.log(width, height, samScale);

      canvas.width = width * samScale;
      canvas.height = height * samScale;

      const resizedMask = resizeMaskData(
        _maskData,
        width,
        height,
        canvas.width,
        canvas.height,
      );

      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < resizedMask.length; i++) {
        if (resizedMask[i] <= 0.0) {
          data[4 * i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  }, [maskData, image?.src]);

  const saveCanvas = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'image.png';
      link.click();
      toast.success('image saved successfully');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveCanvas();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`${flexCenterClasses} mt-8 w-full  h-full flex flex-col space-y-8`}
    >
      <Toaster />
      <Toolbar />
      <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
        <Tool
          handleMouseClick={handleMouseClick}
          handleMouseMove={handleMouseMove}
        />
        <div className="absolute right-0 flex flex-col space-y-4">
          {add && (
            <Button className="w-32" onClick={() => setAdd(false)}>
              <Eraser size={24} className="text-white" /> <span>Remove</span>
            </Button>
          )}
          {!add && (
            <Button className="w-32" onClick={() => setAdd(true)}>
              <Pencil size={24} className="text-white" /> <span>Add</span>
            </Button>
          )}
        </div>
      </div>
      <form action="" className="w-full" onSubmit={handleFormSubmit}>
        <label className="w-full block text-sm font-medium text-gray-700 mb-4">
          Enter Tags
        </label>
        <div className="flex flex-wrap items-center mb-4">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2"
            >
              <span>{tag}</span>
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => handleRemoveTag(index)}
              >
                &times;
              </button>
            </div>
          ))}
          <Input
            type="text"
            placeholder="Enter a tag and press Enter"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            className="mb-4"
          />
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Your Thinking
        </label>
        <Input
          onKeyDown={handleKeyDown}
          onChange={handleInfoChange}
          type="text"
          placeholder="Enter your thinking as comments"
          className="mb-4"
        />
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Rate this Annotations
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl ${hoverRating >= star || rating >= star ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors duration-300`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <Button disabled={submitted} type="submit" className="w-full">
          Submit
        </Button>
      </form>
      <canvas id="canvas"></canvas>
    </div>
  );
};

export default Stage;
