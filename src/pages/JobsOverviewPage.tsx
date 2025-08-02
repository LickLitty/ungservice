import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { Job, JobCategory } from '../types';
import JobCard from '../components/jobs/JobCard';
import toast from 'react-hot-toast';

const JobsOverviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');


  const loadJobs = useCallback(() => {
    setLoading(true);
    try {
      // Subscribe to jobs from Firebase
      const unsubscribe = JobService.subscribeToJobs((jobs) => {
        setJobs(jobs);
        setLoading(false);
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Kunne ikke laste jobber');
      setLoading(false);
    }
  }, []);

  const loadUserApplications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Load user's applications to show status
      // This would be implemented with JobService
    } catch (error) {
      console.error('Error loading user applications:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = loadJobs();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadJobs]);

  useEffect(() => {
    if (currentUser) {
      loadUserApplications();
    }
  }, [currentUser, loadUserApplications]);

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'all' || job.categories.includes(selectedCategory as JobCategory);
    return matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Alle kategorier' },
    { value: 'grass-cutting', label: 'Klippe gress' },
    { value: 'weed-removal', label: 'Fjerne ugress' },
    { value: 'bark-soil', label: 'Legge bark eller ny jord' },
    { value: 'hedge-trimming', label: 'Klippe hekk' },
    { value: 'trash-removal', label: 'Kjøre søppel' },
    { value: 'washing', label: 'Spyle' },
    { value: 'cleaning', label: 'Rengjøre' },
    { value: 'window-washing', label: 'Vaske vinduer' },
    { value: 'carrying', label: 'Bærejobb' },
    { value: 'painting', label: 'Male' },
    { value: 'staining', label: 'Beise' },
    { value: 'repair', label: 'Reparere' },
    { value: 'tidying', label: 'Rydde' },
    { value: 'car-washing', label: 'Vaske bilen' },
    { value: 'snow-shoveling', label: 'Snømåking' },
    { value: 'moving-help', label: 'Hjelpe med flytting' },
    { value: 'salt-sand', label: 'Strø med sand / salt' },
    { value: 'pet-sitting', label: 'Dyrepass' },
    { value: 'other', label: 'Annet' },
  ];



  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alle jobber</h1>
        <p className="text-gray-600">Finn jobber som passer deg</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lokasjon
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Alle lokasjoner</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen jobber funnet</h3>
          <p className="text-gray-500">
            Det er ingen jobber som matcher dine kriterier akkurat nå.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsOverviewPage; 