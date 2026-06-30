import React from 'react';
import { Quote } from 'lucide-react';

const testimonialsData = [
  {
    id: 1,
    name: 'Aboli Patne',
    role: 'HR Executive, Green-Ecomes Solutions Pvt Ltd',
    title: 'JobDekho made Ecomes HR Operations Efficient and Accurate!',
    content: 'We are pleased to report that we are utilizing most of the modules of the JobDekhoo portal, including attendance, leaves, resignation, payroll, and performance. We are satisfied with the service provided by JobDekhoo, which has significantly improved the accuracy and efficiency of our processes.',
    image: 'https://imgs.search.brave.com/nCyynTaR7wbrCtFgz5GeTa6NJWqQSW9e_ixY1dRcuQc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQz/NjA0MDYxMS92ZWN0/b3Ivc29mdHdhcmUt/ZGV2ZWxvcGVyLTJk/LXZlY3Rvci1pc29s/YXRlZC1pbGx1c3Ry/YXRpb24uanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPTRBWThn/SER5eWNqMVZJYmxq/YnZwUWduOFNzZXBy/ODhZZkw4bU4ydFhM/cGM9'
  },
  {
    id: 2,
    name: 'Rohan Sharma',
    role: 'Technical Lead, TechNova',
    title: 'The best hiring experience we have ever had.',
    content: 'Finding the right talent used to take weeks. With JobDekhoo, we sourced, interviewed, and hired two senior developers within 5 days. The AI-driven matching is incredibly accurate, saving our HR team countless hours of manual filtering.',
    image: 'https://imgs.search.brave.com/eUpI_hjyQUOB9C7GvKW9ubN9lM-tkw6_DzSwjJenX3g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzIv/NDY1LzUxMi9zbWFs/bC8zZC1jYXJ0b29u/LWNoYXJhY3Rlci1h/bmQtY29tcHV0ZXIt/d2l0aC1vcGVuLXBh/Z2VzLXdlYi1hbmFs/eXRpY3Mtc2VvLW9w/dGltaXphdGlvbi1k/YXNoYm9hcmQtZnJl/ZS1waG90by5qcGc'
  },
  {
    id: 3,
    name: 'Priya Desai',
    role: 'Operations Manager, BuildFast',
    title: 'Paperless workflows changed our daily routine entirely.',
    content: 'The transition to JobDekhoo was seamless. The self-service portal empowered our employees to manage their own time-offs and tax documents without constantly emailing HR. It is intuitive, fast, and highly reliable.',
    image: 'https://imgs.search.brave.com/Lj6v56VBfF2khR1z7vgAgfSbccNyo412NYH18cW3CrY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90ZW1w/bGF0ZS5jYW52YS5j/b20vRUFHLUVXQkdm/RU0vMS8wLzE2MDB3/LWRkTUVsaEFSc0hj/LmpwZw'
  }
];

function Testimonials() {
  return (
    <section className="py-20 relative bg-gradient-to-br from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] overflow-hidden min-h-[600px] flex flex-col justify-center">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-200 rounded-full opacity-40 blur-3xl -z-10"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 border-[40px] border-orange-50 rounded-full opacity-50 -z-10"></div>

      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-6 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Testimonials</h2>
          <p className="text-lg text-gray-600">Our Clients Love Us</p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 relative flex flex-col justify-between border border-orange-100/50 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
            >
              {/* Quote Mark Decoration */}
              <Quote size={40} className="absolute top-4 right-4 text-orange-200 opacity-40 z-0" />
              
              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-bold text-gray-950 mb-3 leading-snug group-hover:text-[#EA580C] transition-colors">
                  "{testimonial.title}"
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {testimonial.content}
                </p>
              </div>

              {/* User profile */}
              <div className="flex items-center gap-4 border-t border-orange-100/40 pt-4 mt-auto">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                />
                <div>
                  <h4 className="font-bold text-gray-950 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-orange-600 font-medium">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;