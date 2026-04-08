import React from 'react';
import { Heart, Brain, Baby, Bone, Eye, Stethoscope, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';

const services = [
  {
    icon: <Heart size={28} />,
    title: 'Cardiology',
    desc: 'Expert heart care with advanced diagnostics and personalized treatment plans.',
    color: 'bg-red-50 text-red-500',
    accent: '#EF4444',
    patients: '12K+ patients',
  },
  {
    icon: <Brain size={28} />,
    title: 'Neurology',
    desc: 'Comprehensive brain and nervous system care from leading neurologists.',
    color: 'bg-purple-50 text-purple-500',
    accent: '#8B5CF6',
    patients: '8K+ patients',
  },
  {
    icon: <Baby size={28} />,
    title: 'Pediatrics',
    desc: "Gentle, specialized healthcare designed for your child's growth and wellbeing.",
    color: 'bg-yellow-50 text-yellow-500',
    accent: '#F59E0B',
    patients: '15K+ patients',
  },
  {
    icon: <Bone size={28} />,
    title: 'Orthopedics',
    desc: 'Advanced bone, joint, and muscle care to keep you moving and pain-free.',
    color: 'bg-sky-50 text-sky-500',
    accent: '#0EA5E9',
    patients: '9K+ patients',
  },
  {
    icon: <Eye size={28} />,
    title: 'Ophthalmology',
    desc: 'Complete eye care services from routine check-ups to complex surgeries.',
    color: 'bg-green-50 text-green-500',
    accent: '#10B981',
    patients: '11K+ patients',
  },
  {
    icon: <Stethoscope size={28} />,
    title: 'General Medicine',
    desc: 'Comprehensive primary care for all ages with preventive health strategies.',
    color: 'bg-orange-50 text-orange-500',
    accent: '#F97316',
    patients: '20K+ patients',
  },
];

const ServiceCard = ({ service }) => (
  <Card className="group cursor-pointer">
    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
      {service.icon}
    </div>
    <h3 className="text-xl font-bold text-[#0F172A] mb-2">{service.title}</h3>
    <p className="text-[#64748B] text-sm leading-relaxed mb-4">{service.desc}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-[#64748B]">{service.patients}</span>
      <ArrowRight size={16} color={service.accent} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </Card>
);

const Services = () => {
  return (
    <section id="services" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Our Specialties"
          title="Comprehensive Care"
          highlight="Across All Specialties"
          subtitle="From routine check-ups to complex treatments, our network of specialists provides expert care tailored to your unique health needs."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;