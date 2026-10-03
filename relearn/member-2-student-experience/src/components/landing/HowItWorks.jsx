import React from 'react';
import { PenTool, Search, Compass, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Show your working',
      description: 'Type each line, or snap a photo of your notebook.',
      icon: <PenTool className="w-6 h-6 text-ocean" strokeWidth={2} />,
      accentBg: 'bg-sky/60',
      accentGlow: 'hover:shadow-[0_20px_45px_-10px_rgba(30,111,217,0.3)] hover:border-ocean/40',
      badgeBg: 'bg-ocean',
    },
    {
      number: '2',
      title: 'See where and why',
      description: 'We find the exact line that went wrong and the reason behind it.',
      icon: <Search className="w-6 h-6 text-teal" strokeWidth={2} />,
      accentBg: 'bg-[#14A3A3]/15',
      accentGlow: 'hover:shadow-[0_20px_45px_-10px_rgba(20,163,163,0.3)] hover:border-teal/40',
      badgeBg: 'bg-teal',
    },
    {
      number: '3',
      title: "Prove you've got it",
      description: 'Try it again, then in physics, geometry or code.',
      icon: <Compass className="w-6 h-6 text-leaf" strokeWidth={2} />,
      accentBg: 'bg-[#22B573]/15',
      accentGlow: 'hover:shadow-[0_20px_45px_-10px_rgba(34,181,115,0.3)] hover:border-leaf/40',
      badgeBg: 'bg-leaf',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden" aria-labelledby="how-it-works-heading">
      {/* Subtle ambient blur behind steps */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-sky/40 via-mint/40 to-sky/40 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/80 px-3.5 py-1 rounded-full inline-block shadow-2xs">
            Simple 3-Step Remediation
          </span>
          <h2
            id="how-it-works-heading"
            className="text-h2 sm:text-display-lg font-display text-navy tracking-tight"
          >
            How it works
          </h2>
          <p className="text-body text-slate">
            A clear three-step feedback cycle for understanding every line of algebra.
          </p>
        </div>

        {/* 3-Step Sequence with Radiant Progress-Gradient Line */}
        <div className="relative">
          {/* Glowing connecting line behind circles */}
          <div
            className="hidden md:block absolute top-9 left-[15%] right-[15%] h-1 bg-gradient-to-r from-[#1E6FD9] via-[#14A3A3] to-[#22B573] z-0 rounded-full shadow-[0_0_12px_rgba(30,111,217,0.4)]"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center text-center p-8 rounded-[24px] bg-white border border-[#E3EEF7] shadow-[0_12px_36px_-10px_rgba(30,111,217,0.16)] transition-all duration-300 hover:-translate-y-1.5 ${step.accentGlow}`}
              >
                {/* Numbered Circle & Glowing Icon */}
                <div className="relative mb-6">
                  <div className={`w-18 h-18 rounded-2xl ${step.accentBg} border border-white flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105`}>
                    {step.icon}
                  </div>
                  <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${step.badgeBg} text-white font-display font-extrabold text-sm flex items-center justify-center shadow-md ring-4 ring-white`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="text-h3 font-body font-bold text-navy mb-2.5">
                  {step.title}
                </h3>
                <p className="text-body text-slate leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
