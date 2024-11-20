'use client';

import { Lottie } from './_components/StatusIndicator';
import { ReactNode } from 'react';
import GalleryContextProvider from './_hooks/context';

export default function Page({ children }: { children: ReactNode }) {
  return (
    <GalleryContextProvider>
      <div>
        {children}
        <Lottie />
      </div>
    </GalleryContextProvider>
  );
}
