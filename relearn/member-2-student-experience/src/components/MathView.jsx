import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * MathView component to render LaTeX expressions cleanly with KaTeX
 */
export default function MathView({
  math = '',
  display = false,
  className = '',
  errorColor = '#E5484D',
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        errorColor,
      });
    } catch {
      return math;
    }
  }, [math, display, errorColor]);

  return (
    <span
      className={`inline-block font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
