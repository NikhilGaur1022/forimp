import React from 'react';
import InteractiveHeading from './InteractiveHeading';
import './interactive-heading.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => (
  <section className="bg-gradient-to-r from-dental-600 to-blue-600 text-white pt-20 pb-12 px-4 shadow-lg">
    <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <InteractiveHeading
        className="font-inter font-extrabold text-4xl md:text-5xl lg:text-6xl mb-4 drop-shadow-xl tracking-tight leading-tight"
        style={{
          letterSpacing: '-0.01em',
          textShadow: '0 4px 24px rgba(2,132,199,0.18), 0 1.5px 0 #0369A1',
          lineHeight: 1.13,
        }}
      >
        {title}
      </InteractiveHeading>
      <p
        className="font-inter text-lg md:text-xl font-medium opacity-95 mb-8 max-w-2xl mx-auto text-neutral-100"
        style={{
          textShadow: '0 2px 12px rgba(2,132,199,0.12)',
          letterSpacing: '0.01em',
        }}
      >
        {subtitle}
      </p>
      {children && <div className="mt-4 flex flex-col items-center justify-center gap-4">{children}</div>}
    </div>
  </section>
);

export default PageHeader;
