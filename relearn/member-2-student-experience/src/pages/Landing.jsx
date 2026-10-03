import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import HeroDemo from '../components/landing/HeroDemo';
import HowItWorks from '../components/landing/HowItWorks';
import MistakesRow from '../components/landing/MistakesRow';
import TeacherPreview from '../components/landing/TeacherPreview';
import Footer from '../components/landing/Footer';
import FLAGS from '../config/flags';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-body selection:bg-sky selection:text-navy">
      {/* 1. RADIANT HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B4FBD] via-[#1A73E8] via-50% to-[#0D9488] text-white overflow-hidden pt-10 sm:pt-14 lg:pt-18 pb-20 sm:pb-28 lg:pb-32">
        {/* Luminous Ambient Light Glows */}
        <div
          className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-white/20 via-[#38BDF8]/20 to-transparent blur-[140px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#34D399]/35 via-[#0EA5E9]/25 to-transparent blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
              {/* Highlight Tag Pill */}
              <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/25 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/40 text-white shadow-sm animate-fade-in transition-all">
                <Sparkles className="w-4 h-4 text-[#FFF3B0]" strokeWidth={2.2} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Targeted Step-by-Step Algebra Diagnosis
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-display-lg xl:text-display-xl leading-[1.08] tracking-[-0.03em] text-white drop-shadow-sm">
                Fixing a wrong answer isn't the same as fixing the{' '}
                <span className="text-[#FFF3B0] font-extrabold relative inline-block">
                  misconception.
                </span>
              </h1>

              {/* Sub-line */}
              <p className="text-body sm:text-lg lg:text-xl text-white/95 leading-relaxed max-w-2xl font-normal">
                Re:Learn finds the exact step where your algebra goes wrong, shows you why, and checks that you really understand it.
              </p>

              {/* Action Buttons & Feature Chips */}
              <div className="space-y-6 pt-2">
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  <Link
                    to="/practice"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-[#0B4FBD] font-body font-bold text-base sm:text-lg shadow-[0_12px_30px_-5px_rgba(11,79,189,0.5)] hover:bg-[#F4F9FC] hover:shadow-[0_18px_40px_-5px_rgba(11,79,189,0.6)] hover:scale-103 active:scale-98 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                  >
                    <span>Start practising</span>
                    <ArrowRight className="w-5 h-5 text-[#0B4FBD]" strokeWidth={2.5} />
                  </Link>

                  {FLAGS.W7 && (
                    <Link
                      to="/teacher"
                      className="inline-flex items-center gap-2 text-white text-small sm:text-body font-bold px-5 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-sm hover:scale-102"
                    >
                      <span>I'm a teacher</span>
                      <ArrowRight className="w-4 h-4 opacity-80" strokeWidth={2.2} />
                    </Link>
                  )}
                </div>

                {/* Quick Trust Highlights */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white font-bold pt-1">
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" strokeWidth={2.5} />
                    <span>6 Fixed Misconceptions</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" strokeWidth={2.5} />
                    <span>Multi-Domain Transfer</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" strokeWidth={2.5} />
                    <span>No Camera or Mic Needed</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Live Mini Demo Notebook Card */}
            <div className="lg:col-span-5 w-full">
              <HeroDemo />
            </div>
          </div>
        </div>

        {/* Soft White Curved Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-0">
          <svg
            className="relative block w-full h-10 sm:h-16 lg:h-20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <HowItWorks />

      {/* 3. MISTAKES WE CATCH */}
      <MistakesRow />

      {/* 4. FOR TEACHERS */}
      <TeacherPreview />

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}
