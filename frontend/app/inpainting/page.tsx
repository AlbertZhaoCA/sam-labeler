'use client';

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
import { app_url } from '@/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import LoadingComp from '@/components/ui/loadding-indictor';
import Image from '@/components/ui/image';

export default function Page() {
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [imageData, setImageData] = useState<any[]>([]);
  const [annotationData, setAnnotationData] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<{ [key: string]: string }>({});
  const [inpainted, setInpainted] = useState<[string, string] | undefined>(
    undefined,
  );
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleInputChange = (id: string, value: string, url: string) => {
    setPrompts((prevPrompts) => ({
      ...prevPrompts,
      [id]: value,
    }));
    setInpainted([`${app_url}/images/${id}`, `${app_url}/${url}`]);
    setSelected(url);
    setSubmitted(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inpainted || !selected) {
      alert('Please select both image and mask files');
      return;
    }

    const [imageUrl, maskUrl] = inpainted;
    console.log('Submitting:', imageUrl, maskUrl, prompts[submitted]);
    try {
      setLoading(true);
      const response = await axios.post(
        `${app_url}/inpainting`,
        {
          image_url: imageUrl,
          mask_url: maskUrl,
          prompt: prompts[submitted],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        },
      );
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      console.log(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'inpainted_image.png';
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      console.log('Image downloaded successfully');
    } catch (err) {
      console.error('Error uploading files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {loading && <LoadingComp size="large" />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageData.length > 0 ? (
          imageData.map((item, index) => {
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
                  <Image
                    src={`${app_url}/images/${item.original_id}`}
                    alt={`Original Image ${item.original_id}`}
                    width={500}
                    height={500}
                    className="rounded w-auto max-h-[200px]"
                  />
                  <Image
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
                <label>Prompt</label>
                <Input
                  name={item.original_id}
                  type="text"
                  onChange={(e) =>
                    handleInputChange(
                      item.original_id,
                      e.target.value,
                      item.url,
                    )
                  }
                  value={
                    (item.url === selected && prompts[item.original_id]) || ''
                  }
                ></Input>
                <Button onClick={handleSubmit}>Submit</Button>
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
