import React from 'react';
import { Calendar, Phone, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const CTABanner = () => (
  <section className="py-16 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="gradient-card rounded-4xl p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blob" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-white/10 blob" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-black text-center lg:text-left">
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
              Ready to Take Control of <br />Your Health?
            </h2>
            <p className="text-black-100 text-lg max-w-xl">
              Join 50,000+ patients who trust MediCare for their healthcare needs. Book your first appointment free today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Button variant="outline"  size="lg" icon={<Phone size={18} />} iconPosition="left">
              Call Us Now
            </Button>
            <Button
              size="lg"
              className="bg-[#0EA5E9] text-[#0EA5E9] hover:bg-[#9de4fe] shadow-xl"
              icon={<ArrowRight size={18} />}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTABanner;