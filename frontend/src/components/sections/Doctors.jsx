import React from 'react';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';
import doctors from '../../data/doctors';

const DoctorCard = ({ doctor }) => (
  <Card className="group h-full flex flex-col justify-between p-5 hover:shadow-xl transition-all duration-300">

    {/* TOP */}
<div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">

        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">

          {/* Name + Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[#0F172A] truncate">
                {doctor.name}
              </h3>

              {/* ✅ SPECIALTY (highlighted) */}
              <p className="text-sky-600 text-xs font-medium">
                {doctor.specialty}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Badge
                color={doctor.badgeColor}
                className="text-xs px-2 py-0.5 whitespace-nowrap"
              >
                {doctor.badge}
              </Badge>
            </div>
          </div>

        </div>
      </div>

      {/* ✅ LOCATION BELOW (clean placement) */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
        <MapPin size={12} className="text-sky-500 flex-shrink-0" />
        <span className="truncate">{doctor.hospital}</span>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
        <Clock size={12} className="text-sky-500 flex-shrink-0" />
        <span>
          Next: <strong className="text-[#0F172A]">{doctor.available}</strong>
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 my-3" />

      {/* Rating */}
      <div className="flex items-center justify-between text-xs">

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              fill={i < Math.floor(doctor.rating) ? '#FBBF24' : '#E5E7EB'}
              color={i < Math.floor(doctor.rating) ? '#FBBF24' : '#E5E7EB'}
            />
          ))}
          <span className="ml-1 font-medium">{doctor.rating}</span>
          <span className="text-[#64748B]">({doctor.reviews})</span>
        </div>

        <div>
          <span className="font-medium">{doctor.experience}</span>
          <span className="text-[#64748B] ml-1">exp.</span>
        </div>

      </div>
    </div>

    {/* BUTTON */}
    <div className="mt-5">
      <Button
        variant="primary"
        size="sm"
        fullWidth
        icon={<ArrowRight size={14} />}
        className="rounded-xl"
      >
        Book Appointment
      </Button>
    </div>

  </Card>
);

const Doctors = () => {
  return (
    <section id="doctors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Our Specialists"
          title="Meet Our Expert"
          highlight="Medical Team"
          subtitle="Board-certified doctors with decades of combined experience, dedicated to providing you with the highest standard of care."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.slice(0,4).map((doctor) => (
            <DoctorCard key={doctor.name} doctor={doctor} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="secondary" size="lg">
            View All Doctors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;