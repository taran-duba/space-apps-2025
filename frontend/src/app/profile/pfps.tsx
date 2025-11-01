'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type AvatarUploadProps = {
  userId: string;
  currentAvatarUrl?: string | null;
  onUpload: (url: string) => void;
};

export default function AvatarUpload({ userId, currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      onUpload(publicUrl);
    } catch (error: unknown) {
      const message = (error instanceof Error && error.message) ? error.message : 'Unknown error';
      console.error('Error uploading avatar:', message);
      alert('Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <Image
        src={avatarUrl || '/default-avatar.png'}
        alt="Profile picture"
        width={96}
        height={96}
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
      />
      <Button
        asChild
        variant="secondary"
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={uploading}
      >
        <label>
          {uploading ? 'Uploading...' : 'Change Picture'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </Button>
    </div>
  );
}
