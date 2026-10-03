import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FLAGS from '../config/flags';

export default function Navigation() {
  const { student } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/practice', label: 'Practice' },
    { to: '/profile', label: 'My progress' },
    ...(FLAGS.W7 ? [{ to: '/teacher', label: 'Teacher' }] : []),
    { to: '/evaluation', label: 'Results' },
  ];

  return (
    <header className="sticky top-0 z-50 select-none bg-gradient-to-r from-[#0E4CB5] via-[#1667D3] to-[#0D9488] text-white border-b border-white/15 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Left: Brand Logo & Wordmark */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl p-1"
            >
              {/* Minimalist Logo Badge */}
              <div className="w-9 h-9 rounded-xl bg-white text-[#0E4CB5] flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span>RE:</span>
              </div>

              {/* Brand Title & Tagline */}
              <div className="flex flex-col text-left">
                <span className="text-xl font-extrabold tracking-tight text-white leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  RE:Learn
                </span>
                <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Algebra Intelligence
                </span>
              </div>
            </Link>

            {/* 2. Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isActive
                        ? 'bg-white text-[#0E4CB5] font-semibold shadow-xs'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                    }`
                  }
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* 3. Right: Student Profile Pill */}
          <div className="hidden sm:flex items-center">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-inner">
                {student.avatar || '👨‍🎓'}
              </span>
              <div className="flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-white leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {student.name}
                </span>
                <span className="text-[10px] text-white/70 leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {student.grade || 'Grade 8'}
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/15 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-white text-[#0E4CB5] font-semibold'
                      : 'text-white/85 hover:bg-white/15'
                  }`
                }
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-white/15 flex items-center justify-between px-3 text-xs">
              <span className="text-white/70">Signed in as:</span>
              <span className="text-white font-semibold">{student.name}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
