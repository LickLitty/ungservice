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
                      to="/jobs"
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
            to="/jobs"
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