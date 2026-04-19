import React from "react";

/** Simple WhatsApp share button (no SDK). Uses wa.me link. */
export default function WhatsAppShareButton({ text, label = "Share on WhatsApp", className = "", testid = "whatsapp-share-btn" }) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testid}
      className={`inline-flex items-center gap-2 rounded-full px-4 h-10 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium transition-colors ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.64a11.89 11.89 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.46-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98.99-3.63-.23-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.45-9.91 9.9-9.91 2.65 0 5.13 1.03 7 2.9a9.86 9.86 0 0 1 2.9 7c0 5.46-4.44 9.88-9.92 9.88Zm5.44-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17-.35.22-.65.07a8.21 8.21 0 0 1-4.08-3.56c-.31-.53.31-.49.89-1.64.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.11 3.22 5.12 4.52.71.31 1.27.49 1.71.62.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34Z" />
      </svg>
      {label}
    </a>
  );
}
