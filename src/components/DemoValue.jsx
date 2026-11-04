import React from 'react';
import { SHOW_DEMO_FILLERS } from '../demo/demoConfig';

// Shows the real value when it exists. Otherwise shows the demo value
// (with a faint dashed underline) if demo fillers are on, else "—".
export default function DemoValue({ real, demo, className = '' }) {
  const hasReal = real !== null && real !== undefined && real !== '';
  if (hasReal) return <span className={className}>{real}</span>;
  if (!SHOW_DEMO_FILLERS) return <span className={className}>—</span>;
  return (
    <span
      className={`underline decoration-dashed decoration-1 underline-offset-4 decoration-current/40 ${className}`}
      title="Demo data, not from Supabase"
      data-demo="true"
    >
      {demo}
    </span>
  );
}
