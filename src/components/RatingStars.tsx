import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  count,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const half = !filled && index < rating;

          return (
            <Star
              key={index}
              className={`${sizeClasses[size]} ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : half
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>

      {showNumber && (
        <span className={`font-semibold text-gray-700 ${textClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className={`text-gray-400 ${textClasses[size]}`}>
          ({count})
        </span>
      )}
    </div>
  );
}
