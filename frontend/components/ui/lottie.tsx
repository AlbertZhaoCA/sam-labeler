'use client';
/* eslint-disable */
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import dynamic from 'next/dynamic';
import { LottieRefCurrentProps } from 'lottie-react';

const LottieComponent = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieProps {
  animationData: any;
  options: {
    loop?: boolean;
    autoplay?: boolean;
    rendererSettings?: {
      preserveAspectRatio?: string;
    };
  };
}

const Lottie = forwardRef<LottieRefCurrentProps, LottieProps>(
  ({ animationData, options }, ref) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
      if (lottieRef.current) {
        lottieRef.current.goToAndStop(0, true);
      }
    }, [animationData]);

    return (
      <div className="fixed -top-2 right-0 w-24">
        <LottieComponent
          animationData={animationData}
          lottieRef={lottieRef}
          loop={options.loop}
          autoplay={options.autoplay}
          rendererSettings={options.rendererSettings}
        />
      </div>
    );
  },
);

Lottie.displayName = 'Lottie';

export default Lottie;
