import useTitle from "@/hooks/useTitle";
import { AlgorithmsSection } from "./components/Algorithmssection ";
import { FeaturesSection } from "./components/Featuressection ";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import { RapportSection } from "./components/Rappoortsection";
import { TimelineSection } from "./components/Timelinesection ";

export default function Home() {
  useTitle("Stockage Platform - Accueil");
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturesSection />
      <TimelineSection />
      <AlgorithmsSection />
      <RapportSection />
      <Footer />
    </main>
  );
}
