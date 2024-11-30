'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useContext, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { get_local_time_utc } from '@/utils/time-format';
import { cn } from '@/lib/utils';
import { Heart, Trash } from 'lucide-react';
import AppContext from '@/hooks/createContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import baseAxios from '@/utils/axiosConfig';

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
    id: 0,
  });
  const [loading, setLoading] = useState(true);
  const pathRegex = /^\/(?:[a-zA-Z0-9_\-\.]+(?:\/[a-zA-Z0-9_\-\.]+)*)?$/;
  const { toast } = useContext(AppContext)!;

  const queryClient = useQueryClient();

  const settings = useQuery<Settings[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await baseAxios.get('/settings');
      return res.data;
    },
    retry: 3,
  });

  const preferred = useQuery<{ id: number }>({
    queryKey: ['settings', 'preference'],
    queryFn: async () => {
      const res = await baseAxios.get('/settings/preference');
      return res.data;
    },
    retry: 3,
  });

  const createSetting = async (newSetting: Settings) => {
    const res = await baseAxios.post('/settings', newSetting);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Setting created successfully');
    },
    onError: (error) => {
      toast.error('Error creating setting');
    },
  });

  const deleteSetting = async (id: number) => {
    const res = await baseAxios.delete(`/settings`, { params: { id } });
    return res.data;
  };

  const deleteMutation = useMutation({
    mutationFn: deleteSetting,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['settings'] });

      const previousSettings = queryClient.getQueryData<Settings[]>([
        'settings',
      ]);

      if (previousSettings) {
        queryClient.setQueryData(
          ['settings'],
          previousSettings.filter((setting) => setting.id !== id),
        );
      }

      return { previousSettings };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(['settings'], context?.previousSettings);
      toast.error('Error deleting setting');
    },
    onSuccess: () => {
      toast.success('Setting deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updatePreferred = async (id: number) => {
    const res = await baseAxios.put('/settings/preference', null, {
      params: { id },
    });
    return res.data;
  };

  const preferredMutation = useMutation({
    mutationFn: updatePreferred,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'preference'] });

      const previousPreferred = queryClient.getQueryData<{ id: number }>([
        'settings',
        'preference',
      ]);

      if (previousPreferred) {
        queryClient.setQueryData(['settings', 'preference'], { id });
      }

      return { previousPreferred };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(
        ['settings', 'preference'],
        context?.previousPreferred,
      );
      toast.error('Error updating preferred setting');
    },
    onSuccess: () => {
      toast.success('Preferred setting updated successfully');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (settings.isLoading) {
    return (
      <Skeleton className="m-auto p-4 text-foreground">
        Loading Settings
      </Skeleton>
    );
  }

  return (
    <div className="p-8 w-full grid grid-cols-1 ">
      <form
        onKeyDown={handleKeyDown}
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(formData);
        }}
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
          {settings?.data?.map((setting, index) => (
            <div key={setting.name} className="relative">
              <div
                key={index}
                className={cn(
                  ' bg-white divide-y divide-gray-200 font-mono mb-4 p-4 rounded shadow hover:bg-gray-100 transition duration-150 ease-in-out',
                  preferred?.data?.id === setting.id
                    ? 'border border-blue-500'
                    : '',
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
                  onClick={() => preferredMutation.mutate(setting.id)}
                  className={cn(
                    preferred?.data?.id == setting.id
                      ? 'text-red-400 fill-current'
                      : 'text-muted-foreground ',
                  )}
                />
                <Trash
                  className="text-muted-foreground"
                  onClick={() => deleteMutation.mutate(setting.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
