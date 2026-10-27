import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../components/shared/Button';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-sage/20 border border-sage/40 flex items-center justify-center text-deep-green mb-4">
        <Heart className="w-8 h-8 fill-sage/30 text-deep-green" />
      </div>
      <h1 className="text-3xl font-extrabold text-dark-brown mb-2">Page Not Found</h1>
      <p className="text-xs text-dark-brown/70 max-w-sm mb-6 leading-relaxed">
        The page you are looking for does not exist or has been moved. Take a gentle breath and return home.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Return to ER Connect Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
