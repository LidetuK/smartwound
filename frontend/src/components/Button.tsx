"use client";

import React from "react";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  className,
  children,
  variant = "primary",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 