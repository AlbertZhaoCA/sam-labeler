'use client';

import React from 'react';
import AppContextProvider from '@/components/hooks/context';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}
