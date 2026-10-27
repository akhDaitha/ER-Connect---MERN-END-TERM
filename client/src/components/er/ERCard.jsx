import React from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import StarRating from '../shared/StarRating';
import { MessageCircle, EyeOff } from 'lucide-react';

const ERCard = ({ er, onConnect, onSkip }) => {
  return (
    <Card hover className="flex flex-col justify-between h-full bg-white/90">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={er.alias} size="md" />
            <div>
              <h3 className="font-bold text-base text-dark-brown">{er.alias}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="butter" size="sm">
                  {er.gender === 'male' ? 'Male Senior' : er.gender === 'female' ? 'Female Senior' : 'Senior Responder'}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-deep-green">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="my-3 py-2 border-y border-warm-brown/10 flex items-center justify-between">
          <span className="text-xs text-dark-brown/70 font-medium">Peer Rating</span>
          <StarRating rating={er.avgRating} count={er.ratingCount} size="sm" />
        </div>

        <p className="text-xs text-dark-brown/70 mb-4 line-clamp-2">
          Ready to listen without judgment. All chats are private and anonymous.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSkip(er._id || er.id)}
            className="text-xs text-dark-brown/50 hover:text-dark-brown"
            icon={EyeOff}
          >
            Skip
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onConnect(er._id || er.id)}
          className="flex-1"
          icon={MessageCircle}
        >
          Talk to {er.alias}
        </Button>
      </div>
    </Card>
  );
};

export default ERCard;
