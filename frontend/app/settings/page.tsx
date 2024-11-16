'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import toast, { Toaster } from 'react-hot-toast';
import { get_local_time_utc } from '@/utils/time-format';

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

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings[]>([]);
  const pathRegex = /^\/(?:[a-zA-Z0-9_\-\.]+(?:\/[a-zA-Z0-9_\-\.]+)*)?$/;

  const fetchData = async (refetch?: boolean) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.length == 0) return;
      setSettings(data);
      if (refetch) return;
      if (data.length > 0) setFormData(data[0]);
      toast.success('Data fetched successfully');
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const res = await fetch('http://127.0.0.1:8000/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      fetchData(true);
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
        <div className="overflow-x-auto rounded-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID or name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  data set path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  model path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  model type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  parameters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-mono">
              {settings.map((setting, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>{setting.name || setting.id}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>{setting.dataset_path}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>{setting.model_path}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>{setting.model_type}</p>
                  </td>
                  {setting.params && (
                    <td className="px-6 py-4 whitespace-nowrap break-all">
                      {Object.entries(setting.params).map(([key, value]) => (
                        <p key={key}>
                          {key}: {value}
                        </p>
                      ))}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>{setting.notes}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap break-all">
                    <p>
                      {setting.last_modified_time
                        ? get_local_time_utc(setting.last_modified_time)
                        : 'N/A'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
