import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, UserCheck, MessageSquareHeart, PhoneCall, Sparkles } from 'lucide-react';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import useAuth from '../hooks/useAuth';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/20 border border-sage/30 text-deep-green text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-deep-green" />
          Institute Anonymous Peer Support
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-brown tracking-tight leading-tight mb-6">
          You deserve a safe, compassionate space to be heard.
        </h1>

        <p className="text-base sm:text-lg text-dark-brown/80 leading-relaxed mb-8 max-w-2xl mx-auto">
          College life can feel overwhelming at times. Connect anonymously with trained senior peers who understand what you are going through — free, confidential, and judgment-free.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link to={user.role === 'client' ? '/find-er' : user.role === 'er' ? '/er/dashboard' : '/admin'}>
              <Button size="lg" variant="primary" icon={MessageSquareHeart}>
                {user.role === 'client' ? 'Talk to a Peer Now' : 'Go to Dashboard'}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" variant="primary" icon={MessageSquareHeart}>
                  Connect with a Peer Responder
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Responder & Student Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Pillars of Care */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-dark-brown mb-2">Built on Trust, Empathy, and Privacy</h2>
          <p className="text-xs text-dark-brown/70">Designed for student mental health and peace of mind</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-sage/20 border border-sage/30 flex items-center justify-center text-deep-green mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-brown mb-2">100% Client Anonymity</h3>
            <p className="text-xs text-dark-brown/70 leading-relaxed">
              Your senior responder never sees your name, email, or student ID. You are identified only by a friendly random alias like <em>QuietFox42</em>.
            </p>
          </Card>

          <Card className="bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-butter/40 border border-butter flex items-center justify-center text-warm-brown mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-brown mb-2">Appointed Senior Responders</h3>
            <p className="text-xs text-dark-brown/70 leading-relaxed">
              Responders are vetted institute seniors trained in empathetic listening, crisis awareness, and active peer support.
            </p>
          </Card>

          <Card className="bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-brown mb-2">Encrypted at Rest</h3>
            <p className="text-xs text-dark-brown/70 leading-relaxed">
              Every message is encrypted using AES-256-GCM before storage. Only you and your chat partner hold access to your conversation.
            </p>
          </Card>
        </div>
      </section>

      {/* Emergency Notice Card */}
      <section className="max-w-4xl mx-auto px-4 w-full">
        <div className="bg-butter/20 border border-butter rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-warm-brown block mb-1">
              Urgent Support
            </span>
            <h3 className="text-lg font-bold text-dark-brown mb-2">
              In an immediate crisis? Professional help is always one call away.
            </h3>
            <p className="text-xs text-dark-brown/70 max-w-lg">
              National tele-counseling is available 24 hours a day, 7 days a week, toll-free across India.
            </p>
          </div>
          <Link to="/helpline" className="shrink-0">
            <Button variant="secondary" icon={PhoneCall}>
              View Crisis Helplines
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
