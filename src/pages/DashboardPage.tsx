import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Job, JobApplication } from '../types';
import JobCard from '../components/jobs/JobCard';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Plus,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react';

// Dummy data for demonstration
const dummyUserJobs: Job[] = [
  {
    id: '1',
    title: 'Gressklipping i hagen',
    description: 'Trenger hjelp med å klippe gresset i hagen. Området er ca 200m². Verktøy tilgjengelig.',
    category: 'grass-cutting',
    location: {
      address: 'Storgata 15, Oslo',
      coordinates: { lat: 59.9139, lng: 10.7522 }
    },
    date: new Date('2024-01-15T10:00:00'),
    duration: 2,
    wage: 150,
    employerId: 'user1',
    employer: {
      id: 'user1',
      email: 'user@example.com',
      displayName: 'Du',
      role: 'employer',
      rating: 4.5,
      completedJobs: 5,
      createdAt: new Date(),
      isEmailVerified: true
    },
    status: 'open',
    applicants: ['applicant1', 'applicant2'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Snømåking på oppkjørsel',
    description: 'Måke snø på oppkjørsel og gangsti. Ca 50m² totalt.',
    category: 'snow-shoveling',
    location: {
      address: 'Kirkeveien 8, Bergen',
      coordinates: { lat: 60.3913, lng: 5.3221 }
    },
    date: new Date('2024-01-16T08:00:00'),
    duration: 1.5,
    wage: 180,
    employerId: 'user1',
    employer: {
      id: 'user1',
      email: 'user@example.com',
      displayName: 'Du',
      role: 'employer',
      rating: 4.5,
      completedJobs: 5,
      createdAt: new Date(),
      isEmailVerified: true
    },
    status: 'in-progress',
    applicants: ['applicant3'],
    assignedWorker: 'applicant3',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const dummyApplications: JobApplication[] = [
  {
    id: 'app1',
    jobId: 'job1',
    workerId: 'worker1',
    worker: {
      id: 'worker1',
      email: 'worker@example.com',
      displayName: 'Lars Hansen',
      role: 'worker',
      rating: 4.2,
      completedJobs: 8,
      createdAt: new Date(),
      isEmailVerified: true
    },
    status: 'pending',
    message: 'Jeg har erfaring med gressklipping og kan hjelpe deg med dette.',
    createdAt: new Date()
  }
];

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-jobs' | 'applications' | 'booked'>('overview');
  const [userJobs] = useState<Job[]>(dummyUserJobs);
  const [applications] = useState<JobApplication[]>(dummyApplications);

  const stats = [
    { label: 'Jobber publisert', value: userJobs.length, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Aktive søknader', value: applications.filter(app => app.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Fullførte jobber', value: userJobs.filter(job => job.status === 'completed').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Gjennomsnittlig rating', value: '4.7', icon: Star, color: 'text-purple-600' },
  ];

  const handleAcceptApplication = (applicationId: string) => {
    // TODO: Implement accept application logic
    console.log('Accepting application:', applicationId);
  };

  const handleRejectApplication = (applicationId: string) => {
    // TODO: Implement reject application logic
    console.log('Rejecting application:', applicationId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Åpen';
      case 'in-progress': return 'Pågår';
      case 'completed': return 'Fullført';
      case 'cancelled': return 'Kansellert';
      default: return status;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Du må være innlogget for å se dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Velkommen tilbake, {currentUser.displayName}!</p>
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Oversikt', icon: TrendingUp },
            { id: 'my-jobs', label: 'Mine jobber', icon: Briefcase },
            { id: 'applications', label: 'Søknader', icon: Clock },
            { id: 'booked', label: 'Booket', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Nylige jobber</h3>
              </div>
              <div className="p-6">
                {userJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.location.address}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Nylige søknader</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{app.worker.displayName}</h4>
                      <p className="text-sm text-gray-500">{app.message?.substring(0, 50) || 'Ingen melding'}...</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                      app.status === 'accepted' ? 'text-green-600 bg-green-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {app.status === 'pending' ? 'Venter' : app.status === 'accepted' ? 'Godtatt' : 'Avvist'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Jobs Tab */}
        {activeTab === 'my-jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mine jobber</h2>
              <a
                href="/#/jobs/new"
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Publiser ny jobb
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showApplyButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Søknader på dine jobber</h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{app.worker.displayName}</h3>
                        <div className="flex items-center ml-4">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{app.worker.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{app.message || 'Ingen melding'}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{app.worker.completedJobs} jobber fullført</span>
                        <span>Søknad sendt {app.createdAt.toLocaleDateString('nb-NO')}</span>
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleAcceptApplication(app.id)}
                          className="btn-primary text-sm"
                        >
                          Godta
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app.id)}
                          className="btn-secondary text-sm"
                        >
                          Avvis
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booked Tab */}
        {activeTab === 'booked' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booket til jobber</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would show jobs the user is booked for as a worker */}
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Ingen booket jobber ennå</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 