import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { JobService } from '../../services/jobService';
import { Job } from '../../types';
import { MapPin, Clock, DollarSign, User, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  onApply?: (jobId: string) => void;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  showApplyButton = true, 
  onApply, 
  isApplied = false 
}) => {
  const { currentUser } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const checkApplicationStatus = useCallback(async () => {
    try {
      const status = await JobService.getApplicationStatus(job.id, currentUser!.id);
      setApplicationStatus(status);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }, [currentUser, job.id]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'worker') {
      checkApplicationStatus();
    }
  }, [currentUser, job.id, checkApplicationStatus]);
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

  const handleApplyClick = async () => {
    if (!currentUser || currentUser.role !== 'worker') {
      toast.error('Du må være innlogget som arbeidstaker for å søke på jobber');
      return;
    }

    if (applicationStatus) {
      toast.error('Du har allerede søkt på denne jobben');
      return;
    }

    setIsApplying(true);
    try {
      await JobService.applyForJob(job.id, currentUser.id);
      setApplicationStatus('pending');
      toast.success('Søknad sendt!');
      if (onApply) {
        onApply(job.id);
      }
    } catch (error: any) {
      toast.error('Kunne ikke sende søknad: ' + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <Link to={`/jobs/${job.id}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(job.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">{job.title}</h3>
              <p className="text-sm text-gray-500">{getCategoryName(job.category)}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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

        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location.address}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(job.date)} kl. {formatTime(job.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            {job.duration} timer
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="h-4 w-4 mr-2" />
            {job.wage} kr/timen
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-2" />
            <span 
              className="hover:text-primary-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/profile/${job.employer.id}`}>
                {job.employer.displayName}
              </Link>
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(job.employer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              ({job.employer.rating.toFixed(1)})
            </span>
          </div>
        </div>
      </Link>

      {/* Apply button outside the link to prevent conflicts */}
      {showApplyButton && currentUser?.role === 'worker' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApplyClick}
            disabled={isApplying || applicationStatus !== null}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              applicationStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : applicationStatus === 'accepted'
                ? 'bg-green-100 text-green-800'
                : applicationStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : isApplying
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isApplying ? 'Sender...' : 
             applicationStatus === 'pending' ? 'Søknad sendt' :
             applicationStatus === 'accepted' ? 'Godkjent' :
             applicationStatus === 'rejected' ? 'Ikke godkjent' : 'Søk'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobCard; 