import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { JobCategory, JobType, PriceType } from '../../types';

// Dynamic schema based on price type
const createSchema = (priceType: PriceType) => yup.object({
  title: yup.string().min(5, 'Tittel må være minst 5 tegn').required('Tittel er påkrevd'),
  description: yup.string().min(20, 'Beskrivelse må være minst 20 tegn').required('Beskrivelse er påkrevd'),
  categories: yup.array().min(1, 'Velg minst én kategori').required('Kategori er påkrevd'),
  jobType: yup.string().oneOf(['one-time', 'recurring'], 'Velg jobbtype').required('Jobbtype er påkrevd'),
  priceType: yup.string().oneOf(['hourly', 'fixed'], 'Velg prisetype').required('Prisetype er påkrevd'),
  carRequired: yup.boolean().required('Velg om bil kreves'),
  equipmentRequired: yup.string().oneOf(['yes', 'some', 'no'], 'Velg utstyrsbehov').required('Utstyrsbehov er påkrevd'),
  wage: priceType === 'hourly' 
    ? yup.number().min(50, 'Lønn må være minst 50 kr/timen').max(1000, 'Lønn kan ikke være mer enn 1000 kr/timen').required('Lønn er påkrevd')
    : yup.number().min(100, 'Pris må være minst 100 kr').max(10000, 'Pris kan ikke være mer enn 10 000 kr').required('Pris er påkrevd'),
  address: yup.string().min(5, 'Adresse må være minst 5 tegn').required('Adresse er påkrevd'),
}).required();

