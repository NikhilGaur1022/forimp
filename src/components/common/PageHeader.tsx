import React from 'react';
import InteractiveHeading from './InteractiveHeading';
import './interactive-heading.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => (
  <section className="relative overflow-hidden pt-20 pb-16 px-4">
    {/* Premium gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-dental-600 via-dental-700 to-dental-800"></div>
    
    {/* Overlay pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
    </div>
    
    {/* Floating elements */}
    <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl float-element"></div>
    <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl float-element"></div>
    
    <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <div className="relative z-10">
      <InteractiveHeading
        className="font-inter font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 text-white tracking-tight leading-tight"
        style={{
          letterSpacing: '-0.01em',
          textShadow: '0 4px 24px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
          lineHeight: 1.13,
        }}
      >
        {title}
      </InteractiveHeading>
      <p
        className="font-inter text-lg md:text-xl font-medium mb-8 max-w-3xl mx-auto text-white/90 leading-relaxed"
        style={{
          textShadow: '0 2px 12px rgba(0,0,0,0.2)',
          letterSpacing: '0.01em',
        }}
      >
        {subtitle}
      </p>
      {children && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {children}
        </div>
      )}
      </div>
    </div>
  </section>
);

export default PageHeader;
