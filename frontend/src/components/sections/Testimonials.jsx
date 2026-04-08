import React from 'react';
import { Star, Quote } from 'lucide-react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';

const testimonials = [
  {
    name: 'Emma Thompson',
    role: 'Marketing Manager',
    rating: 5,
    text: "MediCare changed how I manage my family's health. Booking now takes seconds.",
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    name: 'Robert Hayes',
    role: 'Software Engineer',
    rating: 5,
    text: 'Seamless experience. Same-day appointment and instant prescription.',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    name: 'Aisha Patel',
    role: 'School Teacher',
    rating: 5,
    text: "Managing my family's appointments is now super easy.",
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
];

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(count)].map((_, i) => (
      <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
    ))}
  </div>
);

const TestimonialCard = ({ t }) => (
  <Card className="flex flex-col h-full p-5 hover:shadow-xl transition duration-300">

    {/* Quote */}
    <Quote size={28} className="text-sky-500 opacity-40 mb-3" />

    {/* Text */}
    <p className="text-[#1E293B] text-sm leading-relaxed mb-6 flex-1">
      {t.text}
    </p>

    {/* Footer */}
    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">

      {/* Avatar */}
      <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm">
        <img
          src={t.image}
          alt={t.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div>
        <p className="font-semibold text-[#0F172A] text-sm">
          {t.name}
        </p>
        <p className="text-[#64748B] text-xs">
          {t.role}
        </p>
      </div>

      {/* Stars */}
      <div className="ml-auto">
        <Stars count={t.rating} />
      </div>

    </div>
  </Card>
);

const Testimonials = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeader
        badge="Patient Stories"
        title="What Our Patients"
        highlight="Are Saying"
        subtitle="Join thousands of satisfied patients who have experienced the future of healthcare with MediCare."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;