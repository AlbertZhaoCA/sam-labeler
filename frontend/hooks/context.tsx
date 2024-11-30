'use client';

import React from 'react';
import AppContext from './createContext';
import { Toaster, toast } from 'react-hot-toast';

const AppContextProvider = (props: { children: React.ReactNode }) => {
  return (
    <AppContext.Provider
      value={{
        toast,
      }}
    >
      {props.children}
      <Toaster />
    </AppContext.Provider>
  );
};

export default AppContextProvider;
