'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { DatabaseIcon, BotIcon } from 'lucide-react';
import { json } from 'stream/consumers';

export default function AnnotationTool() {
    const [image, setImage] = useState<string | null>(null);
    const [file,setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'auto' | 'manual'>('manual');
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [setting, setSetting] = useState({
        dataset_path: '',
        model_path: '',
        model_type: '',
        params: '',
        notes: '',
        name: '',
        id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/settings',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                const data = await res.json();
                if (data && data.length > 0) {
                    setSetting(data[0]);
                }
                toast.success('Synced with setting.py');

            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to fetch data');
            }
        }
        fetchData();
    }, []);


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            setFile(e.target.files[0]);
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
        toast.success('Rating updated');
    };

    const handleModeChange = (newMode: 'auto' | 'manual') => {
        setMode(newMode);
        toast.success(`Switched to ${newMode} mode`);
    };

    const handleImageDBInit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const res = await fetch('http://127.0.0.1:8000/images/local',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        res.json().then(data => {
            if (data.error)
                toast.error(data.error);
            else
                toast.success('Images loaded to db');
            console.log(data);
        }).catch(err => {
            toast.error('Ops! Something went wrong');
            console.log(err);
        });

    }

    const handleFileUpload = async () => {
        if (file) {
          const formData = new FormData();
          formData.append("file", file); 
    
          try {
            const response = await fetch('http://127.0.0.1:8000/images', {
              method: 'POST',
              body: formData,
            });
    
            const data = await response.json();
            console.log('File uploaded successfully', data);
            toast.success('File uploaded successfully');
          } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error uploading file');
          }
        }
      };


    return (
        <div className='flex flex-col w-full item-center space-y-24'>
            <div className="p-8 w-full space-y-8">
                <Toaster />
                <h1 className="text-2xl font-bold mb-4">Annotation Tool</h1>
                <div className="group mb-4 font-mono space-y-5">
                    <label className="block text-sm font-medium text-gray-700 mb-4 group-hover:text-blue-500 transition-colors duration-300">Upload Image</label>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="group-hover:border-blue-500 transition-colors duration-300" />
                <div className='flex space-x-5'>
                    <Button onClick={() => setImage(null)} className="flex-1 bg-white hover:bg-red-400 text-sm text-red-500 hover:text-white-700 transition-colors duration-300">Remove</Button>
                    <Button onClick={handleFileUpload} className="flex-1 bg-white hover:bg-green-400 text-sm text-blue-500 hover:text-blue-700 transition-colors duration-300">Save</Button>
                </div>
                </div>
                <div className="group mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-4 group-hover:text-blue-500 transition-colors duration-300">Select Mode</label>
                    <div className="flex space-x-4">
                    <Button onClick={() => handleModeChange('auto')} className={`transition-colors duration-300 ${mode === 'auto' ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'}`}>Auto</Button>
                    <Button onClick={() => handleModeChange('manual')} className={`transition-colors duration-300 ${mode === 'manual' ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'}`}>Manual</Button>
                </div>
                </div>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : (
                    image && (
                        <div className="relative group">
                            <Image width={200} height={200} src={image} alt="Annotated" className="w-3/4 h-auto rounded-md mx-auto" />
                            {mode === 'manual' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white bg-black bg-opacity-50 p-2 rounded">Manual Annotation Mode</span>
                                </div>
                            )}
                            {mode === 'auto' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white bg-black bg-opacity-50 p-2 rounded">Auto Annotation Mode</span>
                                </div>
                            )}
                        </div>
                    )
                )}
                <form action="">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Comments</label>
                    <Input type="text" placeholder="Enter Your ideas" className="mb-4" />
                    <label className="block text-sm font-medium text-gray-700 mb-4">Enter File Name</label>
                    <Input type="text" placeholder="Enter the file name" className="mb-4" />
                    <div className='mb-8'>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Rate this Annotations</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className={`text-2xl ${hoverRating >= star || rating >= star ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors duration-300`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Submit</Button>
                </form>
            </div>

            <div className='overflow-auto flex flex-col space-y-4 break-all border-2 rounded-md mr-2 p-2 border-[rgba(193,87,87,0.7)]'>
                <h1 className='text-destructive text-5xl font-bold'>DANGER ZONE</h1>
                <p className='text-muted-foreground text-2xl'>Make sure you know what you are doing 😘</p>


                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setting</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(setting).map(([key, value]) => (
                            <tr key={key}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                                {
                                    key == "parmas" && <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{JSON.stringify(value, null, 2)}</td>
                                }
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{JSON.stringify(value, null, 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className='text-2xl text-muted-foreground'>We are going to use your setting configuration</p>

                <div className='w-fit space-y-4'>
                    <form onSubmit={handleImageDBInit} className='space-x-4 text-l font-mono w-full flex justify-between'>
                        <label>load all images to db</label>
                        <Button type='submit' className='w-fit h-fit hover:bg-blue-300'><DatabaseIcon /></Button>
                    </form>

                    <form className='space-x-4 text-l font-mono w-full flex justify-between'>
                        <label>Automatically annotate image files</label>
                        <Button type='submit' className='w-fit h-fit  hover:bg-blue-300'><BotIcon /></Button>
                    </form>
                </div>

            </div>
        </div>
    );
}
