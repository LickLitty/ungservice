import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  FileText, 
  Tag,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Job, JobCategory } from '../../types';

const schema = yup.object({
  title: yup.string().min(5, 'Tittel må være minst 5 tegn').required('Tittel er påkrevd'),
  description: yup.string().min(20, 'Beskrivelse må være minst 20 tegn').required('Beskrivelse er påkrevd'),
  category: yup.string().oneOf(['grass-cutting', 'snow-shoveling', 'gardening', 'cleaning', 'painting', 'moving', 'other'], 'Velg en kategori').required('Kategori er påkrevd'),
  date: yup.date().min(new Date(), 'Dato må være i fremtiden').required('Dato er påkrevd'),
  time: yup.string().required('Tidspunkt er påkrevd'),
  duration: yup.number().min(0.5, 'Varighet må være minst 0.5 timer').max(24, 'Varighet kan ikke være mer enn 24 timer').required('Varighet er påkrevd'),
  wage: yup.number().min(50, 'Lønn må være minst 50 kr/timen').max(1000, 'Lønn kan ikke være mer enn 1000 kr/timen').required('Lønn er påkrevd'),
  address: yup.string().min(5, 'Adresse må være minst 5 tegn').required('Adresse er påkrevd'),
}).required();

type FormData = yup.InferType<typeof schema>;

const categories: { value: JobCategory; label: string; icon: string }[] = [
  { value: 'grass-cutting', label: 'Gressklipping', icon: '🌱' },
  { value: 'snow-shoveling', label: 'Snømåking', icon: '❄️' },
  { value: 'gardening', label: 'Hagearbeid', icon: '🌿' },
  { value: 'cleaning', label: 'Rydding', icon: '🧹' },
  { value: 'painting', label: 'Maling', icon: '🎨' },
  { value: 'moving', label: 'Flytting', icon: '📦' },
  { value: 'other', label: 'Annet', icon: '💼' },
];

const CreateJobForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | ''>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!currentUser) {
      toast.error('Du må være innlogget for å publisere jobber');
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(':');
      const jobDate = new Date(data.date);
      jobDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const jobData = {
        ...data,
        date: jobDate,
        employerId: currentUser.id,
        status: 'open' as const,
        applicants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: Save to Firestore
      console.log('Creating job:', jobData);
      
      toast.success('Jobb publisert!');
      // Redirect to jobs page or dashboard
      window.location.href = '/#/dashboard';
    } catch (error: any) {
      toast.error('Kunne ikke publisere jobb: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: JobCategory) => {
    setSelectedCategory(category);
    setValue('category', category);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Publiser ny jobb</h2>
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Jobbtittel
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="input-field"
              placeholder="F.eks. Gressklipping i hagen"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategori
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategorySelect(category.value)}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedCategory === category.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="input-field"
              placeholder="Beskriv jobben i detalj. Hva skal gjøres? Er verktøy tilgjengelig? Spesielle krav?"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Dato
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('date')}
                  type="date"
                  id="date"
                  className="input-field pl-10"
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Tidspunkt
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('time')}
                  type="time"
                  id="time"
                  className="input-field pl-10"
                />
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Wage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Varighet (timer)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  id="duration"
                  step="0.5"
                  min="0.5"
                  max="24"
                  className="input-field pl-10"
                  placeholder="2.5"
                />
              </div>
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="wage" className="block text-sm font-medium text-gray-700 mb-2">
                Lønn (kr/timen)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('wage', { valueAsNumber: true })}
                  type="number"
                  id="wage"
                  min="50"
                  max="1000"
                  className="input-field pl-10"
                  placeholder="150"
                />
              </div>
              {errors.wage && (
                <p className="text-red-500 text-sm mt-1">{errors.wage.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('address')}
                type="text"
                id="address"
                className="input-field pl-10"
                placeholder="Storgata 15, Oslo"
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publiserer jobb...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Publiser jobb
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobForm; 