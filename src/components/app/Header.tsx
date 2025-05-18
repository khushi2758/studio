import type { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <Link href="/">
          <Image
            src="/logo.png" // User must place logo.png in the /public folder
            alt="AestheFit Logo"
            width={40} // Adjusted for a small, square logo in header
            height={40}
            priority // Preload logo for better LCP
            data-ai-hint="logo brand"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
