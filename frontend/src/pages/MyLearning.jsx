import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, CheckCircle, Calendar, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyLearning({ user, logout }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const subsRes = await axios.get(`${API}/subscriptions/my`);
      const activeSubs = subsRes.data.filter(s => s.status === 'active');
      
      // Fetch fees and attendance for each subscription
      const subsWithData = await Promise.all(
        activeSubs.map(async (sub) => {
          const [feesRes, attendanceRes] = await Promise.all([
            axios.get(`${API}/fees/${sub.id}`),
            axios.get(`${API}/attendance/${sub.id}`)
          ]);
          return {
            ...sub,
            fees: feesRes.data,
            attendance: attendanceRes.data
          };
        })
      );
      
      setSubscriptions(subsWithData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
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

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="my-learning-page">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>

        {subscriptions.length > 0 ? (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <Card key={sub.id} data-testid={`learning-card-${sub.id}`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={sub.tutor?.profile_picture} />
                      <AvatarFallback>{sub.tutor?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle>{sub.tutor?.name}</CardTitle>
                        {sub.tutor_profile?.is_verified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {sub.tutor_profile?.subjects?.join(', ')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="fees">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="fees" data-testid={`fees-tab-${sub.id}`}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Fees
                      </TabsTrigger>
                      <TabsTrigger value="attendance" data-testid={`attendance-tab-${sub.id}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Attendance
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fees" className="mt-4">
                      {sub.fees?.length > 0 ? (
                        <div className="space-y-2">
                          {sub.fees.map((fee) => (
                            <div
                              key={fee.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              data-testid={`fee-record-${fee.id}`}
                            >
                              <div>
                                <p className="font-medium">
                                  {new Date(fee.year, fee.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Marked on {new Date(fee.marked_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                variant={fee.status === 'paid' ? 'default' : 'destructive'}
                                data-testid={`fee-status-${fee.id}`}
                              >
                                {fee.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-8">No fee records yet</p>
                      )}
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-4">
                      {sub.attendance?.length > 0 ? (
                        <div className="space-y-2">
                          {sub.attendance.slice().reverse().map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              data-testid={`attendance-record-${att.id}`}
                            >
                              <div>
                                <p className="font-medium">{new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                              <Badge
                                variant={att.status === 'present' ? 'default' : 'secondary'}
                                data-testid={`attendance-status-${att.id}`}
                              >
                                {att.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-8">No attendance records yet</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any active subscriptions</p>
              <Link to="/find-tutors">
                <Badge className="cursor-pointer" data-testid="find-tutors-link">Find Tutors</Badge>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
