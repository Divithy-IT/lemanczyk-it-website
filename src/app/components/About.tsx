import { CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import profileImage from "../../assets/4ab1bd688239c90fb4310c68b8ca79e25559cb2f.png";

const attributes = [
  "Komunikacja", 
  "Terminowość", 
  "Bezpieczeństwo", 
  "Wsparcie techniczne"
];

export function About() {
  return (
    <section id="o-mnie" className="py-10 sm:py-14 lg:py-20 relative z-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-12">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-16 relative overflow-hidden shadow-lg">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-blue-400 opacity-[0.08] blur-[90px] sm:blur-[100px] rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center relative z-10">
            
            <div className="flex flex-col gap-6 sm:gap-8">
              <span className="text-blue-600 uppercase tracking-[0.18em] sm:tracking-widest text-[0.72rem] sm:text-sm font-bold font-['Sora'] flex items-center gap-3">
                <span className="w-6 sm:w-8 h-[2px] bg-blue-600"></span> Michał Lemanczyk
              </span>
              
              <h2 className="font-['Sora'] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                Poznaj mnie
              </h2>
              
              <div className="text-gray-700 text-base sm:text-lg leading-relaxed font-['Inter'] flex flex-col gap-5 sm:gap-6">
                <p>
                  Od dziecka jestem zainteresowany dziedziną informatyki. Zajmuję się pomocą w doborze i zakupie sprzętu komputerowego, montażem, konfiguracją systemów, serwisem oraz zabezpieczeniem danych.
                </p>
                <p>
                  Pomagam również w tworzeniu stron internetowych i rozwiązywaniu problemów związanych z oprogramowaniem. Niezależnie od tego, czy potrzebujesz wsparcia technicznego, czy kompleksowego rozwiązania IT – jestem tu, żeby pomóc.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{attr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[360px] sm:max-w-[500px] aspect-square rounded-[1.5rem] sm:rounded-3xl overflow-hidden border border-blue-200 shadow-xl sm:shadow-2xl p-3 sm:p-4 bg-white/80 backdrop-blur-sm">
                <div className="w-full h-full rounded-[1.1rem] sm:rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay z-10"></div>
                  <ImageWithFallback 
                    src={profileImage} 
                    alt="Michał Lemanczyk" 
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-[1rem] sm:rounded-2xl border border-blue-200 flex items-center justify-center rotate-[-10deg] shadow-lg sm:shadow-xl">
                  <span className="font-['Sora'] font-bold text-3xl sm:text-4xl text-blue-600 opacity-80">{'</>'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
