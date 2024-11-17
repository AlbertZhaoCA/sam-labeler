import { TrophySpin } from 'react-loading-indicators';

const Loading = ({
  text,
  color = '#31c0cc',
  size = 'large',
}: {
  text?: string;
  color?: string;
  size: 'small' | 'medium' | 'large';
}) => {
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="p-4 w-3/4 h-3/4 md:w-1/2 md:h-1/2 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <TrophySpin color={color} size={size} text={text} textColor="#56b2bd" />
      </div>
    </div>
  );
};

export default Loading;