type FormData = yup.InferType<ReturnType<typeof createSchema>>;

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
  const [selectedJobType, setSelectedJobType] = useState<JobType>('one-time');
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType>('hourly');
  const [carRequired, setCarRequired] = useState<boolean>(false);
  const [equipmentRequired, setEquipmentRequired] = useState<'yes' | 'some' | 'no'>('no');
  const [expectedDuration, setExpectedDuration] = useState<number>(0);
  const [wage, setWage] = useState<number>(0);

  const schema = createSchema(selectedPriceType);

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
      const jobData = {
        ...data,
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

  const handleJobTypeSelect = (jobType: JobType) => {
    setSelectedJobType(jobType);
    setValue('jobType', jobType);
  };

  const handlePriceTypeSelect = (priceType: PriceType) => {
    setSelectedPriceType(priceType);
    setValue('priceType', priceType);
  };

  const handleCarRequiredSelect = (required: boolean) => {
    setCarRequired(required);
    setValue('carRequired', required);
  };

  const handleEquipmentRequiredSelect = (equipment: 'yes' | 'some' | 'no') => {
    setEquipmentRequired(equipment);
    setValue('equipmentRequired', equipment);
  };

  const handleExpectedDurationChange = (value: number) => {
    setExpectedDuration(value);
  };

  const handleWageChange = (value: number) => {
    setWage(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Publiser ny jobb</h1>
          
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
                placeholder="F.eks. Klippe gress i hagen"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Categories */}
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

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type jobb *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleJobTypeSelect('one-time')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedJobType === 'one-time'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🔨</div>
                  <div className="text-sm font-medium">Engangsjobb</div>
                  <div className="text-xs text-gray-500">Enkelt oppdrag</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleJobTypeSelect('recurring')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedJobType === 'recurring'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-sm font-medium">Gjentakende jobb</div>
                  <div className="text-xs text-gray-500">Regelmessig arbeid</div>
                </button>
              </div>
              {errors.jobType && (
                <p className="text-red-500 text-sm mt-1">{errors.jobType.message}</p>
              )}
            </div>

            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Prisetype *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePriceTypeSelect('hourly')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedPriceType === 'hourly'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="text-sm font-medium">Timebetalt</div>
                  <div className="text-xs text-gray-500">Per time</div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceTypeSelect('fixed')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedPriceType === 'fixed'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium">Fastpris</div>
                  <div className="text-xs text-gray-500">Fast beløp</div>
                </button>
              </div>
              {errors.priceType && (
                <p className="text-red-500 text-sm mt-1">{errors.priceType.message}</p>
              )}
            </div>

            {/* Expected Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forventet varighet
              </label>
              <div className="text-sm text-gray-600 mb-3">
                {selectedPriceType === 'hourly' 
                  ? 'Angi hvor mange timer jobben forventes å ta. Dette påvirker totalprisen.'
                  : 'Angi hvor mange timer jobben forventes å ta. Dette er kun informativt.'
                }
              </div>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                className="input-field"
                placeholder="F.eks. 2.5 timer"
                value={expectedDuration || ''}
                onChange={(e) => handleExpectedDurationChange(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Wage */}
            <div>
              <label htmlFor="wage" className="block text-sm font-medium text-gray-700 mb-2">
                {selectedPriceType === 'hourly' ? 'Lønn per time *' : 'Lønn *'}
              </label>
              <input
                {...register('wage', { valueAsNumber: true })}
                type="number"
                id="wage"
                min={selectedPriceType === 'hourly' ? 50 : 100}
                max={selectedPriceType === 'hourly' ? 1000 : 10000}
                className="input-field"
                placeholder={selectedPriceType === 'hourly' ? '150 kr/timen' : '500 kr'}
                value={wage || ''}
                onChange={(e) => handleWageChange(parseFloat(e.target.value) || 0)}
              />
              {errors.wage && (
                <p className="text-red-500 text-sm mt-1">{errors.wage.message}</p>
              )}
            </div>

            {/* Expected Total Wage */}
            {selectedPriceType === 'hourly' && expectedDuration > 0 && wage > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forventet total lønn
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(expectedDuration * wage).toLocaleString()} kr
                  </div>
                  <div className="text-sm text-gray-600">
                    {expectedDuration} timer × {wage} kr/timen
                  </div>
                </div>
              </div>
            )}

            {/* Job Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Jobbkrav *
              </label>
              
              {/* Car Required */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bil kreves
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCarRequiredSelect(true)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      carRequired === true
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">🚗</div>
                    <div className="text-sm font-medium">Ja</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCarRequiredSelect(false)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      carRequired === false
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">❌</div>
                    <div className="text-sm font-medium">Nei</div>
                  </button>
                </div>
              </div>

              {/* Equipment Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utstyr kreves
                </label>
                <div className="grid grid-cols-3 gap-3">
                                     <button
                     type="button"
                     onClick={() => handleEquipmentRequiredSelect('yes')}
                     className={`p-3 border rounded-lg text-center transition-colors ${
                       equipmentRequired === 'yes'
                         ? 'border-primary-500 bg-primary-50 text-primary-700'
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                   >
                     <div className="text-lg mb-1">🔧</div>
                     <div className="text-sm font-medium">Må ha med alt</div>
                   </button>
                   <button
                     type="button"
                     onClick={() => handleEquipmentRequiredSelect('some')}
                     className={`p-3 border rounded-lg text-center transition-colors ${
                       equipmentRequired === 'some'
                         ? 'border-primary-500 bg-primary-50 text-primary-700'
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                   >
                     <div className="text-lg mb-1">⚠️</div>
                     <div className="text-sm font-medium">Må ha med noe</div>
                   </button>
                   <button
                     type="button"
                     onClick={() => handleEquipmentRequiredSelect('no')}
                     className={`p-3 border rounded-lg text-center transition-colors ${
                       equipmentRequired === 'no'
                         ? 'border-primary-500 bg-primary-50 text-primary-700'
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                   >
                     <div className="text-lg mb-1">❌</div>
                     <div className="text-sm font-medium">Må ikke ha med</div>
                   </button>
                </div>
              </div>
              
              {(errors.carRequired || errors.equipmentRequired) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.carRequired?.message || errors.equipmentRequired?.message}
                </p>
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
    </div>
  );
};

export default CreateJobForm; 