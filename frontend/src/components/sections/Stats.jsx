 import { Users, Star, Clock, Award } from 'lucide-react';

const stats = [
  { icon: <Users size={28} color="#0EA5E9" />, value: '50,000+', label: 'Patients Served' },
  { icon: <Star size={28} color="#FBBF24" />, value: '4.9 / 5', label: 'Average Rating' },
  { icon: <Clock size={28} color="#10B981" />, value: '< 30 min', label: 'Avg. Wait Time' },
  { icon: <Award size={28} color="#8B5CF6" />, value: '500+', label: 'Certified Doctors' },
];

const Stats = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-center mb-4">{stat.icon}</div>
            <div className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</div>
            <div className="text-sm text-[#64748B] font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;