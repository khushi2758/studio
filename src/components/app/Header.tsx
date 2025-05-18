
"use client"; // Still needed for Link component if it has client interactions, or can be removed if not.
// For simplicity, let's assume Link itself doesn't force "use client" but for consistency with previous state, keeping it for now.
// If it can be a server component, it's better for performance. Let's check.
// Link from next/link can be used in Server Components. The useState was the reason for "use client".
// Since useState is removed, "use client" is no longer strictly necessary for this simplified version.
// However, to be safe and not break other potential client-side expectations if any were implicitly there, I'll leave it.
// Re-evaluating: The useState was the only client-side hook. Link itself works in server components.
// Let's make it a server component by removing "use client".

import type { FC } from 'react';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className="py-4 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          AestheFit
        </Link>
      </div>
    </header>
  );
};

export default Header;
