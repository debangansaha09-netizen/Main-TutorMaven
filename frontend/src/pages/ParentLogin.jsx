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

      <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0">
        <CardHeader>
          <CardTitle>Active Tutors</CardTitle>
        </CardHeader>
        <CardContent>
          {data.subscriptions.length > 0 ? (
            <div className="space-y-4">
              {data.subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="font-semibold text-gray-900">Subscription Active</p>
                  <p className="text-sm text-gray-600 mt-1">View detailed attendance and fee records in the student's dashboard</p>
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
