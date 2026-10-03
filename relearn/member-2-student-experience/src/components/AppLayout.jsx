import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

export default function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-page-gradient flex flex-col font-body text-navy selection:bg-sky selection:text-navy relative overflow-x-hidden">
      {/* Radiant Fixed Multi-Color Ambient Auroras */}
      <div
        className="fixed top-[-10%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-[#1E6FD9]/15 via-[#14A3A3]/12 to-transparent blur-[140px] pointer-events-none z-0 animate-glow"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tl from-[#22B573]/15 via-[#14A3A3]/12 to-transparent blur-[140px] pointer-events-none z-0 animate-glow"
        style={{ animationDelay: '2.5s' }}
        aria-hidden="true"
      />
      <div
        className="fixed top-[45%] right-[20%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-[#DCEBFA]/35 blur-[120px] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Navigation Header */}
      <Navigation />

      {/* Main Content Area */}
      {isLanding ? (
        <main className="flex-1 w-full relative z-10">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Outlet />
        </main>
      )}
    </div>
  );
}
