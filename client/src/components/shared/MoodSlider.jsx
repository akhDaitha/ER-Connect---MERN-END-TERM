import React from 'react';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Overwhelmed', desc: 'Feeling heavy or anxious' },
  { value: 2, emoji: '🙁', label: 'Struggling', desc: 'Down or stressed' },
  { value: 3, emoji: '😐', label: 'Managing', desc: 'Neutral, hanging in there' },
  { value: 4, emoji: '🙂', label: 'Hopeful', desc: 'Calmer, seeing a way forward' },
  { value: 5, emoji: '😌', label: 'Peaceful', desc: 'Supported and grounded' }
];

const MoodSlider = ({ value, onChange, title = 'How are you feeling right now?' }) => {
  return (
    <div className="flex flex-col gap-3">
      {title && <p className="text-sm font-medium text-dark-brown">{title}</p>}
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => {
          const isSelected = value === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-butter/30 border-sage shadow-soft scale-105'
                  : 'bg-white/60 border-warm-brown/10 hover:bg-white hover:border-warm-brown/30'
              }`}
            >
              <span className="text-2xl mb-1">{m.emoji}</span>
              <span className="text-xs font-semibold text-dark-brown">{m.label}</span>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="text-xs text-center text-dark-brown/70 italic">
          {MOODS.find(m => m.value === value)?.desc}
        </p>
      )}
    </div>
  );
};

export default MoodSlider;
