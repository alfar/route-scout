import { useState, ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function CollapsiblePanel({ title, children, defaultCollapsed = false }: CollapsiblePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border rounded shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-t"
        aria-expanded={!collapsed}
      >
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-blue-600">{collapsed ? 'Show' : 'Hide'}</span>
      </button>
      {!collapsed && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
}
