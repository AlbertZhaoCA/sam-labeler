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
    <div className="absolute z-50 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="p-4 w-1/4 h-1/4 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <TrophySpin color={color} size={size} text={text} textColor="#56b2bd" />
      </div>
    </div>
  );
};

export default Loading;
