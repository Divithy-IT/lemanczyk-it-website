import { Quote } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Testimonial() {
  const testimonials = [
    {
      text: "Serwis komputera wykonany przez Michała to pełen profesjonalizm. Komputer został dokładnie wyczyszczony, znacząco przyspieszony, a wymiana dysku sprawiła, że działa teraz zdecydowanie szybciej i stabilniej. Wszystko zostało wykonane sprawnie, z dużą dbałością o szczegóły oraz jasnym wyjaśnieniem wykonanych prac. Zdecydowanie polecam każdemu, kto chce przywrócić swojemu sprzętowi pełną wydajność.",
      name: "Agnieszka",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTcyNTYzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      text: "Michał pomógł mi dobrać komputer idealnie dopasowany do moich potrzeb. Od wyboru komponentów, przez ich zakup, montaż, aż po pełną konfigurację systemu – wszystko przebiegło sprawnie i profesjonalnie. Dzięki jego wsparciu otrzymałem sprzęt, który w pełni spełnia moje oczekiwania. Polecam każdemu, kto potrzebuje pomocy w doborze i skompletowaniu komputera!",
      name: "Bartek",
      image: "https://images.unsplash.com/photo-1712687947291-8e89f1f426ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpc2glMjBtYW4lMjBwb3J0cmFpdCUyMHdoaXRlfGVufDF8fHx8MTc3MzA1NzA3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      text: "Po awarii dysku twardego myślałem, że straciłem wszystkie dane. Michał nie tylko odzyskał pliki, ale też zainstalował nowy dysk SSD i skonfigurował system. Komputer działa rewelacyjnie, a podejście Michała do klienta zasługuje na najwyższe uznanie.",
      name: "Łukasz",
      image: "https://images.unsplash.com/photo-1767175473698-859bc73e8e64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXVjYXNpYW4lMjBtYWxlJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczMDU3MDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <section id="opinie" className="py-10 sm:py-14 lg:py-20 relative z-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-12">
        
        <h2 className="font-['Sora'] text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12 lg:mb-16">
          Zadowoleni klienci
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-blue-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>

              <Quote className="w-12 h-12 text-blue-600 mb-6 opacity-80" />
              
              <p className="font-['Inter'] text-base lg:text-lg leading-relaxed text-gray-700 mb-8 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400">
                  <ImageWithFallback 
                    src={testimonial.image}
                    alt={`${testimonial.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-['Sora'] font-bold text-gray-900 text-base">{testimonial.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
