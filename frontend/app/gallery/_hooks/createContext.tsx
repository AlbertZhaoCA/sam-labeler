import { createContext } from 'react';
import toast from 'react-hot-toast';

type annotation = {
  tags: string[];
  rate: number;
  original_id: number;
};

type originalImage = {
  id: number;
  info: string;
  url: string;
  annotation_id: number[];
  created_time: string;
  last_modified_time: string;
  filename: string;
};

type contextProps = {
  toast: typeof toast;
  refetch: [refetch: boolean, setRefetch: (e: boolean) => void];
};

const GalleryContext = createContext<contextProps | null>(null);

export default GalleryContext;
