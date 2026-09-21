import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import DashboardPreview from './components/DashboardPreview';
import PillarsSection from './components/PillarsSection';
import ModulesSection from './components/ModulesSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import FooterLanding from './components/FooterLanding';
import WhatsAppBubble from './components/WhatsAppBubble';
import './landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.landing-animate, .landing-animate-stagger');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <LandingNavbar
        onLogin={() => {
          navigate('/portal-cursos');
        }}
        onAdminLogin={() => {
          localStorage.setItem('token', 'admin-token');
          localStorage.setItem('user', JSON.stringify({ role: 'admin', full_name: 'Retail Admin' }));
          navigate('/admin/dashboard');
        }}
      />
      <main>
        <HeroSection />
        <DashboardPreview />
        <PillarsSection />
        <ModulesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterLanding />
      <WhatsAppBubble />
    </div>
  );
}
