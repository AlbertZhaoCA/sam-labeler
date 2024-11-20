// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Modifications made by: Albert Zhao
// Date: Nov 12 2024
// Use Nextjs instead of only React (add 'use client')

'use client';

import React, { useState } from 'react';
import { modelInputProps } from '../helpers/Interfaces';
import AppContext from './createContext';
import { Toaster, toast } from 'react-hot-toast';

const AppContextProvider = (props: { children: React.ReactNode }) => {
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [clickMode, setClickMode] = useState<boolean>(false);
  const [annotation_id, setAnnotation_id] = useState<number | null>(null);
  const [original_id, setOriginal_id] = useState<number>(0);
  const [maskData, setMaskData] = useState<any | null>(null);
  
  return (
    <AppContext.Provider
      value={{
        clicks: [clicks, setClicks],
        clickMode: [clickMode, setClickMode],
        annotation: [annotation_id, setAnnotation_id],
        image: [image, setImage],
        maskImg: [maskImg, setMaskImg],
        toast,
        original_id: [original_id, setOriginal_id],
        maskData: [maskData, setMaskData],
      }}
    >
      {props.children}
      <Toaster />
    </AppContext.Provider>
  );
};

export default AppContextProvider;
