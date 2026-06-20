'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { Trip, TripSummary } from '@/types';
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';
import HotelCard from '@/components/HotelCard';
import BudgetCard from '@/components/BudgetCard';
import { Plane, Plus, Trash2, MapPin, ChevronRight, Loader2, Lightbulb } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [generatingTrip, setGeneratingTrip] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'packing' | 'tips'>('itinerary');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/api/trips');
      setTrips(data);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchTripById = async (id: string) => {
    setLoadingTrip(true);
    try {
      const { data } = await api.get(`/api/trips/${id}`);
      setSelectedTrip(data);
    } catch (err) {
      console.error('Failed to fetch trip:', err);
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleGenerateTrip = async (formData: {
    destination: string;
    durationDays: number;
    budgetTier: string;
    interests: string[];
    startDate: string;
  }) => {
    setGeneratingTrip(true);
    try {
      const { data } = await api.post('/api/trips', formData);
      setTrips((prev) => [data, ...prev]);
      setSelectedTrip(data);
      setShowCreateForm(false);
      setActiveTab('itinerary');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate trip. Please try again.');
    } finally {
      setGeneratingTrip(false);
    }
  };

  const handleAddActivity = async (dayNumber: number, title: string, timeOfDay: string) => {
    if (!selectedTrip) return;
    try {
      const { data } = await api.post(`/api/trips/${selectedTrip._id}/add-activity`, {
        dayNumber, title, timeOfDay,
      });
      setSelectedTrip(data);
    } catch (err) {
      console.error('Failed to add activity:', err);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityId: string) => {
    if (!selectedTrip) return;
    try {
      const { data } = await api.delete(`/api/trips/${selectedTrip._id}/remove-activity`, {
        data: { dayNumber, activityId },
      });
      setSelectedTrip(data);
    } catch (err) {
      console.error('Failed to remove activity:', err);
    }
  };

  const handleRegenerateDay = async (dayNumber: number, userRequest: string) => {
    if (!selectedTrip) return;
    try {
      const { data } = await api.post(`/api/trips/${selectedTrip._id}/regenerate-day`, {
        dayNumber, userRequest,
      });
      setSelectedTrip(data);
    } catch (err) {
      console.error('Failed to regenerate day:', err);
    }
  };

  const handleTogglePackingItem = async (itemId: string) => {
    if (!selectedTrip) return;
    const updated = selectedTrip.packingList.map((item) =>
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    try {
      const { data } = await api.put(`/api/trips/${selectedTrip._id}`, { packingList: updated });
      setSelectedTrip(data);
    } catch (err) {
      console.error('Failed to update packing list:', err);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await api.delete(`/api/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      if (selectedTrip?._id === id) setSelectedTrip(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || loadingTrips) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'hotels',    label: 'Hotels' },
    { key: 'packing',   label: 'Packing' },
    { key: 'tips',      label: 'Travel Tips' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="text-sky-400 w-5 h-5" />
            <span className="text-lg font-bold text-white">Trao</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">
              👋 {user?.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>

          {/* Trip list */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Trips</h2>
            {trips.length === 0 ? (
              <p className="text-slate-500 text-sm">No trips yet. Create one!</p>
            ) : (
              <div className="space-y-2">
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedTrip?._id === trip._id
                        ? 'bg-sky-500/10 border-sky-500/30 text-white'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                    onClick={() => fetchTripById(trip._id)}
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-sky-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{trip.destination}</p>
                      <p className="text-xs opacity-60">{trip.durationDays}d · {trip.budgetTier}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip._id); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Create Form */}
          {showCreateForm && (
            <CreateTripForm onGenerate={handleGenerateTrip} loading={generatingTrip} />
          )}

          {/* Trip Detail */}
          {loadingTrip ? (
            <div className="card flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
          ) : selectedTrip ? (
            <>
              {/* Trip Header */}
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">{selectedTrip.destination}</h1>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedTrip.durationDays} days · {selectedTrip.budgetTier} budget · {selectedTrip.interests.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Summary */}
              <BudgetCard
                budget={selectedTrip.estimatedBudget}
                destination={selectedTrip.destination}
                durationDays={selectedTrip.durationDays}
              />

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === key
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {selectedTrip.itinerary.map((day) => (
                    <ItineraryCard
                      key={day._id || day.dayNumber}
                      day={day}
                      tripId={selectedTrip._id}
                      onAddActivity={handleAddActivity}
                      onRemoveActivity={handleRemoveActivity}
                      onRegenerateDay={handleRegenerateDay}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'hotels' && (
                <HotelCard hotels={selectedTrip.hotels} />
              )}

              {activeTab === 'packing' && (
                <PackingList
                  items={selectedTrip.packingList}
                  onToggle={handleTogglePackingItem}
                  weatherSummary={selectedTrip.weatherSummary}
                />
              )}

              {activeTab === 'tips' && (
                <div className="card space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Travel Tips</h3>
                  </div>
                  {selectedTrip.travelTips?.length > 0 ? (
                    selectedTrip.travelTips.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <span className="text-yellow-400 font-bold text-sm shrink-0">{idx + 1}.</span>
                        <p className="text-slate-300 text-sm">{tip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No travel tips available.</p>
                  )}
                </div>
              )}
            </>
          ) : !showCreateForm ? (
            <div className="card flex flex-col items-center justify-center h-96 text-center">
              <Plane className="w-12 h-12 text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-slate-400 mb-2">No trip selected</h2>
              <p className="text-slate-500 text-sm mb-6">Select a trip from the sidebar or create a new one</p>
              <button onClick={() => setShowCreateForm(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Plan Your First Trip
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
