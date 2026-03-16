import { Header } from "./Header";
import { Hero } from "./Hero";
import { Services } from "./Services";
import { About } from "./About";
import { Testimonial } from "./Testimonial";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero />
        <Services />
        <About />
        <Testimonial />
        <Contact />
      </main>
      <Footer />
    </>
  );
}