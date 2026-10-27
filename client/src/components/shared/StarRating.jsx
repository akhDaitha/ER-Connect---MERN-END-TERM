import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  count = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const current = hoverRating || Math.round(rating);

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, i) => {
          const starVal = i + 1;
          const isFilled = starVal <= current;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starVal)}
              onMouseEnter={() => interactive && setHoverRating(starVal)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-dark-brown/20 stroke-1'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-dark-brown/80 ml-1">
          {rating.toFixed(1)}
          {count !== null && (
            <span className="text-dark-brown/50 font-normal ml-0.5">({count})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
