'use client';

import { useEffect, useState } from 'react';
import { Gallery } from './_components/Gallery';
import toast from 'react-hot-toast';

export default function Page() {
  const [items, setItems] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetch('http://127.0.0.1:8000/images', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setItems(data);
        console.log(data);
      })
      .catch((error) => {
        toast.error('Failed to fetch data:', error);
        console.log(error);
      });
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-4">
      <Gallery items={items} />
    </div>
  );
}
