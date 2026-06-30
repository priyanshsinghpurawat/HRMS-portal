
import Logo from "../../assets/img/pngLogo.png";
import { Link } from "react-router-dom";
import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

function FooterBanner({ hideCTA = false }) {
  return (
    <footer className="bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] text-gray-900 relative overflow-hidden">
      {!hideCTA && (
        <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left shadow-xl">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Ready To Find Your
                <br className="hidden md:block" /> Dream Job?
              </h2>

              <p className="mt-4 text-orange-100 text-base md:text-lg max-w-xl mx-auto lg:mx-0">
                Join thousands of professionals and discover better opportunities
                with JobDekho.
              </p>
            </div>

          </div>
        </div>
      )}
      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12 border-t border-orange-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          
          {/* 1. Brand & Social Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 lg:pr-4">
            <div className="flex items-center mb-4">
              <img
                className="h-20 md:h-24 w-auto object-contain cursor-pointer"
                src={Logo}
                alt="JobDekho Logo"
              />
            </div>
            <p className="text-gray-600 leading-relaxed text-sm mb-6">
              The ultimate platform to find your next career move, hire top talent, 
              and manage your workforce. We connect ambitious professionals with 
              industry-leading companies worldwide.
            </p>
            
            {/* Social Links */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Follow Us</h4>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-all duration-300 shadow-sm text-sm">
                  <FaLinkedinIn />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-all duration-300 shadow-sm text-sm">
                  <SiX />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-all duration-300 shadow-sm text-sm">
                  <FaFacebookF />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-all duration-300 shadow-sm text-sm">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>

          {/* 2. For Job Seekers */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-gray-900 mb-4 relative inline-block">
              For Candidates
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
              {[
                { name: "Browse Jobs", path: "/jobs" },
                { name: "Top Companies", path: "/companies" },
                { name: "Salary Estimator", path: "/salary-guide" },
                { name: "Resume Builder", path: "/resume-builder" },
                { name: "Career Advice", path: "/blog" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-transform duration-200 flex items-center cursor-pointer">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. For Employers */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-gray-900 mb-4 relative inline-block">
              For Employers
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
              {[
                { name: "Post a Job", path: "/post-job" },
                { name: "Browse Candidates", path: "/candidates" },
                { name: "Employer Dashboard", path: "/company-dashboard" },
                { name: "HR Solutions", path: "/hr-dashboard" },
                { name: "Pricing Plans", path: "/pricing" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-transform duration-200 flex items-center cursor-pointer">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Company & Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-gray-900 mb-4 relative inline-block">
              JobDekho
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
              {[
                { name: "About Us", path: "/about-us" },
                { name: "Contact Us", path: "/contact" },
                { name: "Help Center", path: "/faq" },
                { name: "Trust & Safety", path: "/trust" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-transform duration-200 flex items-center cursor-pointer">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Newsletter */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <h3 className="text-base font-bold text-gray-900 mb-4 relative inline-block">
              Stay Updated
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get the latest job openings and career tips delivered to your inbox.
            </p>
            <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all bg-white/50 text-sm"
                required
              />
              <button 
                type="submit" 
                className="w-full bg-[#EA580C] text-white px-3 py-2 rounded-lg font-medium hover:bg-[#c2410c] transition-colors shadow-sm hover:shadow-md text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="bg-gray-900 text-gray-300">
        <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center md:text-left">
            © {new Date().getFullYear()} JobDekho. All Rights Reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link to="/privacy-policy" className="hover:text-[#EA580C] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="hover:text-[#EA580C] transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookies" className="hover:text-[#EA580C] transition-colors">
              Cookie Policy
            </Link>
            <Link to="/accessibility" className="hover:text-[#EA580C] transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterBanner;
