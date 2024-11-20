// To do: Nextjs image optimization has some issues, fix it (cannot load large files)

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { get_local_date_and_time_utc } from '@/utils/time-format';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import GalleryContext from '../_hooks/createContext';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { app_url } from '@/constants';

interface ImgProps extends Omit<ImageProps, 'alt'> {
  img_id: number;
  url: string;
  src: string;
  info?: string;
  annotation?: { tags: string[]; rate: number; original_id: number };
  alt?: string;
  title?: string;
  last_modified_time: string;
  created_time: string;
  labeled?: boolean;
}

type image = {
  id: number;
  filename: string;
  info?: string;
  annotation?: { tags: string[]; rate: number; original_id: number };
  url: string;
  last_modified_time: string;
  created_time: string;
  labeled?: boolean;
};

export function GalleryImage({
  img_id,
  info,
  url,
  annotation,
  alt = 'image not exists',
  title = 'Image',
  last_modified_time,
  created_time,
  labeled,
  ...img
}: ImgProps) {
  const {
    toast,
    refetch: [refetch, setRefetch],
  } = useContext(GalleryContext)!;

  const deleteImage = async (url: string) => {
    await fetch(`${app_url}/${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        console.log(data);
        if (data.error) {
          toast.error('Failed to delete image');
          return;
        }
        toast.success('Image deleted successfully');
        setRefetch(!refetch); // To do: Use React Query for refetching data
      })
      .catch((error) => {
        toast.error('Failed to delete image:', error);
        console.log(error);
      });
  };
  const path = usePathname();
  const router = useRouter();
  const isAnnotated = path.includes('mask');

  return (
    <Card
      className={cn(
        labeled
          ? 'border-green-500 hover:shadow-2xl shadow-green-500 '
          : 'border-gray-300 hover:shadow-2xl shadow-destructive ',
        'border-2 shadow-sm transition-shadow duration-300 relative',
      )}
    >
      <CardHeader>
        <CardTitle className="break-words">{title}</CardTitle>
        {info && <CardDescription>{info}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Image
          className="max-h-[400px] w-auto mx-auto"
          alt={alt}
          width={300}
          height={100}
          {...img}
          unoptimized
        />
      </CardContent>
      <CardFooter>
        <div className="space-y-2 space-x-4">
          {last_modified_time !== created_time ? (
            <>
              <div className="inline-flex flex-col xl:flex-row  gap-2 items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                <span className="text-md font-medium">✍️ Last modified:</span>
                <span className="text-sm font-semibold">
                  {get_local_date_and_time_utc(last_modified_time)[0]}
                </span>
                <span className="text-sm font-semibold">
                  at {get_local_date_and_time_utc(last_modified_time)[1]}
                </span>
              </div>
            </>
          ) : null}

          <div className="inline-flex flex-col  xl:flex-row gap-2 items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg shadow-sm">
            <span className="text-md font-medium">🌍 Created at:</span>
            <span className="text-xs font-semibold">
              {get_local_date_and_time_utc(created_time)[1]}
            </span>
            <span className="text-xs font-semibold">
              {get_local_date_and_time_utc(created_time)[0]}
            </span>
          </div>

          {annotation?.tags && (
            <div className="max-w-[50%] flex-wrap inline-flex flex-col xl:flex-row gap-2 items-center space-x-2 p-3 bg-yellow-100 text-yellow-700 rounded-lg shadow-sm">
              <span className="text-md font-medium">🏷️ Tags:</span>
              {annotation.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-yellow-200 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}

          {annotation && (
            <div className="inline-flex flex-col lg:flex-row gap-2 items-center space-x-2  py-1 p-2 bg-red-100 text-yellow-700 rounded-lg shadow-sm">
              <span className="text-md font-medium">⭐ Rating:</span>
              {annotation.rate == 0 && (
                <span className="text-lg font-semibold">🥚</span>
              )}
              <span className="text-lg font-semibold">
                {'🌟'.repeat(annotation.rate)}
              </span>
            </div>
          )}
        </div>
      </CardFooter>
      <div className="absolute bottom-0 right-0 flex flex-col space-y-2">
        {!isAnnotated && (
          <Button
            onClick={() => router.push(`/label/${img_id}`)}
            variant={'secondary'}
          >
            labelme
          </Button>
        )}
        <Button onClick={() => deleteImage(url)} variant={'destructive'}>
          delete
        </Button>
      </div>
    </Card>
  );
}

export function Gallery({ items }: { items: image[] | undefined }) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
      {items?.map((image: image) => (
        <GalleryImage
          img_id={image.id}
          url={image.url}
          src={`${app_url}/${image.url}`}
          key={image.id}
          title={image.filename}
          last_modified_time={image.last_modified_time}
          created_time={image.created_time}
          info={image.info}
          annotation={image.annotation}
          labeled={image.labeled}
        />
      ))}
    </div>
  );
}
