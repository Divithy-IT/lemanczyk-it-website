import { Building2, CalendarDays, CheckCircle2, Hash, MapPin } from "lucide-react";

const companyDetails = [
  {
    label: "Nazwa",
    value: "MICHAŁ LEMANCZYK IT",
    icon: Building2,
  },
  {
    label: "REGON",
    value: "544222506",
    icon: Hash,
  },
  {
    label: "Status VAT",
    value: (
      <>
        Czynny VAT europejski:
        <br />
        PL9532817901
      </>
    ),
    icon: CheckCircle2,
  },
  {
    label: "Data założenia firmy",
    value: "2026-03-11",
    icon: CalendarDays,
  },
  {
    label: "Adres",
    value: "OGRODY 17/90, 85-870 BYDGOSZCZ",
    icon: MapPin,
  },
  {
    label: "Data rejestracji VAT",
    value: "2026-03-14",
    icon: CalendarDays,
  },
];

export default function CompanyData() {
  return (
      <main id="main-content" className="bg-white text-gray-900">
        <section className="relative z-10 py-14 sm:py-20 lg:py-28">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-12">
            <div className="max-w-5xl">
              <span className="text-blue-600 uppercase tracking-widest text-sm font-bold font-['Sora'] flex items-center gap-3">
                <span className="w-8 h-[2px] bg-blue-600"></span> Dane firmy
              </span>
              <h1 className="mt-6 font-['Sora'] text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 break-words">
                NIP: 9532817901
              </h1>
              <p className="mt-5 max-w-3xl text-gray-600 text-base sm:text-lg leading-relaxed font-['Inter']">
                Podstawowe dane do faktury i szybkiej weryfikacji działalności.
              </p>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl">
              {companyDetails.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border border-gray-200 bg-white rounded-3xl p-6 sm:p-7 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="mt-2 font-['Sora'] text-xl sm:text-2xl font-semibold text-gray-900 break-words">
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500 font-medium">
              Źródło danych: Wykaz podatników VAT Ministerstwa Finansów, stan na 2026-06-15.
            </p>
          </div>
        </section>
      </main>
  );
}
