"use client"; // Required because we're using useState

import type { FC } from 'react';
import Link from 'next/link';
import { useState } from 'react'; // Import useState

const Header: FC = () => {
  const [logoLoadError, setLogoLoadError] = useState(false);

  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
          style={{ minHeight: '40px' }} // Ensure link has appropriate height
        >
          {logoLoadError ? (
            // If logo fails to load, display text
            <span className="leading-[40px]">AestheFit</span>
          ) : (
            // Attempt to display the logo
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo.png" // Path to your logo in the /public folder
              alt="AestheFit Logo" // Alt text for accessibility
              width={40}
              height={40}
              onError={() => {
                // This function is called if the image fails to load
                setLogoLoadError(true);
              }}
              data-ai-hint="logo brand"
            />
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
