import { Phone, Mail, Globe, ArrowRight } from "lucide-react";

export function Contact() {
  return (
    <section id="kontakt" className="py-16 lg:py-20 relative z-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-blue-600 uppercase tracking-widest text-sm font-bold font-['Sora'] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-blue-600"></span> Zróbmy to
            </span>
            <h2 className="font-['Sora'] text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-2">
              Kontakt
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-['Inter'] mb-8">
              Potrzebujesz pomocy ze sprzętem, oprogramowaniem, bezpieczeństwem IT lub stroną internetową? Skontaktuj się ze mną — spróbuję znaleźć odpowiednie rozwiązanie.
            </p>
            
            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Odpowiadam zwykle tego samego dnia.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 flex items-center gap-6 group hover:border-blue-300 transition-colors shadow-md hover:shadow-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:text-blue-700 text-gray-600 transition-colors shrink-0">
                <Phone className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs lg:text-sm text-gray-500 font-medium mb-1">Telefon bezpośredni</span>
                <span className="font-['Sora'] text-lg lg:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">+48 662 612 726</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 flex items-center gap-6 group hover:border-blue-300 transition-colors shadow-md hover:shadow-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:text-blue-700 text-gray-600 transition-colors shrink-0">
                <Mail className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs lg:text-sm text-gray-500 font-medium mb-1">Adres e-mail</span>
                <span className="font-['Sora'] text-lg lg:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-all">michal@lemanczyk-it.pl</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 flex items-center gap-6 group hover:border-blue-300 transition-colors shadow-md hover:shadow-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:text-blue-700 text-gray-600 transition-colors shrink-0">
                <Globe className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs lg:text-sm text-gray-500 font-medium mb-1">Obszar działania</span>
                <span className="font-['Sora'] text-lg lg:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Bydgoszcz i okolice</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}