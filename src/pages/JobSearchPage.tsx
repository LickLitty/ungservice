import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobService } from '../services/jobService';
import { NotificationService } from '../services/notificationService';
import JobCard from '../components/jobs/JobCard';
import { Job, JobApplication } from '../types';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const JobSearchPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);


  // Dummy jobs data (in a real app, this would come from Firebase)
  const dummyJobs: Job[] = [
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
      employerId: 'emp1',
      employer: {
        id: 'emp1',
        email: 'john@example.com',
        displayName: 'John Hansen',
        role: 'employer',
        rating: 4.5,
        completedJobs: 12,
        createdAt: new Date(),
        isEmailVerified: true
      },
      status: 'open',
      applicants: [],
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
      employerId: 'emp2',
      employer: {
        id: 'emp2',
        email: 'maria@example.com',
        displayName: 'Maria Johansen',
        role: 'employer',
        rating: 4.8,
        completedJobs: 8,
        createdAt: new Date(),
        isEmailVerified: true
      },
      status: 'open',
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Hjelp med hagearbeid',
      description: 'Trenger hjelp med å plante blomster og rydde i hagen. Erfaring ikke nødvendig.',
      category: 'gardening',
      location: {
        address: 'Parkveien 22, Trondheim',
        coordinates: { lat: 63.4305, lng: 10.3951 }
      },
      date: new Date('2024-01-17T14:00:00'),
      duration: 3,
      wage: 120,
      employerId: 'emp3',
      employer: {
        id: 'emp3',
        email: 'peter@example.com',
        displayName: 'Peter Olsen',
        role: 'employer',
        rating: 4.2,
        completedJobs: 15,
        createdAt: new Date(),
        isEmailVerified: true
      },
      status: 'open',
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Rydding av garasje',
      description: 'Hjelp med å rydde og organisere garasjen. Mange ting som kan kastes eller doneres.',
      category: 'cleaning',
      location: {
        address: 'Hovedgata 45, Stavanger',
        coordinates: { lat: 58.9700, lng: 5.7331 }
      },
      date: new Date('2024-01-18T09:00:00'),
      duration: 4,
      wage: 140,
      employerId: 'emp4',
      employer: {
        id: 'emp4',
        email: 'anna@example.com',
        displayName: 'Anna Berg',
        role: 'employer',
        rating: 4.7,
        completedJobs: 6,
        createdAt: new Date(),
        isEmailVerified: true
      },
      status: 'open',
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      title: 'Maling av stakitt',
      description: 'Male stakitt rundt hagen. Ca 30 meter totalt. Maling og verktøy tilgjengelig.',
      category: 'painting',
      location: {
        address: 'Skoleveien 12, Tromsø',
        coordinates: { lat: 69.6492, lng: 18.9553 }
      },
      date: new Date('2024-01-19T11:00:00'),
      duration: 5,
      wage: 160,
      employerId: 'emp5',
      employer: {
        id: 'emp5',
        email: 'lars@example.com',
        displayName: 'Lars Nilsen',
        role: 'employer',
        rating: 4.9,
        completedJobs: 20,
        createdAt: new Date(),
        isEmailVerified: true
      },
      status: 'open',
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  useEffect(() => {
    loadJobs();
    if (currentUser) {
      loadUserApplications();
    }
  }, [currentUser, loadJobs, loadUserApplications]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      setJobs(dummyJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Kunne ikke laste jobber');
    } finally {
      setLoading(false);
    }
  };

  const loadUserApplications = async () => {
    if (!currentUser) return;
    
    try {
      // In a real app, this would fetch from Firebase
      const userApplications: JobApplication[] = [];
      setApplications(userApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

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
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesLocation = !selectedLocation || job.location.address.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesCategory && matchesLocation;
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

  const locations = [
    'Oslo',
    'Bergen', 
    'Trondheim',
    'Stavanger',
    'Tromsø'
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Søk etter jobber</h1>
        <p className="text-gray-600">Finn spennende oppdrag i ditt område</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Søk etter jobber, beskrivelser eller steder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
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
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredJobs.length} jobber funnet
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Filtrert resultat</span>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen jobber funnet</h3>
          <p className="text-gray-500">
            Prøv å endre søkekriteriene eller sjekk tilbake senere for nye jobber.
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
  );
};

export default JobSearchPage; 