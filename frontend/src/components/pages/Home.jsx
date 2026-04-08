import CTABanner from "../sections/CTABanner";
import Services from '../sections/Services';
import Doctors from '../sections/Doctors';
import HowItWorks from '../sections/HowItWorks';
import Testimonials from '../sections/Testimonials';
import Hero from '../sections/Hero';
import Stats from '../sections/Stats';

const Home = () => {
  return (
    <main>
      <Hero />
      <Stats />
      <Services />
      <HowItWorks />
      <Doctors />
      <Testimonials />
      <CTABanner />
    </main>
  );
};

export default Home;