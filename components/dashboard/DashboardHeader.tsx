'use client';

import { useEffect, useState } from 'react';

type Profile = {
  name?: string;
  avatar_url?: string;
};

export default function DashboardHeader() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/reseller/me')
      .then(r => r.json())
      .then(data => { if (mounted) setProfile(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <p className="text-sm font-bold text-gray-800">
          Welcome{profile?.name ? `, ${profile.name}` : ''}
        </p>
        <p className="text-xs text-gray-400">Reseller Dashboard</p>
      </div>

      <div className="w-9 h-9 rounded-full bg-violet-100 overflow-hidden flex items-center justify-center shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
        ) : (
          <span className="text-sm font-black text-violet-600">
            {profile?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
      </div>
    </header>
  );
}