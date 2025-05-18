import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="py-6 bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-semibold text-primary tracking-tight">
          AestheFit
        </h1>
      </div>
    </header>
  );
};

export default Header;
