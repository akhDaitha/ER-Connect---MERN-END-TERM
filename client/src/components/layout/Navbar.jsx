import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Phone, Shield, History, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-warm-brown/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-sage/20 group-hover:bg-sage/30 border border-sage/40 flex items-center justify-center transition-colors">
            <Heart className="w-5 h-5 text-deep-green fill-sage/40" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-deep-green block leading-none">
              ER Connect
            </span>
            <span className="text-[10px] tracking-wider text-dark-brown/60 uppercase font-semibold">
              Anonymous Student Support
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-3">
          <Link
            to="/helpline"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-deep-green bg-sage/15 hover:bg-sage/25 rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Helplines
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Role specific quick links */}
              {user.role === 'client' && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors hidden sm:block"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/find-er"
                    className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors hidden sm:block"
                  >
                    Talk to Someone
                  </Link>
                  <Link
                    to="/history"
                    className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    History
                  </Link>
                </>
              )}

              {user.role === 'er' && (
                <Link
                  to="/er/dashboard"
                  className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors"
                >
                  Responder Desk
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                  <Link
                    to="/admin/ers"
                    className="text-xs font-semibold text-dark-brown/80 hover:text-deep-green transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Manage ERs
                  </Link>
                </>
              )}

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-warm-brown/15">
                <Avatar name={user.alias} size="sm" />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-dark-brown leading-tight flex items-center gap-1">
                    {user.alias}
                    <Badge variant={user.role === 'client' ? 'sage' : user.role === 'er' ? 'butter' : 'default'} size="sm">
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-dark-brown/60 hover:text-terracotta hover:bg-terracotta/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-dark-brown hover:text-deep-green transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold bg-sage text-cream hover:bg-deep-green rounded-xl transition-colors shadow-soft"
              >
                Join Anonymously
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
