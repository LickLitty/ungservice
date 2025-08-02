import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewService } from '../../services/reviewService';
import { Job, User } from '../../types';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  job: Job;
  reviewee: User;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  job, 
  reviewee, 
  onReviewSubmitted, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || rating === 0) {
      toast.error('Vennligst velg en vurdering');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Kommentaren må være minst 10 tegn');
      return;
    }

    setIsSubmitting(true);
    try {
      await ReviewService.createReview({
        jobId: job.id,
        reviewerId: currentUser.id,
        reviewer: currentUser,
        revieweeId: reviewee.id,
        reviewee: reviewee,
        rating,
        comment: comment.trim(),
      });

      toast.success('Anmeldelse sendt!');
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Kunne ikke sende anmeldelse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    const currentRating = hoveredRating || rating;
    switch (currentRating) {
      case 1:
        return 'Dårlig';
      case 2:
        return 'Ikke bra';
      case 3:
        return 'OK';
      case 4:
        return 'Bra';
      case 5:
        return 'Utmerket';
      default:
        return 'Velg vurdering';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Vurder {reviewee.displayName}
        </h3>
        <p className="text-gray-600">
          Hvordan var arbeidet på "{job.title}"?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Din vurdering
          </label>
          <div className="flex items-center space-x-4">
            {renderStars()}
            <span className="text-sm font-medium text-gray-900">
              {getRatingText()}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Kommentar (minst 10 tegn)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Fortell om din opplevelse med arbeidet..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {comment.length}/500 tegn
            </span>
            {comment.length < 10 && comment.length > 0 && (
              <span className="text-xs text-red-500">
                Minst 10 tegn påkrevd
              </span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Jobb detaljer</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Jobb:</strong> {job.title}</p>
            <p><strong>Varighet:</strong> {job.expectedDuration} timer</p>
            <p><strong>Arbeidere:</strong> {job.numberOfWorkers} {job.numberOfWorkers === 1 ? 'arbeider' : 'arbeidere'}</p>
            <p><strong>Betaling:</strong> {job.wage} kr/timen</p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Avbryt
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sender...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send anmeldelse
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 