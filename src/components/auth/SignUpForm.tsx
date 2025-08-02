import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = yup.object({
  displayName: yup.string().min(2, 'Navn må være minst 2 tegn').required('Navn er påkrevd'),
  email: yup.string().email('Ugyldig e-post').required('E-post er påkrevd'),
  password: yup.string().min(6, 'Passord må være minst 6 tegn').required('Passord er påkrevd'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passordene må være like').required('Bekreft passord er påkrevd'),
}).required();

type FormData = yup.InferType<typeof schema>;

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Default to 'worker' role - users can change this later in their profile
      await signUp(data.email, data.password, data.displayName, 'worker');
      toast.success('Konto opprettet! Sjekk e-posten din for verifisering.');
    } catch (error: any) {
      toast.error(error.message || 'Registrering feilet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Opprett konto</h2>
        
        {/* Email verification notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            E-post verifisering
          </h3>
          <p className="text-sm text-blue-800">
            Etter registrering får du en verifiserings-e-post. <strong>Sjekk søppelpost/spam-mappen</strong> hvis du ikke finner den i hovedinnboksen.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Fullt navn
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('displayName')}
                type="text"
                id="displayName"
                className="input-field pl-10"
                placeholder="Ditt navn"
              />
            </div>
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input-field pl-10"
                placeholder="din@email.no"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Bekreft passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Du kan endre din rolle (arbeidsgiver/arbeidstaker) senere i profilinnstillingene.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? 'Oppretter konto...' : 'Opprett konto'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Har du allerede en konto?{' '}
            <a href="/#/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Logg inn her
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm; 