import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Users, TrendingUp, Clock, DollarSign, Upload, CheckCircle, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TutorDashboard({ user, logout }) {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({ class_range: '', subjects: '' });
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    bio: '',
    subjects: '',
    monthly_fee: '',
    education: '',
    coaching_address: '',
    contact_number: '',
    coaching_photo: '',
    teaching_days: [],
    hours_per_day: '',
    boards: [],
    profile_picture: '',
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, subsRes, profileRes, classesRes] = await Promise.all([
        axios.get(`${API}/tutors/stats/me`),
        axios.get(`${API}/subscriptions/my`),
        axios.get(`${API}/tutors/${user.id}`),
        axios.get(`${API}/classes/${user.id}`)
      ]);
      setStats(statsRes.data);
      setSubscriptions(subsRes.data);
      setProfile(profileRes.data);
      setClasses(classesRes.data);
      
      // Set form data
      setFormData({
        bio: profileRes.data.bio || '',
        subjects: profileRes.data.subjects?.join(', ') || '',
        monthly_fee: profileRes.data.monthly_fee || '',
        education: profileRes.data.education || '',
        coaching_address: profileRes.data.coaching_address || '',
        contact_number: profileRes.data.contact_number || '',
        coaching_photo: profileRes.data.coaching_photo || '',
        teaching_days: profileRes.data.teaching_days || [],
        hours_per_day: profileRes.data.hours_per_day || '',
        boards: profileRes.data.boards || [],
        profile_picture: user.profile_picture || '',
        name: user.name || ''
      });
    } catch (error) {
      toast.error('Error fetching data');
    }
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'coaching_photo') {
          setFormData({ ...formData, coaching_photo: reader.result });
        } else if (field === 'profile_picture') {
          setFormData({ ...formData, profile_picture: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
        monthly_fee: parseFloat(formData.monthly_fee),
        hours_per_day: parseInt(formData.hours_per_day)
      };
      await axios.put(`${API}/tutors/profile`, updateData);
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleAcceptSubscription = async (subId) => {
    try {
      await axios.put(`${API}/subscriptions/accept/${subId}`);
      toast.success('Subscription accepted');
      fetchData();
    } catch (error) {
      toast.error('Error accepting subscription');
    }
  };

  const handleRejectSubscription = async (subId) => {
    try {
      await axios.put(`${API}/subscriptions/reject/${subId}`);
      toast.success('Subscription rejected');
      fetchData();
    } catch (error) {
      toast.error('Error rejecting subscription');
    }
  };

  const handleAddClass = async () => {
    if (!newClass.class_range || !newClass.subjects) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await axios.post(`${API}/classes`, {
        class_range: newClass.class_range,
        subjects: newClass.subjects.split(',').map(s => s.trim()).filter(Boolean)
      });
      toast.success('Class added successfully');
      setClassDialogOpen(false);
      setNewClass({ class_range: '', subjects: '' });
      fetchData();
    } catch (error) {
      toast.error('Error adding class');
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      teaching_days: prev.teaching_days.includes(day)
        ? prev.teaching_days.filter(d => d !== day)
        : [...prev.teaching_days, day]
    }));
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (!stats || !profile) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="tutor-dashboard">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profile_picture} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {profile.is_verified && (
                  <CheckCircle className="w-6 h-6 text-blue-500" data-testid="verified-badge" />
                )}
              </div>
              <p className="text-gray-600">Tutor Dashboard</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="edit-profile-btn">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Profile Picture</Label>
                    <p className="text-sm text-gray-600 mb-3">Upload your professional photo</p>
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={formData.profile_picture || user.profile_picture} />
                        <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <label htmlFor="profile-picture-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-500 hover:bg-green-50 transition-all">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                              <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click to update profile picture</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        </label>
                        <input
                          id="profile-picture-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          data-testid="profile-picture-upload-input"
                          onChange={(e) => handleImageUpload(e, 'profile_picture')}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="name-input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      data-testid="bio-input"
                      placeholder="Tell students about yourself and your teaching experience..."
                    />
                  </div>
                  <div>
                    <Label>Subjects (comma separated)</Label>
                    <Input
                      value={formData.subjects}
                      onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                      data-testid="subjects-input"
                    />
                  </div>
                  <div>
                    <Label>Monthly Fee (₹)</Label>
                    <Input
                      type="number"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                      data-testid="fee-input"
                    />
                  </div>
                  <div>
                    <Label>Education Background</Label>
                    <Input
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      data-testid="education-input"
                    />
                  </div>
                  <div>
                    <Label>Coaching Address</Label>
                    <Input
                      value={formData.coaching_address}
                      onChange={(e) => setFormData({ ...formData, coaching_address: e.target.value })}
                      data-testid="address-input"
                    />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      data-testid="contact-input"
                    />
                  </div>
                  <div>
                    <Label>Teaching Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {days.map(day => (
                        <Button
                          key={day}
                          type="button"
                          variant={formData.teaching_days.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDay(day)}
                          data-testid={`day-${day.toLowerCase()}-btn`}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Teaching Hours Per Day</Label>
                    <Input
                      type="number"
                      value={formData.hours_per_day}
                      onChange={(e) => setFormData({ ...formData, hours_per_day: e.target.value })}
                      data-testid="hours-input"
                      placeholder="e.g., 6"
                    />
                  </div>
                  <div>
                    <Label>Boards You Teach</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['CBSE', 'ICSE', 'STATE BOARD'].map(board => (
                        <Button
                          key={board}
                          type="button"
                          variant={formData.boards.includes(board) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              boards: prev.boards.includes(board)
                                ? prev.boards.filter(b => b !== board)
                                : [...prev.boards, board]
                            }));
                          }}
                          data-testid={`board-${board.toLowerCase().replace(' ', '-')}-btn`}
                        >
                          {board}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Coaching Centre Photo</Label>
                    <p className="text-sm text-gray-600 mb-3">Upload a clear photo of your coaching centre</p>
                    <div className="mt-2">
                      <label htmlFor="coaching-photo" className="cursor-pointer">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                          {formData.coaching_photo ? (
                            <div className="space-y-3">
                              <img src={formData.coaching_photo} alt="Coaching Centre" className="w-full max-w-md h-48 mx-auto object-cover rounded-lg shadow-md" />
                              <p className="text-sm text-blue-600 font-medium">Click to change photo</p>
                            </div>
                          ) : (
                            <div>
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                                <Upload className="w-8 h-8 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">Click to upload coaching centre photo</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        id="coaching-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        data-testid="coaching-photo-input"
                        onChange={(e) => handleImageUpload(e, 'coaching_photo')}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" data-testid="save-profile-btn">Save Changes</Button>
                </form>
              </DialogContent>
            </Dialog>

            {!profile.is_verified && profile.verification_status !== 'pending' && (
              <Link to="/verification">
                <Button variant="outline" data-testid="get-verified-btn">
                  Get Verified - ₹99
                </Button>
              </Link>
            )}

            {profile.verification_status === 'pending' && (
              <Badge variant="secondary" data-testid="verification-pending-badge">Verification Pending</Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="reach-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Reach</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reach_count}</div>
            </CardContent>
          </Card>
          <Card data-testid="subscribers-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subscriber_count}</div>
            </CardContent>
          </Card>
          <Card data-testid="hours-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.hours_per_day || 0} hrs/day</div>
            </CardContent>
          </Card>
          <Card data-testid="income-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.total_income}</div>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Centre Photo */}
        {profile.coaching_photo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Coaching Centre</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={profile.coaching_photo} 
                alt="Coaching Centre" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Classes Taught */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Classes Taught</CardTitle>
              <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="add-class-btn">Add Class</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Class</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Class Range (e.g., 7-8 or 1-5)</Label>
                      <Input
                        value={newClass.class_range}
                        onChange={(e) => setNewClass({ ...newClass, class_range: e.target.value })}
                        placeholder="7-8"
                        data-testid="class-range-input"
                      />
                    </div>
                    <div>
                      <Label>Subjects (comma separated)</Label>
                      <Input
                        value={newClass.subjects}
                        onChange={(e) => setNewClass({ ...newClass, subjects: e.target.value })}
                        placeholder="Math, Science"
                        data-testid="class-subjects-input"
                      />
                    </div>
                    <Button onClick={handleAddClass} className="w-full" data-testid="save-class-btn">
                      Add Class
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`class-item-${cls.id}`}>
                    <div>
                      <p className="font-medium">Class {cls.class_range}</p>
                      <p className="text-sm text-gray-600">{cls.subjects.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No classes added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`subscription-${sub.id}`}>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={sub.student?.profile_picture} />
                        <AvatarFallback>{sub.student?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{sub.student?.name}</p>
                        <p className="text-sm text-gray-600">{sub.student?.email}</p>
                        <Badge variant={sub.status === 'pending' ? 'secondary' : sub.status === 'active' ? 'default' : 'destructive'} className="mt-1">
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                    {sub.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleAcceptSubscription(sub.id)} data-testid={`accept-sub-${sub.id}`}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectSubscription(sub.id)} data-testid={`reject-sub-${sub.id}`}>
                          Reject
                        </Button>
                      </div>
                    )}
                    {sub.status === 'active' && (
                      <Link to={`/manage-student/${sub.id}`}>
                        <Button size="sm" data-testid={`manage-student-${sub.id}`}>Manage</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No subscription requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
