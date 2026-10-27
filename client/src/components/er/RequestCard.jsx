import React from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { UserCheck, Check, X, Clock } from 'lucide-react';

const MOOD_EMOJIS = {
  1: { emoji: '😔', label: 'Overwhelmed' },
  2: { emoji: '🙁', label: 'Struggling' },
  3: { emoji: '😐', label: 'Neutral' },
  4: { emoji: '🙂', label: 'Managing' },
  5: { emoji: '😌', label: 'Okay' }
};

const RequestCard = ({ request, onAccept, onDecline, isProcessing = false }) => {
  const moodInfo = request.moodBefore ? MOOD_EMOJIS[request.moodBefore] : null;

  return (
    <Card className="border-l-4 border-l-sage bg-white animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-sage/20 text-deep-green">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-dark-brown">
              New Peer Support Request
            </span>
            <Badge variant="sage" size="sm">
              {request.batchYear || 'Student'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-dark-brown/70">
            <span>Gender: <strong className="capitalize text-dark-brown">{request.clientGender || 'Student'}</strong></span>
            <span>&bull;</span>
            <span>Batch: <strong className="text-dark-brown">{request.clientBatch || 'College'}</strong></span>
            {moodInfo && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  Initial Mood: <span className="text-base">{moodInfo.emoji}</span> <strong>{moodInfo.label}</strong>
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-dark-brown/50 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Client remains completely anonymous. Please accept if you are ready to listen.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            onClick={() => onDecline(request.chatId)}
            className="text-terracotta hover:bg-terracotta/10"
            icon={X}
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isProcessing}
            onClick={() => onAccept(request.chatId)}
            icon={Check}
          >
            Accept Chat
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RequestCard;
