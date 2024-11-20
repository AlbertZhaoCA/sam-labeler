'use client';

import { useEffect, useState, useContext } from 'react';
import { Gallery } from './_components/Gallery';
import toast from 'react-hot-toast';
import GalleryContext from './_hooks/createContext';
import { app_url } from '@/constants/index';

export default function Page() {
  const [items, setItems] = useState([]);
  const {
    toast,
    refetch: [refetch],
  } = useContext(GalleryContext)!;

  useEffect(() => {
    fetch(`${app_url}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setItems(data);
        console.log('data', data);
      })
      .catch((error) => {
        toast.error('Failed to fetch data:', error);
        console.log(error);
      });
  }, [refetch]);

  return (
    <div className="p-4">
      <Gallery items={items} />
    </div>
  );
}
