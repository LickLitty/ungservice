import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { NotificationService } from '../services/notificationService';
import { Job } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  User, 
  MessageCircle,
  AlertCircle
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

  const loadJob = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      // const jobData = await JobService.getJobById(jobId!);
      setJob(null); // No dummy job data
      
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
        return '🌿';
      case 'weed-removal':
        return '🌱';
      case 'bark-soil':
        return '🪴';
      case 'hedge-trimming':
        return '🌳';
      case 'trash-removal':
        return '🗑️';
      case 'washing':
        return '💦';
      case 'cleaning':
        return '🧹';
      case 'window-washing':
        return '🪟';
      case 'carrying':
        return '💪';
      case 'painting':
        return '🎨';
      case 'staining':
        return '🪵';
      case 'repair':
        return '🔧';
      case 'tidying':
        return '📦';
      case 'car-washing':
        return '🚗';
      case 'snow-shoveling':
        return '❄️';
      case 'moving-help':
        return '📦';
      case 'salt-sand':
        return '🧂';
      case 'pet-sitting':
        return '🐕';
      default:
        return '✨';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'grass-cutting':
        return 'Klippe gress';
      case 'weed-removal':
        return 'Fjerne ugress';
      case 'bark-soil':
        return 'Legge bark eller ny jord';
      case 'hedge-trimming':
        return 'Klippe hekk';
      case 'trash-removal':
        return 'Kjøre søppel';
      case 'washing':
        return 'Spyle';
      case 'cleaning':
        return 'Rengjøre';
      case 'window-washing':
        return 'Vaske vinduer';
      case 'carrying':
        return 'Bærejobb';
      case 'painting':
        return 'Male';
      case 'staining':
        return 'Beise';
      case 'repair':
        return 'Reparere';
      case 'tidying':
        return 'Rydde';
      case 'car-washing':
        return 'Vaske bilen';
      case 'snow-shoveling':
        return 'Snømåking';
      case 'moving-help':
        return 'Hjelpe med flytting';
      case 'salt-sand':
        return 'Strø med sand / salt';
      case 'pet-sitting':
        return 'Dyrepass';
      default:
        return 'Annet';
    }
  };

  const getJobTypeText = (jobType: string) => {
    return jobType === 'one-time' ? 'Engangsjobb' : 'Gjentakende jobb';
  };

  const getPriceTypeText = (priceType: string) => {
    return priceType === 'hourly' ? 'Timebetalt' : 'Fastpris';
  };

  const getEquipmentText = (equipment: string) => {
    switch (equipment) {
      case 'yes':
        return 'Ja, utstyr kreves';
      case 'some':
        return 'Noe utstyr nødvendig';
      case 'no':
        return 'Nei, ingen utstyr';
      default:
        return '';
    }
  };



  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobb ikke funnet</h1>
          <p className="text-gray-600 mb-6">Jobben du leter etter eksisterer ikke eller har blitt fjernet.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="btn-primary"
          >
            Gå tilbake til jobber
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tilbake til jobber
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>Publisert av </span>
                <Link 
                  to={`/profile/${job.employer.id}`}
                  className="font-medium text-primary-600 hover:text-primary-700 ml-1"
                >
                  {job.employer.displayName}
                </Link>
                <div className="flex items-center ml-2">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <span>{job.employer.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                job.status === 'open' ? 'bg-green-100 text-green-800' :
                job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {job.status === 'open' ? 'Åpen' :
                 job.status === 'in-progress' ? 'Pågår' :
                 job.status === 'completed' ? 'Fullført' : 'Kansellert'}
              </span>
            </div>
          </div>

          {/* Job Type and Price Type */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getJobTypeText(job.jobType)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {getPriceTypeText(job.priceType)}
            </span>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Kategorier:</h3>
            <div className="flex flex-wrap gap-2">
              {job.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  <span className="mr-2">{getCategoryIcon(category)}</span>
                  {getCategoryName(category)}
                </span>
              ))}
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.location.address}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{job.expectedDuration} timer</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{job.numberOfWorkers} {job.numberOfWorkers === 1 ? 'arbeider' : 'arbeidere'}</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-primary-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{job.wage} kr/timen</span>
            </div>
          </div>
        </div>

        {/* Job Requirements */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Jobbkrav</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-700">
                Bil kreves: <span className="font-medium">{job.requirements.carRequired ? 'Ja' : 'Nei'}</span>
              </span>
            </div>
            <div className="flex items-center">
              <Wrench className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-700">
                Utstyr: <span className="font-medium">{getEquipmentText(job.requirements.equipmentRequired)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Beskrivelse</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {currentUser?.role === 'worker' && (
              <button
                onClick={handleApply}
                disabled={isApplying || applicationStatus !== null}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  applicationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                    : applicationStatus === 'accepted'
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : applicationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                    : isApplying
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isApplying ? 'Sender søknad...' :
                 applicationStatus === 'pending' ? 'Søknad sendt' :
                 applicationStatus === 'accepted' ? 'Godkjent' :
                 applicationStatus === 'rejected' ? 'Ikke godkjent' : 'Søk på jobb'}
              </button>
            )}
            
            <button
              onClick={handleContact}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2 inline" />
              Send melding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage; 