import WorkingDetails from "./Workingdetails"
import HrmHero from "./HrmHero"
import HrmIntro from "./Hrmintro"
import NavbarHrm from "./NavbarHrm"
import FooterBanner from "../../../Pages/Allhomepage/FooterBanner"

function HrmsHome() {
  return (
   <>
   <NavbarHrm />
   <HrmHero/>
   <HrmIntro />
   <WorkingDetails/>
   <FooterBanner/>
   </>
  )
}

export default HrmsHome;