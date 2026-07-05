// components/home/Skeleton.tsx
'use client';

export default function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-9 bg-gray-200 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}