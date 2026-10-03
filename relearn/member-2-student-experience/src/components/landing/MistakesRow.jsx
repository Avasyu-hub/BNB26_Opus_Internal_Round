import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import MathView from '../MathView';

export default function MistakesRow() {
  const mistakes = [
    {
      id: 'M1',
      name: 'Moving across equals without flipping sign',
      formula: '2x + 5 = 15 \\implies 2x = 15 \\color{#E5484D}{+ 5}',
      code: 'M1',
    },
    {
      id: 'M2',
      name: 'Multiplying only the first term in a bracket',
      formula: '2(x + 3) \\implies 2x + \\color{#E5484D}{3}',
      code: 'M2',
    },
    {
      id: 'M3',
      name: 'Changing one side and forgetting the other',
      formula: '3x + 4 = 19 \\implies 3x = \\color{#E5484D}{19}',
      code: 'M3',
    },
    {
      id: 'M4',
      name: 'Dividing only one term in a fraction',
      formula: '\\frac{2x + 6}{2} \\implies x + \\color{#E5484D}{6}',
      code: 'M4',
    },
    {
      id: 'M5',
      name: 'Adding numbers to letters',
      formula: '3x + 5 \\implies \\color{#E5484D}{8x}',
      code: 'M5',
    },
    {
      id: 'M6',
      name: 'Doing steps in the wrong order',
      formula: '4 + 2x = 10 \\implies \\color{#E5484D}{6x} = 10',
      code: 'M6',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-soft-gradient" aria-labelledby="mistakes-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/80 px-3.5 py-1 rounded-full inline-block shadow-2xs">
            Misconception Engine
          </span>
          <h2
            id="mistakes-heading"
            className="text-h2 sm:text-display-lg font-display text-navy tracking-tight"
          >
            Mistakes we catch
          </h2>
          <p className="text-body text-slate">
            The six most common algebra misunderstandings identified, diagnosed, and resolved.
          </p>
        </div>

        {/* Scrollable on mobile, wrapping grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory">
          {mistakes.map((item) => (
            <Link
              key={item.id}
              to={`/practice?topic=${item.id}`}
              className="min-w-[290px] sm:min-w-0 snap-start flex-1 bg-white p-6 sm:p-7 rounded-[22px] border border-[#E3EEF7] shadow-[0_10px_30px_-12px_rgba(30,111,217,0.16)] hover:shadow-[0_20px_40px_-12px_rgba(30,111,217,0.24)] hover:border-ocean/40 hover:-translate-y-1 transition-all duration-250 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ocean/40 focus-visible:ring-offset-2"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-ocean bg-sky/70 px-3 py-1 rounded-full shadow-2xs">
                    {item.code}
                  </span>
                  <span className="text-small font-semibold text-slate group-hover:text-ocean transition-colors flex items-center gap-1">
                    <span>Practise</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </span>
                </div>

                <h3 className="text-h3 font-body font-bold text-navy mb-5 group-hover:text-ocean transition-colors">
                  {item.name}
                </h3>
              </div>

              {/* KaTeX formula with red strike-through */}
              <div className="bg-mist/90 p-4 rounded-xl border border-[#E3EEF7] text-center shadow-2xs group-hover:bg-sky/20 transition-colors">
                <span className="text-xs font-medium text-slate/80 block mb-1.5 uppercase tracking-wider">
                  Typical error:
                </span>
                <div className="text-h3 font-semibold text-navy">
                  <MathView math={item.formula} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
