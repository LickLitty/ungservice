import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { NotificationService } from '../services/notificationService';
import JobCard from '../components/jobs/JobCard';
import { Job, JobApplication } from '../types';
import { Briefcase, Filter, MapPin, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const JobsOverviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());



  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      setJobs([]);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Kunne ikke laste jobber');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserApplications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // In a real app, this would fetch from Firebase
      const userApplications: JobApplication[] = [];
      setApplications(userApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadJobs();
    if (currentUser) {
      loadUserApplications();
    }
  }, [currentUser, loadJobs, loadUserApplications]);

  const handleApply = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Du må være innlogget for å søke på jobber');
      return;
    }

    if (currentUser.role !== 'worker') {
      toast.error('Kun arbeidstakere kan søke på jobber');
      return;
    }

    setApplyingJobs(prev => new Set(prev).add(jobId));
    
    try {
      // Apply for the job
      await JobService.applyForJob(jobId, currentUser.id);
      
      // Send notification to employer
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        await NotificationService.notifyJobApplication(
          job.employerId,
          currentUser.displayName,
          job.title,
          jobId
        );
      }
      
      toast.success('Søknad sendt! Arbeidsgiveren vil bli varslet.');
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error('Kunne ikke sende søknad: ' + error.message);
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesLocation = !selectedLocation || job.location.address.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesCategory && matchesLocation;
  });

  const categories = [
    { value: 'all', label: 'Alle kategorier' },
    { value: 'grass-cutting', label: 'Gressklipping' },
    { value: 'snow-shoveling', label: 'Snømåking' },
    { value: 'gardening', label: 'Hagearbeid' },
    { value: 'cleaning', label: 'Rydding' },
    { value: 'painting', label: 'Maling' },
    { value: 'moving', label: 'Flytting' },
  ];

  const locations = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster jobber...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Alle tilgjengelige jobber</h1>
            <p className="text-gray-600">Finn spennende oppdrag i ditt område</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokasjon</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Alle steder</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-5 w-5 mr-2" />
                <span className="font-medium">{filteredJobs.length} jobber funnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen jobber funnet</h3>
            <p className="text-gray-500">
              Prøv å endre filtrene eller sjekk tilbake senere for nye jobber.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showApplyButton={currentUser?.role === 'worker'}
                onApply={handleApply}
                isApplied={applications.some(app => app.jobId === job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsOverviewPage; 