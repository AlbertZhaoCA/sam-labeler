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
interface ImgProps extends Omit<ImageProps, 'alt'> {
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
  info,
  annotation,
  alt = 'image not exists',
  title = 'Image',
  last_modified_time,
  created_time,
  labeled,
  ...img
}: ImgProps) {
  console.log('annotation', annotation);
  return (
    <Card
      className={cn(
        labeled
          ? 'border-green-500 hover:shadow-2xl shadow-green-500 '
          : 'border-gray-300 hover:shadow-2xl shadow-destructive ',
        'border-2 shadow-sm transition-shadow duration-300',
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
    </Card>
  );
}

export function Gallery({ items }: { items: image[] | undefined }) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
      {items?.map((image: image) => (
        <GalleryImage
          src={`http://127.0.0.1:8000/${image.url}`}
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
