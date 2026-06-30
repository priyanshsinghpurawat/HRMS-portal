import CTASection from "./Allhomepage/CTASection";
import FooterBanner from "./Allhomepage/FooterBanner";
import HeroSection from "./Allhomepage/HeroSection";
import JobCategories from "./Allhomepage/JobCategories";
import Testimonials from "./Allhomepage/Testimonials";
import TrustedCompanies from "./Allhomepage/TrustedCompanies";
import WhyChooseUs from "./Allhomepage/WhyChooseUs";
import Navbar from "./Navbar";

function MasterHome() {
  return (
    <>
       <Navbar />
       <div className="">
         <HeroSection />
         <TrustedCompanies />
         
         <WhyChooseUs />
         <JobCategories />
         <Testimonials />
         <CTASection />
         <FooterBanner />
       </div>
    </>
  );
}

export default MasterHome;