import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HeroSlider from "./components/home/HeroSlider";
import AboutSection from "./components/home/AboutSection";
import ActivitiesSection from "./components/home/ActivitiesSection";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <HeroSlider />
        <AboutSection />
        <ActivitiesSection />
      </main>

      <Footer />
    </>
  );
}
