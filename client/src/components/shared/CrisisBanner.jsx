import React from 'react';
import { HeartHandshake, PhoneCall, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CrisisBanner = ({ notice, helplines = [] }) => {
  return (
    <div className="bg-amber-50/90 border border-butter rounded-3xl p-4 my-3 text-dark-brown shadow-soft animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-butter/40 rounded-2xl text-deep-green mt-0.5">
          <HeartHandshake className="w-5 h-5 text-deep-green" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-dark-brown mb-1">
            You are not alone. Caring support is always here for you.
          </h4>
          <p className="text-xs text-dark-brown/80 mb-3">
            {notice || 'If you are experiencing overwhelming feelings or distress, please know that immediate, confidential professional care is available 24/7.'}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href="tel:14416"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-cream font-semibold rounded-xl hover:bg-deep-green transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Tele-MANAS: 14416 (Toll-Free 24/7)
            </a>
            <Link
              to="/helpline"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-warm-brown/20 text-dark-brown font-medium rounded-xl hover:bg-cream transition-colors"
            >
              All Institute & National Helplines
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisBanner;
