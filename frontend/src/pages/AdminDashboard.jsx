import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Users, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard({ user, logout }) {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, verificationsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/verifications`),
        axios.get(`${API}/admin/users`)
      ]);
      setStats(statsRes.data);
      setVerifications(verificationsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    }
  };

  const handleApproveVerification = async (userId) => {
    try {
      await axios.put(`${API}/admin/verifications/${userId}/approve`);
      toast.success('Verification approved');
      fetchData();
    } catch (error) {
      toast.error('Error approving verification');
    }
  };

  const handleRejectVerification = async (userId) => {
    try {
      await axios.put(`${API}/admin/verifications/${userId}/reject`);
      toast.success('Verification rejected');
      fetchData();
    } catch (error) {
      toast.error('Error rejecting verification');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  if (!stats) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-dashboard">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and verifications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-users-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card data-testid="tutors-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tutors}</div>
            </CardContent>
          </Card>
          <Card data-testid="students-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_students}</div>
            </CardContent>
          </Card>
          <Card data-testid="pending-verifications-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_verifications}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications">
          <TabsList data-testid="admin-tabs">
            <TabsTrigger value="verifications" data-testid="verifications-tab">Verifications</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">All Users</TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="subscriptions-tab">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {verifications.length > 0 ? (
                  <div className="space-y-4">
                    {verifications.map((verification) => (
                      <div key={verification.user_id} className="p-4 bg-gray-50 rounded-lg" data-testid={`verification-${verification.user_id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={verification.user?.profile_picture} />
                              <AvatarFallback>{verification.user?.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{verification.user?.name}</p>
                              <p className="text-sm text-gray-600">{verification.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveVerification(verification.user_id)}
                              data-testid={`approve-${verification.user_id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectVerification(verification.user_id)}
                              data-testid={`reject-${verification.user_id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        {verification.verification_proof && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Payment Proof:</p>
                            <img
                              src={verification.verification_proof}
                              alt="Proof"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No pending verifications</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(u => u.role !== 'admin').map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`user-${u.id}`}>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={u.profile_picture} />
                          <AvatarFallback>{u.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                          <Badge variant="outline" className="mt-1">{u.role}</Badge>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" data-testid={`delete-user-${u.id}`}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {u.name}'s account and all related data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(u.id)} data-testid={`confirm-delete-${u.id}`}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.subscription_details.length > 0 ? (
                  <div className="space-y-4">
                    {stats.subscription_details.map((sub) => (
                      <div key={sub.id} className="p-4 bg-gray-50 rounded-lg" data-testid={`admin-subscription-${sub.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{sub.student?.name}</p>
                              <p className="text-sm text-gray-600">learning from {sub.tutor?.name}</p>
                            </div>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Fees Status:</p>
                            <p className="font-medium">
                              {sub.fees.filter(f => f.status === 'paid').length} paid /{' '}
                              {sub.fees.filter(f => f.status === 'unpaid').length} unpaid
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Attendance:</p>
                            <p className="font-medium">
                              {sub.attendance.filter(a => a.status === 'present').length} present /{' '}
                              {sub.attendance.filter(a => a.status === 'absent').length} absent
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No active subscriptions</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
