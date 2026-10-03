import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import FLAGS from '../../config/flags';

export default function Footer() {
  const { language, setLanguage } = useApp();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'bn', label: 'বাংলা' },
  ];

  return (
    <footer className="bg-white border-t border-[#E3EEF7] py-12 text-slate text-body font-body" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & Target Audience */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-navy text-xl">RE:Learn</span>
              <span className="text-slate/40">&middot;</span>
              <span className="text-small font-medium text-slate">built for Classes 7–10</span>
            </div>
            <p className="text-small text-slate flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal shrink-0" strokeWidth={1.75} />
              <span>We never use your camera or microphone.</span>
            </p>
          </div>

          {/* Language Switcher (if W5 is on) */}
          {FLAGS.W5 && (
            <div className="flex items-center gap-2.5">
              <span className="text-small font-semibold text-slate uppercase tracking-wider">
                Language:
              </span>
              <div className="flex items-center bg-mist rounded-xl p-1 border border-[#E3EEF7]" role="group" aria-label="Language selection">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3.5 py-1.5 text-small font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                      language === lang.code
                        ? 'bg-white text-navy font-semibold shadow-xs border border-[#E3EEF7]'
                        : 'text-slate hover:text-navy'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
