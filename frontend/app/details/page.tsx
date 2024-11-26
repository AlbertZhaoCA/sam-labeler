'use client';

import { useParams } from 'next/navigation';
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import { app_url } from '@/constants';

export default function Page() {
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [imageData, setImageData] = useState<any[]>([]);
  const [annotationData, setAnnotationData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/annotated`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setImageData(data);
        return fetch(`${app_url}/annotations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setAnnotationData(data);
        const annotationIds: number[] = data.map(
          (data: { original_id: any }) => data.original_id,
        );
        return Promise.all(
          annotationIds.map((id: number) => {
            return fetch(`${app_url}/images?id=${id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
            }).then((res) => {
              if (!res.ok) {
                throw new Error('Network response was not ok');
              }
              return res.json();
            });
          }),
        );
      })
      .then((data) => {
        console.log(data);
        setOriginalData(data);
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
  }, []);

  const getAnnotationById = (annotationId: any) => {
    return annotationData.find((annotation) => annotation.id === annotationId);
  };

  const getOriginalById = (originalId: any) => {
    return originalData.find((original) => original.id === originalId);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageData.length > 0 ? (
          imageData.map((item) => {
            const annotation = getAnnotationById(item.annotation_id);
            const original = getOriginalById(item.original_id);
            return (
              <div
                key={item.id}
                className="mb-4 p-4 border flex flex-col rounded-lg shadow"
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-extrabold mt-4 mb-2 break-words">
                    {original?.filename}
                  </h1>
                  <p>{original?.info}</p>
                </div>

                <div className="mx-auto relative group">
                  <img
                    src={`${app_url}/images/${item.original_id}`}
                    alt={`Original Image ${item.original_id}`}
                    width={500}
                    height={500}
                    className="rounded w-auto max-h-[200px]"
                  />
                  <img
                    src={`${app_url}/${item.url}`}
                    alt={`Annotated Image ${item.id}`}
                    width={500}
                    height={500}
                    className="rounded w-auto max-h-[200px] absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {annotation?.tags.map(
                      (
                        tag:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<AwaitedReactNode>
                          | null
                          | undefined,
                        index: Key | null | undefined,
                      ) => (
                        <span
                          key={index}
                          className="bg-blue-200 text-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                  <p>
                    <strong>
                      Rating:{'⭐️'.repeat(annotation?.rate || 0)}
                    </strong>
                  </p>

                  <p>
                    <strong>Mask Info:</strong> {annotation?.info}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
