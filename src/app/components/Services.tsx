import { Wrench, Download, Shield, Headphones, Globe } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const services = [
  {
    icon: Wrench,
    title: "Serwis sprzętu",
    desc: "Profesjonalna naprawa i konserwacja komputerów, laptopów oraz innego sprzętu IT.",
    image: "https://images.unsplash.com/photo-1769085795297-b45cc8c92f5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVuJTIwbGFwdG9wJTIwaW5zaWRlJTIwaW50ZXJuYWwlMjBjb21wb25lbnRzJTIwaGFyZHdhcmV8ZW58MXx8fHwxNzcyNzk1ODcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Download,
    title: "Instalacja oprogramowania",
    desc: "Konfiguracja systemów operacyjnych, aplikacji i niezbędnego oprogramowania dla Twojego biznesu.",
    image: "https://images.unsplash.com/photo-1758780690553-8bc703fabca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGluc3RhbGxhdGlvbiUyMGxhcHRvcCUyMHNjcmVlbnxlbnwxfHx8fDE3NzI3OTQ2MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Shield,
    title: "Cyberbezpieczeństwo",
    desc: "Ochrona przed zagrożeniami, szyfrowanie danych oraz wdrożenie najlepszych praktyk bezpieczeństwa.",
    image: "https://images.unsplash.com/photo-1696013910376-c56f76dd8178?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwbG9jayUyMHNoaWVsZCUyMHByb3RlY3Rpb258ZW58MXx8fHwxNzcyNzI0MzQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Headphones,
    title: "Wsparcie techniczne",
    desc: "Pomoc w rozwiązywaniu problemów IT, zdalne wsparcie oraz doradztwo technologiczne.",
    image: "https://images.unsplash.com/photo-1684560208006-274881cc4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNrdG9wJTIwY29tcHV0ZXIlMjBtb25pdG9yJTIwa2V5Ym9hcmQlMjBtb3VzZSUyMHdvcmtzdGF0iW9ufGVufDF8fHx8MTc3Mjc5NTg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Globe,
    title: "Strony www",
    desc: "Projektowanie i tworzenie nowoczesnych, responsywnych stron internetowych dla Twojej marki.",
    image: "https://images.unsplash.com/photo-1640158616235-731aa6b43d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHJlc3BvbnNpdmUlMjBkZXNpZ258ZW58MXx8fHwxNzcyNzk0NjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function Services() {
  return (
    <section id="uslugi" className="py-10 sm:py-14 lg:py-20 relative z-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-12">
        
        <h2 className="font-['Sora'] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-600 mb-8 sm:mb-12 lg:mb-16 text-center">
          Kluczowe{" "}
          <span className="text-gray-900">Usługi</span>
        </h2>

        {/* Grid szachownica z 5 kafelkami */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((srv, idx) => (
            <div 
              key={idx}
              className={`bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 transition-all rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl ${
                idx === 4 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''
              }`}
            >
              {/* Obrazek */}
              <div className="relative h-48 lg:h-56 overflow-hidden">
                <ImageWithFallback 
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Ikona na obrazku */}
                <div className="absolute top-4 right-4 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-blue-600">
                  <srv.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Treść */}
              <div className="p-6">
                <h3 className="font-['Sora'] text-xl lg:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                  {srv.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-['Inter'] text-sm lg:text-base">
                  {srv.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
