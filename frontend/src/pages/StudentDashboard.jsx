import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { BookOpen, Calendar, CheckCircle, Upload } from 'lucide-react';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard({ user, logout }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || '');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/my`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/students/profile`, { profile_picture: profilePicture });
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="student-dashboard">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profile_picture} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">Student Dashboard</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/find-tutors">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="find-tutors-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Find Tutors</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Browse and subscribe to tutors</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/my-learning">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="my-learning-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>My Learning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Track fees and attendance</p>
              </CardContent>
            </Card>
          </Link>
          <Card data-testid="active-subscriptions-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Active Tutors</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* My Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>My Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`subscription-${sub.id}`}>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={sub.tutor?.profile_picture} />
                        <AvatarFallback>{sub.tutor?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{sub.tutor?.name}</p>
                          {sub.tutor_profile?.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {sub.tutor_profile?.subjects?.slice(0, 3).join(', ')}
                        </p>
                        <Badge
                          variant={
                            sub.status === 'pending'
                              ? 'secondary'
                              : sub.status === 'active'
                              ? 'default'
                              : 'destructive'
                          }
                          className="mt-1"
                        >
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                    {sub.status === 'active' && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{sub.tutor_profile?.monthly_fee}/month</p>
                        <Link to={`/tutor/${sub.tutor_id}`}>
                          <Button size="sm" variant="outline" className="mt-2" data-testid={`view-tutor-${sub.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't subscribed to any tutors yet</p>
                <Link to="/find-tutors">
                  <Button data-testid="browse-tutors-btn">Browse Tutors</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
