// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Modifications made by: Albert Zhao
// Date: Nov 12 2024
// Add click instead of hover
// Right click to set background labeled points
// Provide annotation record of tags, rate, and comment
// ...

import React, { useContext, useState } from 'react';
import * as _ from 'underscore';
import Tool from './Tool';
import { modelInputProps } from './helpers/Interfaces';
import AppContext from './hooks/createContext';
import Toolbar from './StageToolbar';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from 'react-hot-toast';

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
  } = useContext(AppContext)!;

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

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    toast.success('Rating updated');
  };

  const handleTagInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' && tagInput.trim() !== '') {
      event.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

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
    const click = getClick(x, y);
    if (click) setClicks(clicks ? [...clicks, click] : [click]);
  };

  const handleRightClick = (e: any) => {
    e.preventDefault();
    if (!clickMode) return;
    const el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = { x, y, clickType: 0 };
    if (click) setClicks(clicks ? [...clicks, click] : [click]);
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, info: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const imgUrl = maskImg?.src;
    fetch('http://127.0.0.1:8000/annotation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        toast.success(
          'Annotation submitted, but You have to save the image, or it will be lost',
        );
      })
      .catch((error) => {
        console.log('Error:', error);
        toast.error('Failed to submit annotation');
      });
  };

  const flexCenterClasses = 'flex items-center justify-center';
  return (
    <div
      className={`${flexCenterClasses} mt-8 w-full h-full flex flex-col space-y-8`}
    >
      <Toaster />
      <Toolbar />
      <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
        <Tool
          handleRightClick={handleRightClick}
          handleMouseClick={handleMouseClick}
          handleMouseMove={handleMouseMove}
        />
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
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Stage;
