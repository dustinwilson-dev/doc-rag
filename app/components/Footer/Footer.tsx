import React from "react";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[rgb(var(--border))]">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm dark:opacity-70 flex flex-col items-center justify-between">
        <span>© {new Date().getFullYear()} Dustin Wilson</span>
        <span className="hidden sm:block">
          Built with Next.js · Tailwind · Neon
        </span>
      </div>
    </footer>
  );
};

export default Footer;
