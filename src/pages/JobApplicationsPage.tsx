import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { JobApplication, Job } from '../types';
import { User, Clock, MessageCircle, CheckCircle, XCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const JobApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'employer') {
      return;
    }

    const loadApplications = async () => {
      try {
        const userApplications = await JobService.getApplicationsForEmployer(currentUser.id);
        setApplications(userApplications);
        
        // Load job details for each application
        const jobIds = Array.from(new Set(userApplications.map(app => app.jobId)));
        const jobPromises = jobIds.map(jobId => JobService.getJobById(jobId));
        const jobResults = await Promise.all(jobPromises);
        setJobs(jobResults);
      } catch (error) {
        console.error('Error loading applications:', error);
        toast.error('Kunne ikke laste søknader');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [currentUser]);

  const handleApplicationResponse = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await JobService.updateApplicationStatus(applicationId, status);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      toast.success(`Søknad ${status === 'accepted' ? 'godkjent' : 'avvist'}!`);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Kunne ikke oppdatere søknad');
    }
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Ukjent jobb';
  };

  if (!currentUser || currentUser.role !== 'employer') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ingen tilgang</h1>
          <p className="text-gray-600">Du må være arbeidsgiver for å se søknader.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobbsøknader</h1>
        <p className="text-gray-600">Se og håndter søknader på dine jobber</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen søknader ennå</h3>
          <p className="text-gray-500">
            Du vil se søknader her når folk søker på dine jobber.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {getJobTitle(application.jobId)}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Søkt {application.createdAt.toLocaleDateString('nb-NO')}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {application.status === 'pending' ? 'Venter' :
                   application.status === 'accepted' ? 'Godkjent' : 'Avvist'}
                </div>
              </div>

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-medium">
                    {application.worker.displayName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{application.worker.displayName}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span>{application.worker.rating.toFixed(1)}</span>
                    <span className="mx-2">•</span>
                    <span>{application.worker.completedJobs} fullførte jobber</span>
                  </div>
                </div>
              </div>

              {application.message && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">{application.message}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link
                  to={`/messages?user=${application.workerId}&jobId=${application.jobId}`}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Send melding
                </Link>

                {application.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'accepted')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Godkjenn
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'rejected')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Avvis
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage; 