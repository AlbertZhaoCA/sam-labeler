'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import toast, { Toaster } from 'react-hot-toast';
import { get_local_time_utc } from '@/utils/time-format';
import { cn } from '@/lib/utils';
import { Heart, Trash } from 'lucide-react';
import { app_url } from '@/constants';

type Settings = {
  id: number;
  name?: string;
  dataset_path: string;
  model_path: string;
  model_type: string;
  params?: { [key: string]: string };
  notes?: string;
  last_modified_time?: string;
};

export default function Settings() {
  const [formData, setFormData] = useState({
    dataset_path: '',
    model_path: '',
    model_type: 'sam_vit_h_4b8939',
    params: {},
    notes: '',
    name: '',
    id: '',
  });
  const [preferred, setPreferred] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings[]>([]);
  const pathRegex = /^\/(?:[a-zA-Z0-9_\-\.]+(?:\/[a-zA-Z0-9_\-\.]+)*)?$/;

  const fetchSetting = async (refetch?: boolean) => {
    try {
      const res = await fetch(`${app_url}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await res.json();
      if (data.length == 0) setSettings(data[0]);
      setSettings(data);
      if (refetch) return;
      if (data.length > 0) setFormData(data[0]);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferredSetting = () => {
    fetch(`${app_url}/settings/preference`, {
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
        setPreferred(data.id);
      })
      .catch((error) => {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      });
  };

  const updatePreferredSetting = async (id: number) => {
    fetch(`${app_url}/settings/preference?id=${id}`, {
      method: 'PUT',
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
        setPreferred(data.id);
        fetchPreferredSetting();
      })
      .catch((error) => {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      });
  };

  const deleteSetting = async (id: number) => {
    fetch(`${app_url}/settings?id=${id}`, {
      method: 'DELETE',
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
      .then((_) => {
        toast.success('Setting deleted successfully');
        fetchSetting();
      })
      .catch((error) => {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchSetting();
    fetchPreferredSetting();
  }, []);

  useEffect(() => {
    console.log(settings);
  }, [preferred]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://${app_url}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        if (res.status === 400) {
          toast.error('Invalid form data');
          return;
        } else if (res.status === 409) {
          toast.error('Setting already exists');
          return;
        } else {
          toast.error('Failed to submit form');
          return;
        }
      }
      toast.success('Setting saved successfully');
      fetchSetting(true);
    } catch (error) {
      console.log(error);
      toast.error('Failed to submit form');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <Skeleton className="m-auto p-4 text-foreground">
        Loading Settings
      </Skeleton>
    );
  }

  return (
    <div className="p-8 w-full grid grid-cols-1 ">
      <Toaster />
      <form
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        className="font-sans space-y-2 mb-8"
      >
        <div>
          <label>Setting Alias</label>
          <Input
            required
            name="name"
            placeholder="Enter your setting alias"
            value={formData.name || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Dataset Path</label>
          <Input
            pattern={pathRegex.source}
            name="dataset_path"
            placeholder="Enter dataset path"
            value={formData.dataset_path}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Model Path</label>
          <Input
            pattern={pathRegex.source}
            name="model_path"
            placeholder="Enter model path"
            value={formData.model_path}
            onChange={handleChange}
          />
        </div>
        <div className="w-full flex flex-col">
          <label className="flex items-center">Model Type</label>
          <select
            name="model_type"
            onChange={handleChange}
            value={formData.model_type}
            className="border p-2 rounded"
          >
            <option value="sam_vit_h_4b8939">💪 Huge </option>
            <option value="sam_vit_l_0b3195">🚀 Large</option>
            <option value="sam_vit_b_01ec64">🤏 Tiny</option>
          </select>
        </div>
        <div>
          <label>Parameters</label>
          <Input
            name="params"
            placeholder="Enter parameters"
            disabled
            value={JSON.stringify({ device: 'cuda' })}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Notes</label>
          <Input
            name="notes"
            placeholder="Enter notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>

      <div>
        <h1 className="text-2xl font-bold flex flex-col">Settings</h1>
        <div className="flex flex-col space-y-8 overflow-x-auto rounded-sm">
          {settings.map((setting, index) => (
            <div key={setting.name} className="relative">
              <div
                key={index}
                className={cn(
                  ' bg-white divide-y divide-gray-200 font-mono mb-4 p-4 rounded shadow hover:bg-gray-100 transition duration-150 ease-in-out',
                  preferred === setting.id ? 'border border-blue-500' : '',
                )}
              >
                <div className="flex">
                  <div className="w-1/3 font-medium text-gray-500">
                    ID or name:
                  </div>
                  <div className="w-2/3 break-all">
                    {setting.name || setting.id}
                  </div>
                </div>
                <div className="flex mt-2">
                  <div className="w-1/3 font-medium text-gray-500">
                    Dataset path:
                  </div>
                  <div className="w-2/3 break-all">{setting.dataset_path}</div>
                </div>
                <div className="flex mt-2">
                  <div className="w-1/3 font-medium text-gray-500">
                    Model path:
                  </div>
                  <div className="w-2/3 break-all">{setting.model_path}</div>
                </div>
                <div className="flex mt-2">
                  <div className="w-1/3 font-medium text-gray-500">
                    Model type:
                  </div>
                  <div className="w-2/3 break-all">{setting.model_type}</div>
                </div>
                {setting.params && (
                  <div className="flex mt-2">
                    <div className="w-1/3 font-medium text-gray-500">
                      Parameters:
                    </div>
                    <div className="w-2/3 break-all">
                      {Object.entries(setting.params).map(([key, value]) => (
                        <p key={key}>
                          {key}: {value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex mt-2">
                  <div className="w-1/3 font-medium text-gray-500">Notes:</div>
                  <div className="w-2/3 break-all">{setting.notes}</div>
                </div>
                <div className="flex mt-2">
                  <div className="w-1/3 font-medium text-gray-500">
                    Last Modified:
                  </div>
                  <div className="w-2/3 break-all">
                    {setting.last_modified_time
                      ? get_local_time_utc(setting.last_modified_time)
                      : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="absolute flex top-2 right-2 space-x-2">
                <Heart
                  onClick={() => updatePreferredSetting(setting.id)}
                  className={cn(
                    preferred == setting.id
                      ? 'text-red-400 fill-current'
                      : 'text-muted-foreground ',
                  )}
                />
                <Trash
                  onClick={() => deleteSetting(setting.id)}
                  className="text-muted-foreground"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
