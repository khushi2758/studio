
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Header: FC = () => {
  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          AestheFit
        </Link>
        <nav className="flex items-center space-x-2">
          <Button asChild variant="ghost">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
