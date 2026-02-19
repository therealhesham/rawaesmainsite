import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AboutSection } from "./components/AboutSection";
import { PillSection } from "./components/PillSection";
import { ValuesSection } from "./components/ValuesSection";
import { WhyUsSection } from "./components/WhyUsSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { getContactUs } from "./contact/getContactUs";

export default async function Home() {
  const contact = await getContactUs();
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <PillSection />
        <ValuesSection />
        <ContactSection contact={contact} />
      </main>
      <Footer />
    </div>
  );
}
