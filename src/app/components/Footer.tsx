import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-20 lg:pt-24 overflow-hidden z-10 border-t border-gray-200 bg-gray-50">
      
      {/* Giant Background Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden px-4">
        <h2 className="font-['Sora'] font-black text-[18vw] sm:text-[15vw] md:text-[12vw] lg:text-[10vw] leading-none text-gray-900/[0.02] uppercase tracking-tighter">
          Współpracujmy
        </h2>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-gray-200 pb-12 mb-8">
          
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center hover:opacity-70 transition-opacity">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 lg:h-10 w-auto">
                  {/* Background geometric shape */}
                  <rect x="2" y="8" width="24" height="24" rx="6" fill="#2563EB" fillOpacity="0.1"/>
                  
                  {/* CPU/Processor icon */}
                  <rect x="10" y="16" width="8" height="8" rx="1" stroke="#2563EB" strokeWidth="2" fill="none"/>
                  {/* CPU pins - top */}
                  <line x1="11" y1="14" x2="11" y2="16" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="14" x2="14" y2="16" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="17" y1="14" x2="17" y2="16" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* CPU pins - bottom */}
                  <line x1="11" y1="24" x2="11" y2="26" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="24" x2="14" y2="26" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="17" y1="24" x2="17" y2="26" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* CPU pins - left */}
                  <line x1="8" y1="17" x2="10" y2="17" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="20" x2="10" y2="20" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="10" y2="23" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* CPU pins - right */}
                  <line x1="18" y1="17" x2="20" y2="17" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="20" x2="20" y2="20" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="23" x2="20" y2="23" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  
                  {/* ML IT Text */}
                  <text x="32" y="26" fontFamily="Sora, sans-serif" fontSize="20" fontWeight="700" fill="#111827" letterSpacing="-0.02em">
                    ML
                  </text>
                  <text x="65" y="26" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="600" fill="#2563EB">
                    IT
                  </text>
                </svg>
              </a>
              <h3 className="font-['Sora'] font-bold text-xl text-gray-900">
                Michał Lemanczyk IT
              </h3>
            </div>
            <p className="text-gray-500 font-medium text-sm text-center lg:text-left">
              Profesjonalna pomoc informatyczna dla domu i firmy
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Strona główna
            </a>
            <a href="#uslugi" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Usługi
            </a>
            <a href="#o-mnie" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              O mnie
            </a>
            <a href="#opinie" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Opinie
            </a>
            <a href="#kontakt" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Kontakt
            </a>
          </div>
          
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 font-medium font-['Inter']">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p>© {new Date().getFullYear()} Michał Lemanczyk IT. Wszelkie prawa zastrzeżone.</p>
            <p className="text-xs text-gray-500">Website created and optimized by Konrad Nowicki Software Solutions</p>
          </div>
        </div>
      </div>
    </footer>
  );
}