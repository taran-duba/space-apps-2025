'use client';

import { useEffect, useState } from 'react';
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
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || 'https://picsum.photos/200');

  useEffect(() => {
    let isActive = true;
    const init = async () => {
      if (currentAvatarUrl) {
        if (isActive) setAvatarUrl(`${currentAvatarUrl}?v=${Date.now()}`);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const url = user?.user_metadata?.avatar_url;
      if (url && isActive) setAvatarUrl(`${url}?v=${Date.now()}`);
    };
    init();
    return () => {
      isActive = false;
    };
  }, [currentAvatarUrl, supabase]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const nameExt = (file.name.split('.').pop() || '').toLowerCase();
      const mime = file.type.toLowerCase();
      let ext = 'png';
      if (mime === 'image/jpeg' || nameExt === 'jpeg' || nameExt === 'jpg') ext = 'jpg';
      else if (mime === 'image/png' || nameExt === 'png') ext = 'png';
      const folder = user.id;
      const fileName = `profile-picture.${ext}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from('profile-pics').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Upsert the avatar URL directly in auth.users
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

    
      if (updateError) throw updateError;

      setAvatarUrl(`${publicUrl}?v=${Date.now()}`);
      onUpload(publicUrl);
    } catch (error: unknown) {
      const message = (error instanceof Error && error.message) ? error.message : 'Unknown error';
      console.error('Error uploading avatar:', message);
      alert(`Error uploading avatar: ${message}`);
    } finally {
      setUploading(false);
    }

    const { data: { user } } = await supabase.auth.getUser();
    setAvatarUrl(user?.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?v=${Date.now()}` : 'https://picsum.photos/200');
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <Image
        src={avatarUrl}
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
