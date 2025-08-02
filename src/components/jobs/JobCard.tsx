import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { JobService } from '../../services/jobService';
import { NotificationService } from '../../services/notificationService';
import { Job } from '../../types';
import { MapPin, Clock, DollarSign, User, Calendar, Star, Car, Wrench } from 'lucide-react';
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
    return jobType === 'one-time' ? 'Engangsjobb' : 'Gjentakende';
  };

  const getPriceTypeText = (priceType: string) => {
    return priceType === 'hourly' ? 'Timebetalt' : 'Fastpris';
  };

  const getEquipmentText = (equipment: string) => {
    switch (equipment) {
      case 'yes':
        return 'Utstyr kreves';
      case 'some':
        return 'Noe utstyr';
      case 'no':
        return 'Ingen utstyr';
      default:
        return '';
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
      
      // Send notification to employer
      await NotificationService.notifyJobApplication(
        job.employerId,
        currentUser.displayName,
        job.title,
        job.id
      );
      
      setApplicationStatus('pending');
      toast.success('Søknad sendt! Arbeidsgiveren vil bli varslet.');
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error('Kunne ikke sende søknad: ' + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <Link to={`/jobs/${job.id}`} className="block">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <User className="h-4 w-4 mr-1" />
              <Link 
                to={`/profile/${job.employer.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-primary-600 transition-colors"
              >
                {job.employer.displayName}
              </Link>
              <div className="flex items-center ml-2">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-xs">{job.employer.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Type and Price Type */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getJobTypeText(job.jobType)}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {getPriceTypeText(job.priceType)}
          </span>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {job.categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                <span className="mr-1">{getCategoryIcon(category)}</span>
                {getCategoryName(category)}
              </span>
            ))}
            {job.categories.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{job.categories.length - 3} flere
              </span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{job.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(job.date)} kl. {formatTime(job.date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{job.duration} timer</span>
            </div>
            <div className="flex items-center font-semibold text-primary-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{job.wage} kr/timen</span>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="flex items-center space-x-3 mb-4">
          {job.requirements.carRequired && (
            <div className="flex items-center text-xs text-gray-600">
              <Car className="h-3 w-3 mr-1" />
              <span>Bil kreves</span>
            </div>
          )}
          {job.requirements.equipmentRequired !== 'no' && (
            <div className="flex items-center text-xs text-gray-600">
              <Wrench className="h-3 w-3 mr-1" />
              <span>{getEquipmentText(job.requirements.equipmentRequired)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Apply Button */}
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