
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Elliptical Background Accents */}
      <div className="absolute -top-40 -left-64 w-[900px] h-[900px] pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_center,_hsla(263,70%,65%,0.25)_0%,_transparent_70%)] blur-3xl animate-ellipse-drift"></div>
      <div className="absolute -bottom-48 -right-72 w-[1000px] h-[1000px] pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_center,_hsla(210,90%,65%,0.20)_0%,_transparent_70%)] blur-3xl animate-ellipse-drift"></div>

      {/* Page Sections */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
