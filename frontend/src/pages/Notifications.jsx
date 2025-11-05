import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Notifications({ user, logout }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription_request':
      case 'subscription_accepted':
      case 'subscription_rejected':
        return '👥';
      case 'fee_unpaid':
        return '💸';
      case 'verification_approved':
      case 'verification_rejected':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="notifications-page">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-6 h-6" />
                <span>Notifications</span>
              </CardTitle>
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge data-testid="unread-count">
                  {notifications.filter(n => !n.read).length} unread
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg transition-colors cursor-pointer ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className={`${
                          notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2" data-testid={`new-badge-${notification.id}`}>New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
