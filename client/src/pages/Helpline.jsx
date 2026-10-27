import React from 'react';
import { PhoneCall, Heart, Shield, Clock, ExternalLink } from 'lucide-react';
import Card from '../components/shared/Card';

const HELPLINES_DATA = [
  {
    name: 'Tele-MANAS (National Mental Health Helpline)',
    number: '14416',
    hours: '24/7 Toll-Free',
    languages: 'English, Hindi, and 20+ regional languages',
    description: 'Government of India national comprehensive tele-mental health programme providing free, round-the-clock psychological and psychiatric counseling.',
    primary: true
  },
  {
    name: 'KIRAN (Ministry of Social Justice & Empowerment)',
    number: '1800-599-0019',
    hours: '24/7 Toll-Free',
    languages: 'English, Hindi, and 13 languages',
    description: 'Dedicated national helpline for early screening, psychological first-aid, stress management, and mental health rehabilitation.'
  },
  {
    name: 'Vandrevala Foundation for Mental Health',
    number: '+91 9999 666 555',
    hours: '24/7 Free Support',
    languages: 'English, Hindi, Gujarati, Marathi',
    description: 'Free, confidential psychological counseling with professional counselors accessible via phone call and WhatsApp message.'
  },
  {
    name: 'Campus Student Counseling & Crisis Desk',
    number: 'Institute Medical Center Ext: 1111',
    hours: 'Campus Working Hours & On-call Emergency',
    languages: 'Campus languages',
    description: 'Direct institutional counselor support for enrolled students experiencing academic stress, personal difficulties, or immediate emergencies.'
  }
];

const Helpline = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-sage/20 border border-sage/40 flex items-center justify-center text-deep-green mx-auto mb-3">
          <PhoneCall className="w-6 h-6 text-deep-green" />
        </div>
        <h1 className="text-3xl font-extrabold text-dark-brown">Crisis & Support Helplines</h1>
        <p className="text-sm text-dark-brown/70 mt-2 max-w-lg mx-auto">
          If you or a friend is in distress, immediate, free, and completely confidential professional help is available right now.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {HELPLINES_DATA.map((h, i) => (
          <Card
            key={i}
            className={`border transition-all ${
              h.primary
                ? 'border-sage/50 bg-white shadow-hover'
                : 'border-warm-brown/15 bg-white/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-dark-brown">{h.name}</h3>
                  {h.primary && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-sage/20 text-deep-green uppercase">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-dark-brown/75 mb-2 leading-relaxed">{h.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-dark-brown/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sage" />
                    {h.hours}
                  </span>
                  <span>&bull;</span>
                  <span>{h.languages}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <a
                  href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sage hover:bg-deep-green text-cream font-bold text-sm shadow-soft transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call {h.number}
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-butter/30 border border-butter text-xs text-dark-brown/80 leading-relaxed text-center">
        <p className="font-bold text-dark-brown mb-1">Important Safety Note</p>
        <p>
          ER Connect is a student peer-support network and does not replace emergency psychiatric intervention or emergency medical rescue services. If someone is in imminent danger of self-harm, please reach out to campus medical emergencies or local emergency response immediately.
        </p>
      </div>
    </div>
  );
};

export default Helpline;
