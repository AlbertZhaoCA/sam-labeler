// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { createContext } from 'react';
import { modelInputProps } from '../helpers/Interfaces';
import toast from 'react-hot-toast';

interface contextProps {
  clicks: [
    clicks: modelInputProps[] | null,
    setClicks: (e: modelInputProps[] | null) => void,
  ];
  clickMode: [clickMode: boolean, setClickMode: (e: boolean) => void];
  image: [
    image: HTMLImageElement | null,
    setImage: (e: HTMLImageElement | null) => void,
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: (e: HTMLImageElement | null) => void,
  ];
  annotation: [
    annotation_id: number | null,
    setAnnotation_id: (e: number | null) => void,
  ];
  toast: typeof toast;
  original_id: [original_id: number, setOriginal_id: (e: number) => void];
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
