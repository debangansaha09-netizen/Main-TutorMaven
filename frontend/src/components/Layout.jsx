import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Home, Search, HelpCircle, Settings, Bell } from 'lucide-react';
import { Badge } from './ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Layout({ children, user, showBottomNav = true }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread/count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/find-tutors', label: 'Find Tutors', icon: Search },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation (Desktop) */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_b50a8eda-643d-42ca-93a2-b95046836ba5/artifacts/p815m8ok_IMG-20251102-WA0004.jpg" 
                alt="TutorMaven Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-gray-900">TutorMaven</span>
            </div>

            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                to="/notifications"
                className="relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                data-testid="nav-notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs" data-testid="unread-badge">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_b50a8eda-643d-42ca-93a2-b95046836ba5/artifacts/p815m8ok_IMG-20251102-WA0004.jpg" 
              alt="TutorMaven Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-lg font-bold text-gray-900">TutorMaven</span>
          </div>
          <Link to="/notifications" className="relative" data-testid="mobile-notifications">
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs" data-testid="mobile-unread-badge">
                {unreadCount}
              </Badge>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      {showBottomNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" data-testid="bottom-nav">
          <div className="grid grid-cols-4 h-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
