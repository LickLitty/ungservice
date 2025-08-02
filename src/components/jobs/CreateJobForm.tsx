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
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { JobCategory } from '../../types';

const schema = yup.object({
  title: yup.string().min(5, 'Tittel må være minst 5 tegn').required('Tittel er påkrevd'),
  description: yup.string().min(20, 'Beskrivelse må være minst 20 tegn').required('Beskrivelse er påkrevd'),
  categories: yup.array().min(1, 'Velg minst én kategori').required('Kategori er påkrevd'),
  date: yup.date().min(new Date(), 'Dato må være i fremtiden').required('Dato er påkrevd'),
  time: yup.string().required('Tidspunkt er påkrevd'),
  duration: yup.number().min(0.5, 'Varighet må være minst 0.5 timer').max(24, 'Varighet kan ikke være mer enn 24 timer').required('Varighet er påkrevd'),
  wage: yup.number().min(50, 'Lønn må være minst 50 kr/timen').max(1000, 'Lønn kan ikke være mer enn 1000 kr/timen').required('Lønn er påkrevd'),
  address: yup.string().min(5, 'Adresse må være minst 5 tegn').required('Adresse er påkrevd'),
}).required();

type FormData = yup.InferType<typeof schema>;

const categories: { value: JobCategory; label: string; icon: string }[] = [
  { value: 'grass-cutting', label: 'Klippe gress', icon: '🌿' },
  { value: 'weed-removal', label: 'Fjerne ugress', icon: '🌱' },
  { value: 'bark-soil', label: 'Legge bark eller ny jord', icon: '🪴' },
  { value: 'hedge-trimming', label: 'Klippe hekk', icon: '🌳' },
  { value: 'trash-removal', label: 'Kjøre søppel', icon: '🗑️' },
  { value: 'washing', label: 'Spyle', icon: '💦' },
  { value: 'cleaning', label: 'Rengjøre', icon: '🧹' },
  { value: 'window-washing', label: 'Vaske vinduer', icon: '🪟' },
  { value: 'carrying', label: 'Bærejobb', icon: '💪' },
  { value: 'painting', label: 'Male', icon: '🎨' },
  { value: 'staining', label: 'Beise', icon: '🪵' },
  { value: 'repair', label: 'Reparere', icon: '🔧' },
  { value: 'tidying', label: 'Rydde', icon: '📦' },
  { value: 'car-washing', label: 'Vaske bilen', icon: '🚗' },
  { value: 'snow-shoveling', label: 'Snømåking', icon: '❄️' },
  { value: 'moving-help', label: 'Hjelpe med flytting', icon: '📦' },
  { value: 'salt-sand', label: 'Strø med sand / salt', icon: '🧂' },
  { value: 'pet-sitting', label: 'Dyrepass', icon: '🐕' },
  { value: 'other', label: 'Annet', icon: '✨' },
];

const CreateJobForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<JobCategory[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setValue('categories', newCategories);
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tittel *
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="input-field"
              placeholder="F.eks. Hjelp med hagearbeid"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategorier *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategorySelect(category.value)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedCategories.includes(category.value)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.label}</div>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm mt-1">{errors.categories.message}</p>
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
                Dato *
              </label>
              <input
                {...register('date')}
                type="date"
                id="date"
                className="input-field"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Tidspunkt *
              </label>
              <input
                {...register('time')}
                type="time"
                id="time"
                className="input-field"
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Wage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Varighet (timer) *
              </label>
              <input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                id="duration"
                step="0.5"
                min="0.5"
                max="24"
                className="input-field"
                placeholder="2.5"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="wage" className="block text-sm font-medium text-gray-700 mb-2">
                Lønn (kr/timen) *
              </label>
              <input
                {...register('wage', { valueAsNumber: true })}
                type="number"
                id="wage"
                min="50"
                max="1000"
                className="input-field"
                placeholder="150"
              />
              {errors.wage && (
                <p className="text-red-500 text-sm mt-1">{errors.wage.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <input
              {...register('address')}
              type="text"
              id="address"
              className="input-field"
              placeholder="F.eks. Storgata 1, Oslo"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Publiserer...' : 'Publiser jobb'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobForm; 