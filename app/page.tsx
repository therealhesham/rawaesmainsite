import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AboutSection } from "./components/AboutSection";
import { PillSection } from "./components/PillSection";
import { SectorsSection } from "./components/SectorsSection";
import { ValuesSection } from "./components/ValuesSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <PillSection />
        <SectorsSection />
        <ValuesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
