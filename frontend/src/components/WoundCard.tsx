import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface WoundCardProps {
  wound: {
    id: string;
    type: string;
    severity: string;
    image_url: string;
    created_at: string;
  };
}

const WoundCard: React.FC<WoundCardProps> = ({ wound }) => {
  return (
    <Link href={`/wounds/${wound.id}`}>
      <div className="block rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="relative h-40 w-full">
            <Image
                src={wound.image_url}
                alt={`Image of a ${wound.type}`}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
            />
        </div>
        <div className="p-4">
          <p className="text-lg font-bold capitalize text-gray-800">{wound.type}</p>
          <p className="text-sm capitalize text-gray-600">Severity: {wound.severity}</p>
          <p className="mt-2 text-xs text-gray-400">
            Tracked on: {new Date(wound.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default WoundCard; 