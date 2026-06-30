import Navbar from './JobLayoutHome/Navbar'
import HeroSection from './JobLayoutHome/HeroSection'
import PopularSearch from './JobLayoutHome/PopularSearch'
import AboutSection from './JobLayoutHome/AboutSection'
import ReviewSection from './JobLayoutHome/ReviewSection'
import JobCategory from './JobLayoutHome/JobCategory'
import FooterBanner from '../../../Pages/Allhomepage/FooterBanner'
function JobHome() {
  return (
    <>
      <Navbar />
      <div className="[content-visibility:auto]">
        <HeroSection />
      </div>
      <div className="[content-visibility:auto]">
        <PopularSearch />
      </div>
      <div className="[content-visibility:auto]">
        <JobCategory />
      </div>
      <div className="[content-visibility:auto]">
        <AboutSection />
      </div>
      <div className="[content-visibility:auto]">
        <ReviewSection />
      </div>
      <div className="[content-visibility:auto]">
        <FooterBanner />
      </div>
    </>
  )
}
export default JobHome