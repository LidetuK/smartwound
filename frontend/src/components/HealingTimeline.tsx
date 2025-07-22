import React from 'react';
import Image from 'next/image';

interface WoundLog {
  id: string;
  photo_url: string;
  notes: string;
  created_at: string;
}

interface HealingTimelineProps {
  logs: WoundLog[];
}

const HealingTimeline: React.FC<HealingTimelineProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-gray-500">No healing logs have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {logIdx !== logs.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-4">
                <div>
                  <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                    <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.293 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-500">
                    Logged on: <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleDateString()}</time>
                  </div>
                  <div className="mt-2 rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                    <div className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                                src={log.photo_url}
                                alt="Wound log entry"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-md"
                            />
                        </div>
                        <p className="text-sm text-gray-700">{log.notes || "No notes for this entry."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealingTimeline; 