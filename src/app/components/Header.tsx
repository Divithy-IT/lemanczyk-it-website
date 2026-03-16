import { handleScrollToTop, handleSectionLinkClick } from "../utils/scrollToSection";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 transition-all py-4 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        <a href="#" onClick={handleScrollToTop} className="flex items-center hover:opacity-70 transition-opacity">
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

        <div className="flex items-center gap-4">
          <a href="#" onClick={handleScrollToTop} className="hidden md:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 transition-all">
            Strona główna
          </a>
          <a href="#uslugi" onClick={(event) => handleSectionLinkClick(event, "uslugi")} className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 transition-all">
            Usługi
          </a>
          <a href="#o-mnie" onClick={(event) => handleSectionLinkClick(event, "o-mnie")} className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 transition-all">
            O mnie
          </a>
          <a href="#opinie" onClick={(event) => handleSectionLinkClick(event, "opinie")} className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 transition-all">
            Opinie
          </a>
          <a href="#kontakt" onClick={(event) => handleSectionLinkClick(event, "kontakt")} className="inline-flex px-5 py-2.5 rounded-full text-sm font-semibold border border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white transition-all shadow-sm hover:shadow-md">
            Kontakt
          </a>
        </div>
      </div>
    </header>
  );
}
