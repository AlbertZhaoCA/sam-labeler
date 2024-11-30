import { createContext } from 'react';
import toast from 'react-hot-toast';

interface contextProps {
  toast: typeof toast;
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
