'use client';
import { useEffect, useState } from 'react';
import { Gallery } from '../_components/Gallery';

type itemProps = {
  id: number;
  filename: string;
  info?: string;
  annotation?: annotationProps;
  url: string;
  last_modified_time: string;
  created_time: string;
  labeled?: boolean;
};

type mergedItemProps = {
  id: number;
  filename: string;
  info?: string;
  url: string;
  last_modified_time: string;
  created_time: string;
  labeled?: boolean;
  annotation: annotationProps;
};

type annotationProps = {
  id: number;
  tags: string[];
  rate: number;
  original_id: number;
};

export default function Page() {
  const [items, setItems] = useState<itemProps[]>([]);
  const [annotations, setAnnotations] = useState<annotationProps[]>([]);
  const [mergedItems, setMergedItems] = useState<
    mergedItemProps[] | itemProps[]
  >();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/images/annotated', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setItems(data);
      })
      .catch((error) => console.log('Failed to fetch data:', error));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/annotations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAnnotations(data);
      })
      .catch((error) => console.log('Failed to fetch data:', error));
  }, []);

  useEffect(() => {
    if (annotations.length === 0 || items.length === 0) return;

    const merged = items.map((item) => {
      const annotation = annotations.find(
        (annotation) => annotation.id === item.id,
      );
      return annotation ? { ...item, annotation } : item;
    });
    setMergedItems(merged);
  }, [annotations, items]);

  return (
    <div className="p-2 md:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]">
      <Gallery items={mergedItems} />
    </div>
  );
}
