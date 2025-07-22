import React from "react";

export default function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity duration-300"
    >
      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-8 relative w-full max-w-md border border-gray-100"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-3xl leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
} 