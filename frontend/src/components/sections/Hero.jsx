import React from 'react';
import {
  Calendar,
  Shield,
  CheckCircle,
  Play,
  Clock,
  Users,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import Button from '../ui/Button';
import Badge from '../ui/Badge';

/* ── Static Data ── */
const checks = [
  'No waiting rooms',
  'Instant confirmation',
  'Secure & confidential',
];

const doctors = [
  { name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', rating: '4.9' },
  { name: 'Dr. James Chen', specialty: 'Neurologist', rating: '4.8' },
  { name: 'Dr. Priya Sharma', specialty: 'Pediatrician', rating: '5.0' },
  { name: 'Dr. Marcus Lee', specialty: 'Orthopedist', rating: '4.7' },
];

/* ── Doctor Chip ── */
const DoctorChip = ({ name, specialty, rating }) => (
<div className='hidden lg:block'>
    <div className="glass  px-3 py-2 rounded-xl backdrop-blur-sm shadow-md flex items-center gap-2 bg-white/70">
    <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-xs font-bold">
      {name.charAt(4)}
    </div>
    <div className="text-left">
      <p className="text-xs font-semibold text-[#0F172A]">{name}</p>
      <p className="text-[10px] text-[#64748B]">{specialty}</p>
      <p className="text-[10px] font-bold text-sky-500">★ {rating}</p>
    </div>
  </div>
</div>
);

/* ── Floating Info Pill ── */
const FloatingPill = ({ icon, label, value, className }) => (
  <div
    className={`glass rounded-2xl px-3 py-2.5 shadow-xl flex items-center gap-2.5 bg-white/80 backdrop-blur-sm ${className}`}
  >
    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center shadow-md">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-[#64748B] font-medium">{label}</p>
      <p className="text-xs font-bold text-[#0F172A]">{value}</p>
    </div>
  </div>
);
const ECGStrip = ({ top = true }) => (
  <svg
    className={`absolute left-0 w-full h-40 ${top ? 'top-[40%]' : 'bottom-[10%]'} opacity-60`}
    viewBox="0 0 1200 200"
    preserveAspectRatio="none"
  >
    <path
      d="M0 100 
         L100 100 
         L120 100 
         L140 30 
         L160 170 
         L180 100 
         L220 100 
         L240 100 
         L260 100 
         L280 30 
         L300 170 
         L320 100 
         L360 100
         L380 100
         L400 30
         L420 170
         L440 100
         L1200 100"
      fill="none"
      stroke="#0EA5E9"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2000"
      strokeDashoffset="2000"
      className="heartbeat-line"
    />
  </svg>
);

/* ── Main Hero Component ── */
const Hero = () => {
  return (
    <section
      id="home"
      className="gradient-hero min-h-screen flex items-center overflow-hidden pt-20 pb-12 relative bg-gradient-to-br from-sky-50 via-white to-blue-50"
    >
      {/* 1. Fading Grid */}
      <div className="absolute inset-0 hero-grid z-0" />
      
 
      {/* 3. Breathing Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="blob-1 absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-sky-200/30 to-blue-200/30 blur-3xl" />
        <div className="blob-2 absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-200/20 to-cyan-200/20 blur-3xl" />
        <div className="blob-3 absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-sky-300/10 to-indigo-300/10 blur-3xl" />
      </div>
      
      {/* 4. Pulse Rings */}
      <div className="absolute left-[65%] top-1/2 -translate-y-1/2 z-0  hidden lg:block">
        <div className="ring-1 absolute w-20 h-20 rounded-full border-2 border-sky-400/60 -translate-x-1/2 -translate-y-1/2" />
        <div className="ring-2 absolute w-20 h-20 rounded-full border-2 border-sky-400/60 -translate-x-1/2 -translate-y-1/2" />
        <div className="ring-3 absolute w-20 h-20 rounded-full border-2 border-sky-400/60 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* 5. ECG Waveforms */}
      <ECGStrip top={true} />
       
      {/* 6. Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`particle-${i + 1} absolute bottom-0 w-1 h-1 rounded-full bg-sky-400/60`}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animation: `particleUp ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.4 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>
      
      {/* 7. Cross/Plus Markers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top Left */}
        <svg className="absolute top-8 left-8 w-6 h-6 opacity-20" viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Top Right */}
        <svg className="absolute top-8 right-8 w-6 h-6 opacity-20" viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Bottom Left */}
        <svg className="absolute bottom-8 left-8 w-6 h-6 opacity-20" viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Bottom Right */}
        <svg className="absolute bottom-8 right-8 w-6 h-6 opacity-20" viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 text-center lg:text-left">

            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <Badge color="blue" className="inline-flex whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse inline-block mr-1.5" />
                Trusted Healthcare Platform
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-[#0F172A] leading-tight">
              Your Health,
              <span className="text-gradient block">Our Priority</span>
              Book in Seconds
            </h1>

            <p className="text-[#64748B] text-lg max-w-lg mx-auto lg:mx-0">
              Connect with <strong>500+ verified doctors</strong> across 20+
              specialties. Same-day appointments made simple.
            </p>

            {/* Checks */}
            <ul className="space-y-2 flex flex-col items-center lg:items-start">
              {checks.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <CheckCircle size={16} color="#0EA5E9" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to = "/doctors">
              <Button variant="primary" size="lg" icon={<Calendar size={18} />}>
                Book Appointment
              </Button>
                </Link>
              <Button variant="secondary" size="lg" icon={<Play size={15} />}>
                How It Works
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - Hidden on mobile, visible on desktop */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Card container with border radius 10px */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-[10px] p-2 shadow-2xl">
              <div className="rounded-[10px] overflow-hidden">
                <img
                  src="/images/heero.png"
                  alt="Doctor"
                  className="w-80 h-auto object-cover rounded-[10px]"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x400?text=Doctor';
                  }}
                />
              </div>
            </div>

            {/* Floating Pills */}
            <FloatingPill
              icon={<Shield size={14} color="white" />}
              label="Verified"
              value="100% Certified"
              className="absolute top-6 left-4"
            />
            <FloatingPill
              icon={<Clock size={14} color="white" />}
              label="Available"
              value="Today"
              className="absolute bottom-10 left-0"
            />
            <FloatingPill
              icon={<Users size={14} color="white" />}
              label="Patients"
              value="50,000+"
              className="absolute right-0 top-1/2 -translate-y-1/2"
            />

            {/* Doctor Chips */}
            <div className="absolute top-4 right-4 flex  flex-col gap-2">
              {doctors.slice(0, 3).map((d) => (
                <DoctorChip key={d.name} {...d} />
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE DOCTORS - Visible only on mobile */}
        <div className="mt-8 grid grid-cols-2 gap-2 lg:hidden">
          {doctors.map((d) => (
            <DoctorChip key={d.name} {...d} />
          ))}
        </div>
      </div>

      {/* Add global styles for animations */}
<style >{`
   .hero-grid {
    background-image: linear-gradient(to right, #0EA5E9 1px, transparent 1px),
      linear-gradient(to bottom, #0EA5E9 1px, transparent 1px);
    background-size: 40px 40px;

    mask-image: radial-gradient(circle at center, black 0%, transparent 85%);
    -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 85%);

    animation: gridFadeSmooth 6s ease-in-out infinite;
  }

  @keyframes gridFadeSmooth {
    0%   { opacity: 0.15; }
    25%  { opacity: 0.35; }
    50%  { opacity: 0.6; }
    75%  { opacity: 0.35; }
    100% { opacity: 0.15; }
  }

  /* ── BLOBS (Soft breathing, no jerks) ── */
  .blob-1 {
    animation: blobBreathe 10s ease-in-out infinite;
  }

  .blob-2 {
    animation: blobBreathe 12s ease-in-out infinite reverse;
  }

  .blob-3 {
    animation: blobBreathe 14s ease-in-out infinite;
  }

  @keyframes blobBreathe {
    0%, 100% {
      transform: scale(1);
      opacity: 0.2;
    }
    50% {
      transform: scale(1.08);
      opacity: 0.4;
    }
  }

  /* ── RINGS (More realistic pulse fade) ── */
  .ring-1 {
    animation: ringPulseSmooth 3s ease-out infinite;
  }

  .ring-2 {
    animation: ringPulseSmooth 3s ease-out infinite 1s;
  }

  .ring-3 {
    animation: ringPulseSmooth 3s ease-out infinite 2s;
  }

  @keyframes ringPulseSmooth {
    0% {
      transform: scale(0.6);
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  /* ── FLOATING PARTICLES (Soft fade, not harsh) ── */
  @keyframes particleUp {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    20% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.7;
    }
    80% {
      opacity: 0.4;
    }
    100% {
      transform: translateY(-100vh);
      opacity: 0;
    }
  }

  /* ── HEARTBEAT LINE (Fade + motion) ── */
  .heartbeat-line {
    stroke-dasharray: 1400;
    stroke-dashoffset: 1400;
    animation: heartbeatMove 3s linear infinite, heartbeatFade 2s ease-in-out infinite;
  }

  @keyframes heartbeatMove {
    0%   { stroke-dashoffset: 1400; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes heartbeatFade {
    0%, 100% { opacity: 0.2; }
    50%      { opacity: 1; }
  }

  /* ── TEXT GRADIENT ── */
  .text-gradient {
    background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`}</style>

<div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-10 bg-linear-to-b from-transparent to-white" />
    </section>
  );
};

export default Hero;