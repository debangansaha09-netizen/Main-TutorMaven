import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Calendar, DollarSign, CheckCircle, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ManageStudent({ user, logout }) {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // For marking new records
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];

  // Generate year options (current year and previous 2 years)
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    fetchData();
  }, [subscriptionId]);

  const fetchData = async () => {
    try {
      const [subsRes, feesRes, attendanceRes] = await Promise.all([
        axios.get(`${API}/subscriptions/my`),
        axios.get(`${API}/fees/${subscriptionId}`),
        axios.get(`${API}/attendance/${subscriptionId}`)
      ]);
      
      const sub = subsRes.data.find(s => s.id === subscriptionId);
      if (!sub || sub.tutor_id !== user.id) {
        toast.error('Subscription not found');
        navigate('/dashboard');
        return;
      }
      
      setSubscription(sub);
      setFees(feesRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    }
    setLoading(false);
  };

  const handleUpdateFee = async (month, year, status) => {
    try {
      await axios.put(`${API}/fees/${subscriptionId}?month=${month}&year=${year}&fee_status=${status}`);
      toast.success(`Fee marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Error updating fee');
    }
  };

  const handleMarkAttendance = async (date, status) => {
    try {
      await axios.post(`${API}/attendance/${subscriptionId}?date=${date}&attendance_status=${status}`);
      toast.success(`Attendance marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Error marking attendance');
    }
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!subscription) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <p className="text-gray-600">Subscription not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="manage-student-page">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Student Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={subscription.student?.profile_picture} />
                <AvatarFallback>{subscription.student?.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{subscription.student?.name}</p>
                <p className="text-gray-600">{subscription.student?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee & Attendance Management */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="fees">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fees" data-testid="fees-tab">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Fee Management
                </TabsTrigger>
                <TabsTrigger value="attendance" data-testid="attendance-tab">
                  <Calendar className="w-4 h-4 mr-2" />
                  Attendance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fees" className="space-y-4">
                {/* 12 Month Fee Grid */}
                <div>
                  <p className="font-medium mb-3">Annual Fee Management</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => {
                      const monthNum = index + 1;
                      const existingFee = fees.find(f => f.month === monthNum && f.year === currentYear);
                      const isPaid = existingFee?.status === 'paid';
                      
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => handleUpdateFee(monthNum, currentYear, isPaid ? 'unpaid' : 'paid')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isPaid 
                              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-400' 
                              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-400'
                          }`}
                          data-testid={`month-${month.toLowerCase()}-btn`}
                        >
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-900">{month}</p>
                            <div className="mt-2">
                              {isPaid ? (
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-6 h-6 text-red-600 mx-auto" />
                              )}
                            </div>
                            <p className={`text-xs mt-1 font-medium ${
                              isPaid ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Click on any month to toggle payment status</p>
                </div>

                {/* Fee History */}
                <div>
                  <p className="font-medium mb-3">Payment History</p>
                  {fees.length > 0 ? (
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div
                          key={fee.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          data-testid={`fee-${fee.id}`}
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(fee.year, fee.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-600">
                              Marked on {new Date(fee.marked_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={fee.status === 'paid' ? 'default' : 'destructive'}>
                              {fee.status}
                            </Badge>
                            <Select
                              value={fee.status}
                              onValueChange={(value) => handleUpdateFee(fee.month, fee.year, value)}
                            >
                              <SelectTrigger className="w-32" data-testid={`fee-status-select-${fee.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No fee records yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                {/* Mark Today's Attendance */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium mb-3">
                    Mark Attendance for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkAttendance(today, 'present')}
                      data-testid="mark-present-btn"
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAttendance(today, 'absent')}
                      data-testid="mark-absent-btn"
                    >
                      Absent
                    </Button>
                  </div>
                </div>

                {/* Attendance History */}
                <div>
                  <p className="font-medium mb-3">Attendance History</p>
                  {attendance.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {attendance.slice().reverse().map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          data-testid={`attendance-${att.id}`}
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <Badge variant={att.status === 'present' ? 'default' : 'secondary'}>
                            {att.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No attendance records yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
