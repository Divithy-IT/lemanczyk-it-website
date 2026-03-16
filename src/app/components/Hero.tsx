import { motion } from "motion/react";
import { ArrowRight, Phone, CheckCircle2, Bot, Shield, BarChart2 } from "lucide-react";
import heroImage from "figma:asset/7937cb277bd729564e71f0583ecc959a9f46009c.png";

export function Hero() {
  return (
    <section className="relative pt-7 lg:pt-11 pb-8 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 opacity-[0.08] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-8">
            <h1 className="font-['Sora'] text-6xl lg:text-[5.5rem] leading-[1.05] font-bold text-gray-900 tracking-tighter">
              Michał Lemanczyk <br />
              IT
            </h1>
            
            <div className="flex flex-col gap-4 max-w-lg border-l-2 border-blue-600/40 pl-6">
              <h2 className="font-['Sora'] text-2xl lg:text-3xl font-semibold text-gray-700 leading-snug">
                Profesjonalna pomoc informatyczna dla domu i firmy
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <a href="#kontakt" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                <Phone className="w-5 h-5" />
                Kontakt
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-gray-200 bg-white shadow-2xl">
              {/* Blue overlay filter */}
              <div className="absolute inset-0 bg-blue-600 mix-blend-color opacity-10 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
              
              <img 
                src={heroImage} 
                alt="Montaż sprzętu komputerowego - Michał Lemanczyk IT" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}