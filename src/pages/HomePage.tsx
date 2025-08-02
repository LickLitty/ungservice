import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JobCard from '../components/jobs/JobCard';
import { Job } from '../types';
import { 
  Plus, 
  TrendingUp, 
  Star, 
  Users,
  Briefcase,
  Calendar
} from 'lucide-react';

// Dummy data for demonstration
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
  },
  {
    id: '6',
    title: 'Hjelp med flytting',
    description: 'Hjelp med å bære møbler og bokser fra 2. etasje til flyttebil. Ingen tunge møbler.',
    category: 'moving',
    location: {
      address: 'Universitetsgata 7, Trondheim',
      coordinates: { lat: 63.4305, lng: 10.3951 }
    },
    date: new Date('2024-01-20T13:00:00'),
    duration: 2.5,
    wage: 200,
    employerId: 'emp6',
    employer: {
      id: 'emp6',
      email: 'sarah@example.com',
      displayName: 'Sarah Jensen',
      role: 'employer',
      rating: 4.6,
      completedJobs: 3,
      createdAt: new Date(),
      isEmailVerified: true
    },
    status: 'open',
    applicants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [featuredJobs] = useState<Job[]>(dummyJobs);

  const handleApply = (jobId: string) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/#/login';
      return;
    }
    // TODO: Implement job application logic
    console.log('Applying for job:', jobId);
  };

  const stats = [
    { label: 'Aktive jobber', value: '127', icon: Briefcase },
    { label: 'Registrerte brukere', value: '1,234', icon: Users },
    { label: 'Fullførte jobber', value: '5,678', icon: Calendar },
    { label: 'Gjennomsnittlig rating', value: '4.7', icon: Star },
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Finn småjobber utendørs
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Koble sammen arbeidsgivere og ungdom for enklere hagearbeid, snømåking og mer
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <>
                  {currentUser.role === 'employer' ? (
                    <Link
                      to="/jobs/new"
                      className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Publiser jobb
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Se jobber
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Kom i gang
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Logg inn
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Aktuelle jobber</h2>
          
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            Se alle jobber
            <TrendingUp className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showApplyButton={true}
              onApply={handleApply}
            />
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Slik fungerer det
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Publiser eller søk</h3>
              <p className="text-gray-600">
                Arbeidsgivere publiserer jobber, ungdom søker på interessante oppdrag
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Match og avtale</h3>
              <p className="text-gray-600">
                Arbeidsgiver velger søker, dere avtaler tid og detaljer
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Utfør og vurder</h3>
              <p className="text-gray-600">
                Jobben utføres, begge parter gir vurdering og betaling skjer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 