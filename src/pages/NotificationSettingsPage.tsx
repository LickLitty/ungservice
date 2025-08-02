import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, MessageSquare, Briefcase, Clock, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationSettingsPage: React.FC = () => {
  const { requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const notificationTypes = [
    {
      id: 'new-message',
      title: 'Nye meldinger',
      description: 'Få varsel når noen sender deg en melding',
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: 'job-request',
      title: 'Jobbsøknader',
      description: 'Få varsel når noen søker på dine jobber',
      icon: Briefcase,
      enabled: true,
    },
    {
      id: 'application-status',
      title: 'Søknadsstatus',
      description: 'Få varsel når dine søknader blir godkjent eller avvist',
      icon: Briefcase,
      enabled: true,
    },
    {
      id: 'job-reminder',
      title: 'Jobbpåminnelser',
      description: 'Få påminnelse 1 time før jobben starter',
      icon: Clock,
      enabled: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Varselinnstillinger</h1>
        <p className="text-gray-600">
          Administrer hvordan du vil motta varsler og påminnelser
        </p>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bell className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Push-varsler</h3>
              <p className="text-gray-600">
                Få varsler direkte på enheten din, selv når du ikke er på nettsiden
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="btn-primary"
          >
            {isRequesting ? 'Aktiverer...' : 'Aktiver push-varsler'}
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Varseltyper</h3>
        </div>

        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <type.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={type.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Om varsler
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Varsler hjelper deg å holde deg oppdatert på viktige hendelser i applikasjonen. 
                Du kan når som helst endre disse innstillingene.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage; 