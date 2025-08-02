import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { MapPin, Clock, DollarSign, User, Calendar } from 'lucide-react';

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

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(job.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
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
          {job.employer.displayName}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(job.employer.rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">
            ({job.employer.rating.toFixed(1)})
          </span>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/jobs/${job.id}`}
            className="btn-secondary text-sm"
          >
            Se detaljer
          </Link>
          
          {showApplyButton && onApply && (
            <button
              onClick={() => onApply(job.id)}
              disabled={isApplied}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                isApplied
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isApplied ? 'Søkt' : 'Søk'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard; 