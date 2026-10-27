import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, HeartHandshake } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-warm-brown/10 bg-cream py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-base text-deep-green">ER Connect</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-deep-green font-semibold">Institute Peer Care</span>
            </div>
            <p className="text-xs text-dark-brown/70 leading-relaxed">
              Safe, confidential peer support connecting students with trained senior Emotional Responders.
              You are never alone on your academic journey.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-brown/80 mb-3">
              Anonymity Guarantees
            </h4>
            <ul className="text-xs text-dark-brown/70 space-y-2">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-sage" />
                Responders only see your alias, gender & batch
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-sage" />
                Messages are AES-256-GCM encrypted in storage
              </li>
              <li className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-sage" />
                No phone numbers or social profiles required
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-brown/80 mb-3">
              Emergency & Resources
            </h4>
            <div className="text-xs text-dark-brown/70 space-y-2">
              <p>National Tele-MANAS: <a href="tel:14416" className="font-bold text-deep-green underline">14416 (24/7 Free)</a></p>
              <p>Campus Counseling Hotline: <span className="font-bold text-deep-green">Ext 1111</span></p>
              <Link to="/helpline" className="inline-block text-xs font-semibold text-deep-green hover:underline mt-1">
                View All Crisis & Counseling Helplines →
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-warm-brown/10 text-center text-[11px] text-dark-brown/50">
          ER Connect &copy; {new Date().getFullYear()} &bull; Built with care for campus student mental well-being.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
