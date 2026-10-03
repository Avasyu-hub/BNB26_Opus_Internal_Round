import React from 'react';

/**
 * Reusable ContentPanel conforming to the RE:Learn design system:
 * - White background
 * - 16px radius
 * - #E3EEF7 border
 * - Subtle blue-tinted shadow
 */
export default function ContentPanel({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  hover = false,
  ...props
}) {
  return (
    <div
      className={`content-panel bg-white p-6 ${
        hover ? 'content-panel-hover' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-start justify-between pb-4 mb-5 ${
            headerBorder ? 'border-b border-[#E3EEF7]' : ''
          }`}
        >
          <div>
            {title && (
              <h2 className="text-xl font-heading font-bold text-[#0F2A44] tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[#5B6B7C] mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
