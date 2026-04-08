import React from 'react';
import { Search, UserCheck, Calendar, CheckCircle } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

const steps = [
  {
    number: '01',
    icon: <Search size={26} color="white" />,
    title: 'Find Your Doctor',
    desc: 'Browse our extensive network of verified specialists. Filter by specialty, location, availability, and patient ratings.',
  },
  {
    number: '02',
    icon: <UserCheck size={26} color="white" />,
    title: 'Check Profile',
    desc: 'Review detailed doctor profiles including credentials, experience, patient reviews, and available time slots.',
  },
  {
    number: '03',
    icon: <Calendar size={26} color="white" />,
    title: 'Book Appointment',
    desc: 'Select your preferred time slot and book instantly. Receive a confirmation and reminder via SMS and email.',
  },
  {
    number: '04',
    icon: <CheckCircle size={26} color="white" />,
    title: 'Get Consultation',
    desc: 'Meet your doctor in-person or online. Access prescriptions and follow-up care all through our platform.',
  },
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Simple Process"
          title="Book Appointments"
          highlight="In 4 Easy Steps"
          subtitle="Getting the healthcare you need has never been easier. Our streamlined process gets you from search to consultation in minutes."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-linear-to-r -z-10 from-sky-200 via-sky-300 to-sky-200 hidden lg:block" />

          {steps.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col items-center text-center group">
              {/* Step Icon */}
              <div className="relative z-10 mb-6 ">
                <div className="w-20 h-20 bg-[#2ea9e3] rounded-3xl gradient-card flex items-center justify-center shadow-xl shadow-sky-200 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border-2 border-[#0EA5E9] flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#0EA5E9]">{idx + 1}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] mb-3">{step.title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;