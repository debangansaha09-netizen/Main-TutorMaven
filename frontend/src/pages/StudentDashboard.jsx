import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { BookOpen, Calendar, CheckCircle, Upload, Users } from 'lucide-react';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard({ user, logout }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    profile_picture: user.profile_picture || '',
    name: user.name || '',
    school_name: '',
    board: '',
    subjects_interested: [],
    parent_code: ''
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStudentProfile();
    fetchBanners();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/my`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API}/students/profile/${user.id}`);
      if (response.data && response.data.parent_code) {
        setFormData(prev => ({
          ...prev,
          school_name: response.data.school_name || '',
          board: response.data.board || '',
          subjects_interested: response.data.subjects_interested || [],
          parent_code: response.data.parent_code || ''
        }));
      } else {
        // Create profile if doesn't exist or parent code is missing
        console.log('Creating/updating student profile to generate parent code...');
        await axios.put(`${API}/students/profile`, { name: user.name });
        // Fetch again after creation
        const newResponse = await axios.get(`${API}/students/profile/${user.id}`);
        if (newResponse.data) {
          setFormData(prev => ({
            ...prev,
            school_name: newResponse.data.school_name || '',
            board: newResponse.data.board || '',
            subjects_interested: newResponse.data.subjects_interested || [],
            parent_code: newResponse.data.parent_code || 'LOADING...'
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      // If error, try to create profile
      try {
        await axios.put(`${API}/students/profile`, { name: user.name });
        setTimeout(fetchStudentProfile, 1000); // Retry after 1 second
      } catch (createError) {
        console.error('Error creating profile:', createError);
      }
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/students/profile`, formData);
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
        {/* Parent Code Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Your Parent Access Code</p>
                <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider mt-2">
                  {formData.parent_code || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Share this code with your parents to give them access to your progress</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-md">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Tutor Banners */}
        {banners.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Verified Tutors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner, index) => (
                <Link key={index} to={`/tutor/${banner.tutor_id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                    <div className="relative h-48">
                      <img 
                        src={banner.banner} 
                        alt={`${banner.tutor_name}'s Banner`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-bold text-lg drop-shadow-lg">{banner.tutor_name}</p>
                          <CheckCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <Badge className="bg-blue-500 text-white">Verified</Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profile_picture} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">Student Dashboard</p>
            </div>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="edit-profile-btn">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Profile Picture</Label>
                  <p className="text-sm text-gray-600 mb-3">Upload your photo</p>
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={formData.profile_picture} />
                      <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 w-full">
                      <label htmlFor="student-profile-picture" className="cursor-pointer">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Click to update profile picture</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </label>
                      <input
                        id="student-profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        data-testid="student-profile-picture-input"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="student-name-input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label>School Name</Label>
                  <Input
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    data-testid="school-name-input"
                    placeholder="Enter your school name"
                  />
                </div>
                <div>
                  <Label>Board</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['CBSE', 'ICSE', 'STATE BOARD'].map(board => (
                      <Button
                        key={board}
                        type="button"
                        variant={formData.board === board ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, board: board })}
                        data-testid={`student-board-${board.toLowerCase().replace(' ', '-')}-btn`}
                      >
                        {board}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Subjects Interested In (comma separated)</Label>
                  <Input
                    value={formData.subjects_interested.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      subjects_interested: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    data-testid="subjects-interested-input"
                    placeholder="e.g., Math, Science, English"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="save-profile-btn">
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                            <CheckCircle className="w-4 h-4 text-blue-500" />
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
