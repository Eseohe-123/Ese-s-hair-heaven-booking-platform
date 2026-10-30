"use client";

import { useId, useState } from "react";

// Password input with a tap-to-reveal eye button. The button is a real
// <button> with a 44px tap target, so it works on phones and with keyboards.
export function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  minLength,
  required = true,
  className = "",
  name,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
  name?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-blush-100 bg-white py-3 pl-4 pr-14 text-sm outline-none placeholder:text-cocoa-500 focus:border-blush-500"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-cocoa-500 hover:bg-blush-50 hover:text-plum-700"
      >
        {visible ? (
          // eye with a slash — tapping hides it again
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M6.61 6.61A18.15 18.15 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="m2 2 20 20" />
          </svg>
        ) : (
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
