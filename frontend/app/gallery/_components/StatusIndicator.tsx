'use client';

import React, { useRef } from 'react';
import animationData from '@/public/Animation - 1731519578424.json';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LottieRefCurrentProps } from 'lottie-react';

const options = {
  animationData,
  loop: false,
  autoplay: true,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

export const Lottie = () => {
  const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

  const pathname = usePathname();
  const isMaskPage = pathname.includes('mask');
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <div className="fixed -top-2 right-0 w-24">
      <Link href={isMaskPage ? '/gallery' : '/gallery/mask'} scroll>
        <Lottie
          onDOMLoaded={() => {
            if (!isMaskPage) {
              lottieRef.current?.setDirection(-1);
              lottieRef.current?.playSegments([160, 80], true);
            } else {
              lottieRef.current?.playSegments([0, 50], true);
            }
          }}
          lottieRef={lottieRef}
          {...options}
        />
      </Link>
      <p className="w-full absolute bottom-0 text-muted-foreground font-mono text-sm text-center">
        {isMaskPage ? '👉 original' : '👉 mask'}
      </p>
    </div>
  );
};
