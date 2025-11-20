import { useEffect, useState } from 'react';
import Sidebar from '../shell/Sidebar.jsx';
import Topbar from '../shell/Topbar.jsx';

export default function MainLayout({
  children,
  activePersonaId,
  onPersonaChange,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(167,139,250,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.25), transparent 50%)',
        }}
      />
      <div className="noise-overlay" aria-hidden="true" />
      {/* Desktop sidebar */}
      <Sidebar variant="desktop" />

      {/* Mobile sidebar */}
      <Sidebar
        variant="mobile"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-br from-surfaceAlt/80 via-bg/60 to-surface/40 backdrop-blur-3xl">
        <Topbar
          activePersonaId={activePersonaId}
          onPersonaChange={onPersonaChange}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 pt-5 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
