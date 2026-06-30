import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaGithub,
} from "react-icons/fa";
import Logo from "../../../../assets/img/pngLogo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 lg:py-12">
      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-8">
          
          {/* 1. Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 lg:pr-4">
            <div className="flex items-center mb-4">
              <img
                className="h-20 md:h-24 w-auto object-contain brightness-0 invert cursor-pointer"
                src={Logo}
                alt="JobDekho Logo"
              />
            </div>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              Connecting top talent with the best opportunities. We empower professionals to achieve their career goals and help businesses build incredible teams.
            </p>
            
            {/* Social Links */}
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Connect With Us</h4>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#EA580C] transition-all duration-300 text-sm">
                  <FaLinkedinIn />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#EA580C] transition-all duration-300 text-sm">
                  <FaInstagram />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#EA580C] transition-all duration-300 text-sm">
                  <FaFacebookF />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#EA580C] transition-all duration-300 text-sm">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>

          {/* 2. Quick Links - Job Seekers */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Job Seekers
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-gray-400">
              {[
                { name: "Search Jobs", path: "/jobs" },
                { name: "Create Resume", path: "/resume-builder" },
                { name: "Job Alerts", path: "/job-alerts" },
                { name: "Career Resources", path: "/resources" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Quick Links - Employers */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Employers
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-gray-400">
              {[
                { name: "Post a Job", path: "/post-job" },
                { name: "Search Resumes", path: "/candidates" },
                { name: "Pricing", path: "/pricing" },
                { name: "HR Dashboard", path: "/hr-dashboard" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Company */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Company
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-gray-400">
              {[
                { name: "About Us", path: "/about-us" },
                { name: "Contact", path: "/contact" },
                { name: "Partners", path: "/partners" },
                { name: "Blog", path: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="hover:text-[#EA580C] hover:translate-x-1 transition-all duration-200 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Contact Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Contact Us
              <span className="absolute -bottom-1.5 left-0 w-1/2 h-1 bg-[#EA580C] rounded-full"></span>
            </h3>
            <div className="space-y-2.5 text-sm text-gray-400">
              <p>📍 Jaipur, Rajasthan, India</p>
              <p>
                ✉️ <a href="mailto:support@jobdekho.com" className="hover:text-[#EA580C] transition-colors">support@jobdekho.com</a>
              </p>
              <p>📞 +91 98765 43210</p>
            </div>
          </div>
          
        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} JobDekho. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/privacy-policy" className="hover:text-[#EA580C] transition-colors">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:text-[#EA580C] transition-colors">Terms of Service</a>
            <a href="/cookies" className="hover:text-[#EA580C] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
