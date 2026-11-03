import React from 'react';

export default function Sidebar({
  currentScreen,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'grid_view',
      targetScreen: 'selection'
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: 'troubleshoot',
      targetScreen: 'results'
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: 'fact_check',
      targetScreen: 'evidence'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      targetScreen: 'selection'
    }
  ];

  // Helper to determine if an item is considered active
  const isItemActive = (item) => {
    if (item.id === 'evidence' && currentScreen === 'evidence') return true;
    if (item.id === 'investigations' && ['progress', 'results', 'human-review', 'rca-report', 'error', 'empty'].includes(currentScreen)) return true;
    if (item.id === 'overview' && currentScreen === 'selection') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-on-background/50 z-40 lg:hidden transition-opacity backdrop-blur-sm"
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="sidebar-nav"
        className={`fixed left-0 top-0 bottom-0 w-64 bg-on-background z-50 flex flex-col justify-between p-space-lg select-none shadow-[0_1px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-space-2xl">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between px-space-xs">
            <div
              className="flex items-center gap-space-md cursor-pointer"
              onClick={() => onNavigate('selection')}
            >
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px]">neurology</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-surface tracking-tight leading-none">
                  RootIQ
                </span>
                <span className="font-label-sm text-label-sm text-surface-dim uppercase tracking-wider mt-1">
                  RCA Copilot
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-surface-dim hover:text-surface p-1 rounded-lg"
              aria-label="Close Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-space-xs">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.targetScreen);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-all text-left ${
                    active
                      ? 'bg-primary-container text-on-primary font-headline-sm shadow-sm'
                      : 'text-surface-dim font-headline-sm text-headline-sm hover:bg-surface-container-lowest/10 hover:text-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Online Status Footer */}
        <div className="pt-space-md flex flex-col gap-2">
          <div className="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container-lowest/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span className="font-code-sm text-code-sm text-surface-dim">System Online v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
