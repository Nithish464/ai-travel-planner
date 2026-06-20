'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Plane, MapPin, Wallet, Edit3, Package, Star } from 'lucide-react';

const features = [
  { icon: MapPin, title: 'AI Day-by-Day Itinerary', desc: 'Get a fully structured travel plan tailored to your interests and budget.' },
  { icon: Wallet, title: 'Smart Budget Estimation', desc: 'Realistic cost breakdowns for flights, hotels, food, and activities.' },
  { icon: Edit3, title: 'Editable Itinerary', desc: 'Add, remove, or regenerate any day with a custom request.' },
  { icon: Star, title: 'Hotel Suggestions', desc: 'Get Budget, Mid-Range, and Luxury hotel picks for every destination.' },
  { icon: Package, title: 'AI Packing Assistant', desc: 'Smart packing checklists generated from your destination and activities.' },
  { icon: Plane, title: 'Multi-Trip Dashboard', desc: 'Manage all your trips from a single personalized dashboard.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="text-sky-400 w-6 h-6" />
            <span className="text-xl font-bold text-white">Trao</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 text-sky-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
          Powered by Gemini AI
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Your AI-Powered<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Travel Planner
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Tell us your destination, budget, and interests. Get a complete day-by-day itinerary, hotel picks, budget estimates, and a smart packing list — in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary text-lg py-3 px-8 inline-block">
            Plan My Trip →
          </Link>
          <Link href="/login" className="btn-secondary text-lg py-3 px-8 inline-block">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Everything you need to travel smarter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>Built with Next.js, Node.js, MongoDB & Gemini AI</p>
      </footer>
    </div>
  );
}
