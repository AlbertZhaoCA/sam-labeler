'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { DatabaseIcon, BotIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { app_url } from '@/constants';

export default function AnnotationTool() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [mode, setMode] = useState<'auto' | 'manual'>('manual');
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState({
    dataset_path: '',
    model_path: '',
    model_type: '',
    params: '',
    notes: '',
    name: '',
    id: '',
  });
  const [fileFormData, setFileFormData] = useState({
    info: '',
    filename: '',
  });

  const router = useRouter();

  useEffect(() => {
    const fetchPreference = async () => {
      return await fetch(`${app_url}/settings/preference`, {
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
          return data.id;
        })
        .catch((_) => {
          toast.error('Failed to fetch preference');
          return null;
        });
    };

    const fetchSetting = async () => {
      const id = await fetchPreference();
      if (!id) return;

      try {
        const res = await fetch(`${app_url}/settings?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();
        if (data) {
          setSetting(data);
        }
        /* eslint-disable @typescript-eslint/no-unused-expressions */
        data ?? toast.error('No setting found');
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };
    fetchSetting();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      setFile(e.target.files[0]);
      setFileFormData({ ...fileFormData, filename: e.target.files[0].name });
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
      router.push('/label#uploaded-image');
    }
  };

  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    toast.success(`Switched to ${newMode} mode`);
  };

  const handleImageDBInit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`${app_url}/images/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    res
      .json()
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setLoading(!loading);
        toast.success('Images loaded to db');
        console.log(data);
      })
      .catch((err) => {
        toast.error('Ops! Something went wrong');
        console.log(err);
      });
  };

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', JSON.stringify(fileFormData));

      try {
        const response = await fetch(`${app_url}/images`, {
          method: 'POST',
          body: formData,
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const data = await response.json();
        console.log('File uploaded successfully', data.id);
        toast.success('File uploaded successfully');
        router.push(`/label/${data.id}`);
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error('Error uploading file');
        setLoading(false);
      }
    }
  };

  const handleFileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileFormData({ ...fileFormData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col w-full item-center space-y-24">
      <div className="p-8 w-full space-y-8">
        <Toaster />
        <h1 className="text-2xl font-bold mb-4">Annotation Tool</h1>
        <div className="group mb-4 font-mono space-y-5">
          <label className="block text-sm font-medium text-gray-700 mb-4 group-hover:text-blue-500 transition-colors duration-300">
            Upload Image
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="group-hover:border-blue-500 transition-colors duration-300"
          />
        </div>
        <div className="group mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-4 group-hover:text-blue-500 transition-colors duration-300">
            Select Mode
          </label>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleModeChange('auto')}
              className={`transition-colors duration-300 ${mode === 'auto' ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'}`}
            >
              Auto
            </Button>
            <Button
              onClick={() => handleModeChange('manual')}
              className={`transition-colors duration-300 ${mode === 'manual' ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'}`}
            >
              Manual
            </Button>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          image && (
            <div id="uploaded-image" className="relative group space-y-2">
              <img
                width={100}
                height={200}
                src={image}
                alt="Annotated"
                className="w-[350px] max-h-[600px] h-auto rounded-md mx-auto"
              />

              <form className="mb-4 font-mono space-y-5">
                <label className="block text-sm font-medium text-gray-700">
                  Image name
                </label>
                <Input
                  type="text"
                  name="filename"
                  value={fileFormData.filename}
                  onChange={handleFileDataChange}
                />
                <label className="block text-sm font-medium text-gray-700">
                  Comment
                </label>
                <Input
                  type="text"
                  name="info"
                  value={fileFormData.info}
                  onChange={handleFileDataChange}
                />
              </form>

              <div className="flex space-x-5">
                <Button
                  onClick={() => setImage(null)}
                  className={`flex-1 bg-white hover:bg-red-400 text-sm text-red-500 hover:text-white transition-colors duration-300`}
                >
                  Remove 🗑️
                </Button>
                <Button
                  onClick={handleFileUpload}
                  className={`flex-1 bg-white hover:bg-green-400 text-sm text-blue-500 hover:text-white transition-colors duration-300`}
                >
                  Start 🏷️
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      <div
        id="danger-zone"
        className="overflow-auto flex flex-col space-y-4 break-all border-2 rounded-md mr-2 p-2 border-[rgba(193,87,87,0.7)]"
      >
        <h1 className="text-destructive text-5xl font-bold">DANGER ZONE</h1>
        <p className="text-muted-foreground text-2xl">
          Make sure you know what you are doing 😘
        </p>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(setting).map(([key, value]) => {
              if (key === 'id') return null;
              return (
                <tr key={key}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key}
                  </td>
                  {key === 'params' ? (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {JSON.stringify(value, null, 2)}
                    </td>
                  ) : (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {JSON.stringify(value, null, 2)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="text-2xl text-muted-foreground">
          We are going to use your setting configuration
        </p>

        <div className="w-fit space-y-4">
          <form
            onSubmit={handleImageDBInit}
            className="space-x-4 text-l font-mono w-full flex justify-between"
          >
            <label>load all images to db</label>
            <Button type="submit" className="w-fit h-fit hover:bg-blue-300">
              <DatabaseIcon />
            </Button>
          </form>

          <form className="space-x-4 text-l font-mono w-full flex justify-between">
            <label>Automatically annotate image files</label>
            <Button type="submit" className="w-fit h-fit  hover:bg-blue-300">
              <BotIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
