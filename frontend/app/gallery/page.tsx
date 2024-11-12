'use client';

import { useEffect, useState } from 'react';
import { Gallery } from './_components/Gallery';

export default function Page() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(' http://127.0.0.1:8000/images', {
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
      .catch((error) => console.error('Failed to fetch data:', error));
  }, []);

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)]">
      <Gallery items={items} />
    </div>
  );
}
