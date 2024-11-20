// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Modifications made by: Albert Zhao
// Date: Nov 11 2024
// Use Nextjs instead of only React
// Change hard code image path and embedding path to dynamic path
// Rewrite the fetchEmbedding function to fetch the embedding from the server

'use client';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import React, { useContext, useEffect, useState } from 'react';
import { handleImageScale } from '@/components/helpers/scaleHelper';
import { modelScaleProps } from '@/components/helpers/Interfaces';
import { onnxMaskToImage } from '@/components/helpers/maskUtils';
import { modelData } from '@/components/helpers/onnxModelAPI';
import Stage from '@/components/Stage';
import AppContext from '@/components/hooks/createContext';
/* eslint-disable @typescript-eslint/no-require-imports */
const ort = require('onnxruntime-web');
import Loading from '@/components/ui/loadding-indictor';
import npyjs from 'npyjs';
import { app_url } from '@/constants';

const MODEL_DIR = '/model.onnx';

const App = ({ params }: { params: Promise<{ id: number }> }) => {
  const {
    original_id: [, setOriginal_id],
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
    maskData: [, setMaskData],
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [loadEmbedding, setLoadEmbedding] = useState<boolean>(true); // Load the image embedding

  // The ONNX model expects the input to be rescaled to 1024.
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    const initModel = async () => {
      const { id } = await params;
      setOriginal_id(id);
      // Load the image
      const IMAGE_PATH = `${app_url}/images/${id}`;
      const url = new URL(IMAGE_PATH, app_url);

      loadImage(url);

      try {
        if (MODEL_DIR === undefined) return;
        const URL: string = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }

      // Load the Segment Anything pre-computed embedding
      Promise.resolve(fetchEmbedding(id)).then((embedding) => {
        setTensor(embedding);
        setLoadEmbedding(false);
      });
    };

    initModel();
  }, []);

  const loadImage = async (url: URL) => {
    try {
      const img = new Image();
      img.src = url.href;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img);
      };
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEmbedding = async (imageId: number) => {
    const response = await fetch(`${app_url}/inferences/${imageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const arrayBuffer = await response.arrayBuffer();
    const npy = new npyjs();
    const data = await npy.parse(arrayBuffer);
    const tensor = new ort.Tensor(
      'float32',
      new Float32Array(data.data),
      data.shape,
    );
    return tensor;
  };

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        setMaskData([output.data, output.dims[2], output.dims[3]]);
        // The predicted mask returned from the ONNX model is an array which is
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        setMaskImg(
          onnxMaskToImage(output.data, output.dims[2], output.dims[3]),
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {loadEmbedding && (
        <Loading text="Loading Image Embedding" color="#31c0cc" size="large" />
      )}
      <Stage />
    </>
  );
};

export default App;
