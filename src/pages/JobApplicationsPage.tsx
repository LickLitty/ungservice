import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { JobApplication, Job } from '../types';
import { Check, X, Clock, User, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const JobApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      setJobs([]);
      setApplications([]);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Kunne ikke laste søknader');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'employer') {
      loadApplications();
    }
  }, [currentUser, loadApplications]);

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      const status = action === 'accept' ? 'accepted' : 'rejected';
      await JobService.updateApplicationStatus(applicationId, status);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status }
            : app
        )
      );
      
      toast.success(`Søknad ${action === 'accept' ? 'godkjent' : 'avvist'}!`);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error('Kunne ikke oppdatere søknad: ' + error.message);
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedJob === 'all' || app.jobId === selectedJob
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Venter';
      case 'accepted':
        return 'Godkjent';
      case 'rejected':
        return 'Avvist';
      default:
        return 'Ukjent';
    }
  };

  if (!currentUser || currentUser.role !== 'employer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tilgang nektet</h1>
          <p className="text-gray-600">Kun arbeidsgivere kan se jobbsøknader.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobbsøknader</h1>
        <p className="text-gray-600">Administrer søknader for dine jobber</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrer etter jobb:</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Alle jobber</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen søknader</h3>
          <p className="text-gray-500">
            Du har ingen søknader ennå. Når folk søker på dine jobber vil de vises her.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application) => {
            const job = jobs.find(j => j.id === application.jobId);
            return (
              <div key={application.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.worker.displayName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.worker.age} år • {application.worker.city}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">
                          Rating: {application.worker.rating.toFixed(1)} ⭐
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {application.worker.completedJobs} fullførte jobber
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                {job && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {job.expectedDuration} timer
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {job.numberOfWorkers} {job.numberOfWorkers === 1 ? 'arbeider' : 'arbeidere'}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {job.wage} kr/timen
                      </div>
                    </div>
                  </div>
                )}

                {application.message && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Melding fra søker:</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                      {application.message}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Søknad mottatt {application.createdAt.toLocaleDateString('nb-NO')} kl. {application.createdAt.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {application.status === 'pending' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApplicationAction(application.id, 'reject')}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Avvis
                      </button>
                      <button
                        onClick={() => handleApplicationAction(application.id, 'accept')}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Godkjenn
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage; 