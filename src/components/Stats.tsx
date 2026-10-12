import { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, Clock, Wrench } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string;
}

function StatItem({ icon, value, label, prefix = '' }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
      <div className="flex justify-center mb-4 text-brand-yellow-600">
        {icon}
      </div>
      <div className="text-5xl font-bold text-gray-900 mb-2">
        {prefix}{count.toLocaleString()}
      </div>
      <div className="text-gray-600 text-lg">
        {label}
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Da oltre 20 anni realizziamo soluzioni per la casa e le aziende, con centinaia di clienti soddisfatti ogni anno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatItem
            icon={<Briefcase size={48} />}
            value={2500}
            label="Lavori completati"
            prefix="+"
          />
          <StatItem
            icon={<Users size={48} />}
            value={1800}
            label="Clienti soddisfatti"
            prefix="+"
          />
          <StatItem
            icon={<Clock size={48} />}
            value={20}
            label="Anni di esperienza"
          />
          <StatItem
            icon={<Wrench size={48} />}
            value={10}
            label="Professionisti nel team"
          />
        </div>
      </div>
    </section>
  );
}
