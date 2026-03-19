import React from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ChurchSearch } from './components/ChurchSearch';
export function App() {
  return (
    <>
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleX {
            from { transform: scaleX(0); opacity: 0; }
            to { transform: scaleX(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-fade-up {
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-scale-x {
            animation: scaleX 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transform-origin: center;
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .delay-100 { animation-delay: 100ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-500 { animation-delay: 500ms; }
          .delay-700 { animation-delay: 700ms; }
          .delay-900 { animation-delay: 900ms; }
          .delay-1100 { animation-delay: 1100ms; }
        `}
      </style>

      <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-[#2E7D32]/30 selection:text-white">
        {/* HERO SECTION */}
        <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-48 bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] flex flex-col items-center justify-center text-center px-4 z-0">
          <AnimatedBackground />

          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-widest animate-fade-up opacity-0 drop-shadow-lg">
              Why So Many?
            </h1>

            <div className="w-24 h-1 bg-white/60 mt-8 mb-6 rounded-full animate-scale-x opacity-0 delay-300"></div>

            <p className="text-lg md:text-xl text-white/80 font-medium tracking-wide animate-fade-up opacity-0 delay-500">
              The question everyone's asking.
            </p>
          </div>
        </section>

        {/* CONTENT SECTION (Overlapping) */}
        <section className="relative z-20 flex-1 flex flex-col items-center px-4 md:px-8 pb-20 w-full max-w-5xl mx-auto">
          {/* VIDEO CARD */}
          <div className="w-full -mt-24 md:-mt-36 lg:-mt-40 animate-fade-up opacity-0 delay-700">
            <div className="p-2 md:p-3 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
              <VideoPlayer />
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div className="mt-16 md:mt-24 max-w-2xl w-full animate-fade-in opacity-0 delay-900">
            <div className="relative p-8 md:p-10 bg-card rounded-2xl shadow-sm border border-border/50">
              {/* Decorative Accent */}
              <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-gradient-to-b from-[#2E7D32] to-[#43A047] rounded-r-full"></div>

              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-medium pl-4 md:pl-6">
                You're probably here because you've seen{' '}
                <strong className="text-[#2E7D32] font-bold">
                  "Why So Many?"
                </strong>{' '}
                signs around town or posts about it on social media. Maybe
                you're wondering what it's all about...and maybe you're also
                wondering why there are so many churches. Watch this short video
                to get answers!
              </p>
            </div>
          </div>

          {/* CHURCH SEARCH SECTION */}
          <div className="mt-20 md:mt-32 max-w-4xl w-full animate-fade-in opacity-0 delay-1100">
            <ChurchSearch />
          </div>
        </section>

        {/* FOOTER ACCENT */}
        <div className="w-full h-2 bg-gradient-to-r from-[#1B5E20] via-[#43A047] to-[#1B5E20] mt-auto"></div>
        <div className="text-center py-6 text-sm text-muted-foreground font-medium tracking-wider">
          WHYSOMANY.COM
        </div>
      </main>
    </>);

}