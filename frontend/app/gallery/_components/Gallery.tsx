// To do: Nextjs image optimization has some issues, fix it (cannot load large files)
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image, { ImageProps } from 'next/image';

interface ImgProps extends Omit<ImageProps, 'alt'> {
  src: string;
  info?: string;
  params?: { [key: string]: string };
  alt?: string;
  title?: string;
}

type image = {
  id: number;
  filename: string;
  url: string;
};

export function GalleryImage({
  info,
  params,
  alt = 'image not exists',
  title = 'Image',
  ...img
}: ImgProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {params && (
          <CardDescription>
            {Object.entries(params).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Image
          layout="responsive"
          alt={alt}
          height={400}
          width={200}
          {...img}
          unoptimized
        />
      </CardContent>
      <CardFooter>{info}</CardFooter>
    </Card>
  );
}

export function Gallery({ items }: { items: image[] }) {
  return (
    <div className="grid grid-rows-1 grid-cols-2 sm:grid-cols-2  lg:grid-cols-4  gap-4">
      {items.map((image: image) => (
        <GalleryImage
          src={`http://127.0.0.1:8000/images/${image.id}`}
          key={image.id}
          title={image.filename}
        />
      ))}
    </div>
  );
}
