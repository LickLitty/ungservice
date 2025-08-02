import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewService } from '../../services/reviewService';
import { User, Review, Job } from '../../types';
import { Star, MapPin, Calendar, Clock, DollarSign, Briefcase, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import toast from 'react-hot-toast';
import ProfileEditForm from './ProfileEditForm';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);
  const [completedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'jobs'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load user data (you'll need to implement this)
      // const userData = await getUserById(userId);
      // setUser(userData);

      // Load reviews
      const unsubscribe = ReviewService.subscribeToUserReviews(userId!, (newReviews) => {
        setReviews(newReviews);
      });

      // Load review statistics
      const stats = await ReviewService.getUserReviewStats(userId!);
      setReviewStats(stats);

      // Load completed jobs (you'll need to implement this)
      // const jobs = await getCompletedJobsByUser(userId);
      // setCompletedJobs(jobs);

      return unsubscribe;
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Kunne ikke laste brukerprofil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId, loadUserProfile]);

  const handleSaveProfile = async (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      // Update user profile
      // await updateUserProfile(currentUser.id, updatedUser);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewStats) return null;

    const maxCount = Math.max(...Object.values(reviewStats.ratingDistribution));

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <span className="text-sm text-gray-600 w-4">{rating}</span>
            <Star className="h-4 w-4 text-yellow-400 fill-current mx-1" />
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${(reviewStats.ratingDistribution[rating] / maxCount) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">
              {reviewStats.ratingDistribution[rating]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bruker ikke funnet</h1>
          <p className="text-gray-600">Brukeren du leter etter eksisterer ikke.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isEditing && user ? (
        <ProfileEditForm
          user={user}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {user.photoURL ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={user.photoURL}
                alt={user.displayName}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center mt-2">
                  {renderStars(user.rating)}
                  <span className="ml-4 text-sm text-gray-500">
                    {user.completedJobs} fullførte oppdrag
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'worker' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'worker' ? 'Arbeidstaker' : 'Arbeidsgiver'}
                  </span>
                  {currentUser && currentUser.id === user.id && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-gray-700">{user.bio}</p>
            )}

            {/* Personal Information */}
            <div className="mt-4 space-y-2">
              {user.age && (
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium w-20">Alder:</span>
                  <span className="text-sm">{user.age} år</span>
                </div>
              )}
              
              {user.city && (
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium w-20">By:</span>
                  <span className="text-sm">{user.city}</span>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium w-20">Adresse:</span>
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
              
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <span className="text-sm font-medium w-20">Telefon:</span>
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              
              {user.experience && (
                <div className="flex items-start text-gray-600">
                  <span className="text-sm font-medium w-20">Erfaring:</span>
                  <span className="text-sm">{user.experience}</span>
                </div>
              )}
              
              {user.skills && user.skills.length > 0 && (
                <div className="flex items-start text-gray-600">
                  <span className="text-sm font-medium w-20">Ferdigheter:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user.location && (
              <div className="flex items-center mt-4 text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {user.location.address}
              </div>
            )}

            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Medlem siden {user.createdAt.toLocaleDateString('nb-NO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Oversikt
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Anmeldelser ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tidligere oppdrag ({completedJobs.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vurderinger</h3>
                {reviewStats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {reviewStats.averageRating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(reviewStats.averageRating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Basert på {reviewStats.totalReviews} anmeldelser
                    </p>
                    {renderRatingDistribution()}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Siste aktivitet</h3>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          Fikk {review.rating} stjerner
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(review.createdAt, { addSuffix: true, locale: nb })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen anmeldelser ennå</h3>
                  <p className="text-gray-500">Denne brukeren har ikke mottatt noen anmeldelser ennå.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {review.reviewer.photoURL ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={review.reviewer.photoURL}
                            alt={review.reviewer.displayName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {review.reviewer.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.reviewer.displayName}
                          </p>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(review.createdAt, { addSuffix: true, locale: nb })}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {completedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen fullførte oppdrag</h3>
                  <p className="text-gray-500">Denne brukeren har ikke fullført noen oppdrag ennå.</p>
                </div>
              ) : (
                completedJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {job.date.toLocaleDateString('nb-NO')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.duration} timer
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.wage} kr/timen
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Fullført</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default UserProfile; 