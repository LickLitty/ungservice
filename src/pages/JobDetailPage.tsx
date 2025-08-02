import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { NotificationService } from '../services/notificationService';
import { Job } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Star, 
  User, 
  MessageCircle,
  Car,
  Wrench,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Dummy job data for demonstration (in a real app, this would come from Firebase)
  const dummyJob: Job = {
    id: '1',
    title: 'Hente PEPS til FUTCH',
    description: 'Måke snø if u know what i mean',
    category: 'snow-shoveling',
    location: {
      address: 'B-town',
      coordinates: { lat: 59.9139, lng: 10.7522 }
    },
    date: new Date('2025-08-01T22:26:00'),
    duration: 2,
    wage: 419,
    employerId: 'emp1',
    employer: {
      id: 'emp1',
      email: 'egil2@example.com',
      displayName: 'Egil2',
      role: 'employer',
      rating: 0,
      completedJobs: 0,
      createdAt: new Date(),
      isEmailVerified: true
    },
    status: 'open',
    applicants: [],
    createdAt: new Date('2025-08-01T22:26:00'),
    updatedAt: new Date('2025-08-01T22:26:00')
  };

  const loadJob = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      // const jobData = await JobService.getJobById(jobId!);
      setJob(dummyJob);
      
      // Check application status if user is a worker
      if (currentUser && currentUser.role === 'worker') {
        const status = await JobService.getApplicationStatus(jobId!, currentUser.id);
        setApplicationStatus(status);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Kunne ikke laste jobb');
    } finally {
      setLoading(false);
    }
  }, [jobId, currentUser]);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId, loadJob]);

  const handleApply = async () => {
    if (!currentUser || !job) return;

    setIsApplying(true);
    try {
      await JobService.applyForJob(job.id, currentUser.id, 'Jeg er interessert i denne jobben');
      
      // Send notification to employer
      await NotificationService.notifyJobApplication(
        job.employerId,
        currentUser.displayName,
        job.title,
        job.id
      );

      setApplicationStatus('pending');
      toast.success('Søknad sendt!');
    } catch (error: any) {
      toast.error('Kunne ikke sende søknad: ' + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleContact = () => {
    if (!currentUser || !job) return;
    
    // Navigate to messages with the employer
    navigate(`/messages?user=${job.employerId}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grass-cutting':
        return '🌱';
      case 'snow-shoveling':
        return '❄️';
      case 'gardening':
        return '🌿';
      case 'cleaning':
        return '🧹';
      case 'painting':
        return '🎨';
      case 'moving':
        return '📦';
      default:
        return '💼';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'grass-cutting':
        return 'Gressklipping';
      case 'snow-shoveling':
        return 'Snømåking';
      case 'gardening':
        return 'Hagearbeid';
      case 'cleaning':
        return 'Rydding';
      case 'painting':
        return 'Maling';
      case 'moving':
        return 'Flytting';
      default:
        return 'Annet';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster jobb...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Jobb ikke funnet</h2>
          <p className="text-gray-600 mb-4">Jobben du leter etter eksisterer ikke eller er slettet.</p>
          <button
            onClick={() => navigate('/jobs/search')}
            className="btn-primary"
          >
            Se andre jobber
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Tilbake til tjenester
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Job Title and Price */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="text-3xl font-bold text-green-600">
                    {job.wage} kr per time
                  </div>
                </div>
              </div>

              {/* Employer Information */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-gray-600">av</span>
                      <span className="font-semibold text-gray-900 ml-1">{job.employer.displayName}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm">Jobbsøker</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {job.employer.rating > 0 
                          ? `${job.employer.rating.toFixed(1)} (${job.employer.completedJobs} vurderinger)`
                          : `Ingen rating (0 vurderinger)`
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.location.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Om denne jobben
                </h2>
                <p className="text-gray-700 mb-4">{job.description}</p>
                
                {/* Job Details */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Gjentakende jobb</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-red-500 mr-3" />
                    <span className="text-gray-600">{job.location.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      {formatDate(job.date)} kl. {formatTime(job.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Fastpris: {job.wage} kr</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Varighet: {job.duration} timer</span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Krav</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-3" />
                      <span className="text-gray-600">Bil: Ikke nødvendig</span>
                    </div>
                    <div className="flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-3" />
                      <span className="text-gray-600">Utstyr: Ikke nødvendig</span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getCategoryIcon(job.category)} {getCategoryName(job.category)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Interest in Job */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interesse for jobb</h3>
                {currentUser?.role === 'employer' ? (
                  <p className="text-gray-600 text-sm">
                    Som arbeidsgiver kan du ikke vise interesse for andre sine jobber.
                  </p>
                ) : currentUser?.role === 'worker' ? (
                  <div className="space-y-3">
                    {applicationStatus === null && (
                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full btn-primary"
                      >
                        {isApplying ? 'Sender...' : 'Vis interesse'}
                      </button>
                    )}
                    {applicationStatus === 'pending' && (
                      <div className="text-center py-3">
                        <div className="flex items-center justify-center text-yellow-600 mb-2">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">Søknad sendt</span>
                        </div>
                        <p className="text-sm text-gray-600">Venter på svar fra arbeidsgiver</p>
                      </div>
                    )}
                    {applicationStatus === 'accepted' && (
                      <div className="text-center py-3">
                        <div className="flex items-center justify-center text-green-600 mb-2">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Godkjent!</span>
                        </div>
                        <p className="text-sm text-gray-600">Din søknad ble godkjent</p>
                      </div>
                    )}
                    {applicationStatus === 'rejected' && (
                      <div className="text-center py-3">
                        <div className="flex items-center justify-center text-red-600 mb-2">
                          <X className="h-5 w-5 mr-2" />
                          <span className="font-medium">Ikke godkjent</span>
                        </div>
                        <p className="text-sm text-gray-600">Din søknad ble ikke godkjent</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Logg inn for å vise interesse for denne jobben.
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Kontakt {job.employer.displayName}
                </h3>
                <button
                  onClick={handleContact}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send melding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage; 