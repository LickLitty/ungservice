import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const EmailVerification: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const resendVerificationEmail = async () => {
    if (!firebaseUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(firebaseUser);
      toast.success('Verifiserings-e-post sendt!');
      setCountdown(60); // Start 60 second countdown
    } catch (error: any) {
      toast.error('Kunne ikke sende verifiserings-e-post: ' + error.message);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center">
          {firebaseUser.emailVerified ? (
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-green-600">E-post verifisert!</h2>
                <p className="text-gray-600">Din konto er nå aktiv</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Verifiser din e-post</h2>
                <p className="text-gray-600">Vi har sendt en verifiseringslenke til</p>
                <p className="font-medium text-gray-900">{firebaseUser.email}</p>
              </div>
            </div>
          )}
        </div>

        {!firebaseUser.emailVerified && (
          <div className="space-y-4">
            {/* Important notice about spam folder */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Viktig: Sjekk søppelpost!
              </h3>
              <p className="text-sm text-red-800">
                Verifiserings-e-posten kan havne i <strong>søppelpost</strong> eller <strong>spam-mappen</strong>. 
                Sjekk der først!
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Hvor å lete:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Søppelpost/spam-mappen</strong> (mest sannsynlig)</li>
                <li>• Hovedinnboksen din</li>
                <li>• Promotions-fanen (Gmail)</li>
                <li>• Vent 5-10 minutter</li>
              </ul>
            </div>

            {/* Instructions about clicking the link */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2 flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Når du finner e-posten:
              </h3>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. <strong>Åpne e-posten</strong> fra UngService</li>
                <li>2. <strong>Klikk på lenken</strong> "Bekreft e-postadresse"</li>
                <li>3. Du blir omdirigert tilbake til appen</li>
                <li>4. Din konto er nå aktivert!</li>
              </ol>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Fikk du ikke e-posten? Klikk på knappen under for å sende en ny.
              </p>
              
              <button
                onClick={resendVerificationEmail}
                disabled={isResending || countdown > 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sender...
                  </>
                ) : countdown > 0 ? (
                  `Send ny om ${countdown}s`
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send ny verifiserings-e-post
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Oppdater siden
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 