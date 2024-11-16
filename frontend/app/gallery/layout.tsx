'use client';

import { Lottie } from './_components/StatusIndicator';
import { ReactNode } from 'react';

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Lottie />
    </div>
  );
}
