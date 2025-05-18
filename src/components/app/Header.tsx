import type { FC } from 'react';
// import Image from 'next/image'; // Temporarily commented out
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://placehold.co/40x40.png"
            alt="AestheFit Logo Placeholder"
            width={40}
            height={40}
            data-ai-hint="logo brand"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
