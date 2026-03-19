import React from 'react';
export function AnimatedBackground() {
  return (
    <>
      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-50px, 30px) scale(0.9); }
            66% { transform: translate(20px, -20px) scale(1.1); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(20px, 40px) scale(1.1); }
            66% { transform: translate(-40px, -30px) scale(0.9); }
          }
          .animate-float-1 { animation: float1 18s ease-in-out infinite; }
          .animate-float-2 { animation: float2 22s ease-in-out infinite; }
          .animate-float-3 { animation: float3 25s ease-in-out infinite; }
          
          .bg-dot-pattern {
            background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
            background-size: 24px 24px;
          }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle dot grid texture */}
        <div className="absolute inset-0 bg-dot-pattern opacity-50 mix-blend-overlay"></div>

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-400/20 rounded-full blur-3xl animate-float-1 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[35rem] h-[35rem] bg-teal-400/20 rounded-full blur-3xl animate-float-2 mix-blend-screen"></div>
        <div className="absolute top-[20%] left-[40%] w-[30rem] h-[30rem] bg-green-300/15 rounded-full blur-3xl animate-float-3 mix-blend-screen"></div>
      </div>
    </>);

}