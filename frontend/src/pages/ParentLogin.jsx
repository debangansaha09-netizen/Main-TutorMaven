import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ParentLogin() {
  const navigate = useNavigate();
  const [parentCode, setParentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentData, setParentData] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/parents/login`, { parent_code: parentCode.toUpperCase() });
      setParentData(response.data);
      toast.success('Access granted!');
    } catch (error) {
      toast.error('Invalid parent code');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-home-link">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        {!parentData ? (
          <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Parent Access Portal
              </CardTitle>
              <p className="text-gray-600 mt-2">Enter your child's unique parent code to view their progress</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="parent-code" className="text-base font-semibold">Parent Access Code</Label>
                  <Input
                    id="parent-code"
                    type="text"
                    data-testid="parent-code-input"
                    value={parentCode}
                    onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                    required
                    placeholder="Enter 8-character code"
                    maxLength={8}
                    className="text-lg font-mono tracking-wider mt-2 h-14"
                  />
                  <p className="text-sm text-gray-500 mt-2">Ask your child for their parent code from their profile</p>
                </div>
                <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading} data-testid="parent-login-btn">
                  {loading ? 'Verifying...' : 'Access Dashboard'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Secure Access</p>
                    <p className="text-xs text-blue-700 mt-1">This code is unique to your child and provides read-only access to their academic progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ParentDashboard data={parentData} onLogout={() => setParentData(null)} />
        )}
      </div>
    </div>
  );
}

function ParentDashboard({ data, onLogout }) {
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome, Parent of {data.student.name}</CardTitle>
              <p className="text-gray-600 mt-1">Monitor your child's learning journey</p>
            </div>
            <Button onClick={onLogout} variant="outline">Logout</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-blue-700 font-semibold">School</p>
              <p className="text-lg font-bold text-blue-900">{data.student_profile.school_name || 'Not set'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-purple-700 font-semibold">Board</p>
              <p className="text-lg font-bold text-purple-900">{data.student_profile.board || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details with Fees and Attendance */}
      <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0">
        <CardHeader>
          <CardTitle>Active Tutors & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {data.subscriptions.length > 0 ? (
            <div className="space-y-6">
              {data.subscriptions.map((sub) => (
                <div key={sub.id} className="border-2 border-gray-200 rounded-xl p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                  {/* Tutor Info */}
                  <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {sub.tutor?.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{sub.tutor?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {sub.tutor_profile?.subjects?.join(', ')} • ₹{sub.tutor_profile?.monthly_fee}/month
                      </p>
                    </div>
                  </div>

                  {/* Fees and Attendance Tabs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fees */}
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <span className="text-green-600 mr-2">💰</span>
                        Fee Status
                      </h4>
                      {sub.fees && sub.fees.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {sub.fees.map((fee) => (
                            <div key={fee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">
                                {new Date(fee.year, fee.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                fee.status === 'paid' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {fee.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No fee records yet</p>
                      )}
                    </div>

                    {/* Attendance */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <span className="text-blue-600 mr-2">📅</span>
                        Attendance
                      </h4>
                      {sub.attendance && sub.attendance.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {sub.attendance.slice(-10).reverse().map((att) => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">
                                {new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                att.status === 'present' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {att.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No attendance records yet</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {sub.fees?.filter(f => f.status === 'paid').length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Fees Paid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {sub.fees?.filter(f => f.status === 'unpaid').length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Fees Unpaid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {sub.attendance?.filter(a => a.status === 'present').length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Days Present</p>
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
    </div>
  );
}
