import React from 'react';
import { Stethoscope, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const FbIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
  </svg>
);

const footerLinks = {
  Company: ['About Us', 'Our Team', 'Careers', 'Press', 'Blog'],
  Services: ['Find a Doctor', 'Online Consultation', 'Lab Tests', 'Health Packages', 'Emergency'],
  Patients: ['Book Appointment', 'Medical Records', 'Prescriptions', 'Insurance', 'Help Center'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility', 'Sitemap'],
};


const socials = [
  { icon: <FbIcon />, href: '#' },
  { icon: <TwIcon />, href: '#' },
  { icon: <IgIcon />, href: '#' },
  { icon: <LiIcon />, href: '#' },
];

const Footer = () => (
  <footer id="contact" className="bg-[#0F172A] text-white">
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

      {/* Newsletter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-white/10 mb-12">
        <div>
          <h3 className="text-xl font-bold mb-1">Stay up to date with health tips</h3>
          <p className="text-slate-400 text-sm">Subscribe to our newsletter for expert health advice.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 md:w-64 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-[#0EA5E9] transition-colors"
          />
          <button className="bg-[#0EA5E9] hover:bg-[#0284C7] px-5 py-3 rounded-2xl transition-colors flex items-center gap-2 text-sm font-semibold flex-shrink-0">
            Subscribe <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center">
              <Stethoscope size={18} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
              Medi<span className="text-gradient">Care</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Your trusted healthcare partner. Connecting patients with the best doctors for over a decade.
          </p>
          <div className="space-y-2.5">
            {[
              { icon: <Phone size={14} />, text: '+91 98765 43210' },
              { icon: <Mail size={14} />, text: 'care@medicare.com' },
              { icon: <MapPin size={14} />, text: 'No. 24, Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-sm text-slate-400">
                <span className="text-[#0EA5E9]">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-semibold text-white mb-4 text-sm">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-[#0EA5E9] text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} MediCare. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.href}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#0EA5E9] flex items-center justify-center transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;