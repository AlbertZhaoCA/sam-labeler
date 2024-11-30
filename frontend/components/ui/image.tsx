// This component only intended to provide header to avoid warning from ngrok

import React, { useState, useEffect } from 'react';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  [key: string]: any;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt,
  width = 500,
  height = 500,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ax3zgAAAABJRU5ErkJggg==',
  );

  // If you want to use ngrok, you can just uncomment this code, and change src to imageSrc
  // useEffect(() => {
  //   const headers = new Headers({
  //     'ngrok-skip-browser-warning': 'true',
  //   });

  //   fetch(src, { method: 'GET', headers: headers })
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       const imgURL = URL.createObjectURL(blob);
  //       setImageSrc(imgURL);
  //     })
  //     .catch((error) => console.error('Error loading image:', error));
  // }, [src]);

  return (
    <img
      width={width}
      height={height}
      src={src}
      alt={alt}
      {...props}
      loading="lazy"
    />
  );
};

export default CustomImage;
