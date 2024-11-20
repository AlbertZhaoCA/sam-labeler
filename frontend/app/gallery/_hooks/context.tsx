import GalleryContext from './createContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function GalleryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refetch, setRefetch] = useState<boolean>(false);
  return (
    <GalleryContext.Provider value={{ toast, refetch: [refetch, setRefetch] }}>
      {children}
      <Toaster />
    </GalleryContext.Provider>
  );
}
