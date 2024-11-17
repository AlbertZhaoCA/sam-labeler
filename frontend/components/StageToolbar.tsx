'use client';

import React from 'react';
import AppContext from './hooks/createContext';
import { useRouter } from 'next/navigation';

import { MousePointerClick, Hand, ArrowRightToLine, Trash } from 'lucide-react';

const Toolbar = () => {
  const {
    maskImg: [, setMaskImg],
    clickMode: [clickMode, setClickMode],
    clicks: [, setClicks],
  } = React.useContext(AppContext)!;
  const router = useRouter();

  const toggleClickMode = () => {
    setClickMode(!clickMode);
  };

  const nextImage = () => {
    router.push('/label');
  };

  return (
    <div className="flex justify-around items-center space-x-4 bg-gray-100 border-b border-gray-300 rounded-xl">
      <button
        onClick={toggleClickMode}
        className="px-8 py-2 rounded-xl flex hover:bg-blue-400 hover:text-white transition-colors ease-in duration-75 items-center space-x-1 text-gray-700"
      >
        {clickMode ? (
          <Hand className="h-5 w-5" />
        ) : (
          <MousePointerClick className="h-5 w-5" />
        )}
        {clickMode ? <span>Hover</span> : <span>Click</span>}
      </button>
      <button
        onClick={() => {
          setClicks(null);
          setMaskImg(null);
        }}
        className="px-8 py-2 rounded-xl flex hover:bg-blue-400 hover:text-white transition-colors ease-in duration-75  items-center space-x-1 text-gray-700 "
      >
        <Trash className="h-5 w-5" />
        <span>Clean</span>
      </button>
      <button
        onClick={nextImage}
        className="px-8 py-2 rounded-xl flex hover:bg-blue-400 hover:text-white transition-colors ease-in duration-75  items-center space-x-1 text-gray-700"
      >
        <ArrowRightToLine className="h-5 w-5" />
        <span>Next</span>
      </button>
    </div>
  );
};

export default Toolbar;
