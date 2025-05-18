import type { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <Link href="/">
          <Image
            src="https://placehold.co/40x40.png" // Temporarily using a placeholder
            alt="AestheFit Logo Placeholder"
            width={40}
            height={40}
            priority
            data-ai-hint="logo brand"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
