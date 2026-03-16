import { Outlet } from "react-router";

export default function Root() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-['Inter'] selection:bg-[#00FF88] selection:text-black antialiased">
      {/* Subtle grain texture overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>
      <Outlet />
    </div>
  );
}
