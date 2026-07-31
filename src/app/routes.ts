import { createBrowserRouter } from "react-router";
import SiteChrome from "./components/SiteChrome";
import CompanyData from "./components/CompanyData";
import { AboutPage, ContactPage, HomePage, NotFoundPage, PortfolioPage, PrivacyPage, ServicesPage, TechnologiesPage } from "./components/Pages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SiteChrome,
    children: [
      { index: true, Component: HomePage },
      { path: "o-mnie", Component: AboutPage },
      { path: "uslugi", Component: ServicesPage },
      { path: "portfolio", Component: PortfolioPage },
      { path: "technologie", Component: TechnologiesPage },
      { path: "kontakt", Component: ContactPage },
      { path: "polityka-prywatnosci", Component: PrivacyPage },
      { path: "dane-firmy", Component: CompanyData },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
