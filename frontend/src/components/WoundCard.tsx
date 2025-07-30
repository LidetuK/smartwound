import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFlag, FaComments, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface AdminComment {
  id: string;
  comment: string;
  createdAt: string;
  admin?: {
    full_name: string;
  };
}

interface WoundCardProps {
  wound: {
    id: string;
    type: string;
    severity: string;
    image_url: string;
    created_at: string;
    flagged?: boolean;
    status?: string;
  };
  adminComments?: AdminComment[];
}

const WoundCard: React.FC<WoundCardProps> = ({ wound, adminComments }) => {
  const [showComments, setShowComments] = useState(false);
  
  // Safe defaults for optional fields
  const isFlagged = wound.flagged === true;
  const woundStatus = wound.status || 'open';

  const handleCommentsToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return (
    <div className={`rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md ${
      isFlagged ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <Link href={`/wounds/${wound.id}`}>
        <div className="block">
          <div className="relative h-40 w-full">
            <Image
              src={wound.image_url}
              alt={`Image of a ${wound.type}`}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
            {isFlagged && (
              <>
                {/* Main flagged badge */}
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse z-10">
                  <FaFlag className="w-3 h-3" />
                  FLAGGED
                </div>
                {/* Corner ribbon */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-red-500 z-10"></div>
                <div className="absolute top-1 right-1 text-white text-xs font-bold transform rotate-45 z-10">
                  ⚠️
                </div>
                {/* Subtle red border overlay */}
                <div className="absolute inset-0 border-2 border-red-500 rounded-t-lg pointer-events-none"></div>
              </>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-lg font-bold capitalize text-gray-800">{wound.type}</p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                woundStatus === 'healing' ? 'bg-green-100 text-green-800' :
                woundStatus === 'infected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {woundStatus}
              </span>
            </div>
            <p className="text-sm capitalize text-gray-600">Severity: {wound.severity}</p>
            <p className="mt-2 text-xs text-gray-400">
              Tracked on: {new Date(wound.created_at).toLocaleDateString()}
            </p>
            
            {isFlagged && adminComments && adminComments.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <button
                  onClick={handleCommentsToggle}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FaComments className="w-4 h-4" />
                  Admin Comments ({adminComments.length})
                  {showComments ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
                
                {showComments && (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {adminComments.map((comment) => (
                      <div key={comment.id} className="bg-blue-50 p-2 rounded text-xs">
                        <p className="text-gray-800">{comment.comment}</p>
                        <p className="text-gray-500 mt-1">
                          - {comment.admin?.full_name || 'Admin'} • {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default WoundCard; 