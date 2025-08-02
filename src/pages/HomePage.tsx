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

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [featuredJobs] = useState<Job[]>([]);

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
                  <Link
                    to="/jobs/new"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Publiser jobb
                  </Link>
                  <Link
                    to="/jobs"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Se jobber
                  </Link>
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
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Aktuelle jobber</h2>
            <p className="text-lg text-gray-600">
              Se de siste jobbene som er publisert
            </p>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen jobber funnet</h3>
              <p className="text-gray-500">
                Det er ingen jobber publisert akkurat nå. Sjekk tilbake senere!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showApplyButton={currentUser?.role === 'worker'}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/jobs"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Se alle jobber
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Slik fungerer det</h2>
            <p className="text-lg text-gray-600">
              Enkelt og raskt for både arbeidsgivere og arbeidstakere
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Publiser jobb</h3>
              <p className="text-gray-600">
                Som arbeidsgiver kan du enkelt publisere jobber med detaljer, pris og krav.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Finn arbeidstaker</h3>
              <p className="text-gray-600">
                Ungdom i ditt område kan søke på jobbene dine og ta kontakt.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Fullfør jobb</h3>
              <p className="text-gray-600">
                Jobben blir utført og begge parter kan gi tilbakemelding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 