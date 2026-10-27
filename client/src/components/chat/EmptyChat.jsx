import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

const EmptyChat = ({ peerAlias = 'your peer' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-dark-brown/70 my-auto">
      <div className="w-14 h-14 rounded-3xl bg-sage/15 border border-sage/30 flex items-center justify-center text-deep-green mb-4 shadow-soft">
        <Heart className="w-7 h-7 text-deep-green fill-sage/30" />
      </div>
      <h3 className="text-base font-bold text-dark-brown mb-1">
        This is a safe, private space
      </h3>
      <p className="text-xs max-w-sm text-dark-brown/70 leading-relaxed mb-4">
        You are connected with <strong>{peerAlias}</strong>. Take your time to express yourself. Messages are encrypted and your real identity is never exposed.
      </p>
      <div className="flex items-center gap-2 text-[11px] text-deep-green bg-sage/10 px-3 py-1.5 rounded-full font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" />
        AES-256-GCM Encrypted &bull; Anonymous Peer Care
      </div>
    </div>
  );
};

export default EmptyChat;
