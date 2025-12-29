import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Upload } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Auth({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    profile_picture: ''
  });

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'register') {
          setRegisterData({ ...registerData, profile_picture: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_learnhub-498/artifacts/ip50tq76_IMG-20251229-WA0000.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg mb-4 border border-white/20">
            <img 
              src="https://customer-assets.emergentagent.com/job_b50a8eda-643d-42ca-93a2-b95046836ba5/artifacts/p815m8ok_IMG-20251102-WA0004.jpg" 
              alt="TutorMaven Logo" 
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome to TutorMaven</h1>
          <p className="text-white/90 mt-2 drop-shadow">Sign in or create an account</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-lg" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="login-tab" className="data-[state=active]:bg-white/30">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab" className="data-[state=active]:bg-white/30">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-white">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    data-testid="login-email-input"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-lg border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    data-testid="login-password-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-lg border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={loading} data-testid="login-submit-btn">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    data-testid="register-name-input"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    data-testid="register-email-input"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    data-testid="register-password-input"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>I am a</Label>
                  <RadioGroup
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                    data-testid="role-radio-group"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" data-testid="student-radio" />
                      <Label htmlFor="student" className="font-normal">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tutor" id="tutor" data-testid="tutor-radio" />
                      <Label htmlFor="tutor" className="font-normal">Tutor</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
                  <div className="mt-2">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        {registerData.profile_picture ? (
                          <img src={registerData.profile_picture} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover" />
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-600 mt-2">Click to upload</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      data-testid="profile-upload-input"
                      onChange={(e) => handleImageUpload(e, 'register')}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="register-submit-btn">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <a href="/admin" className="text-sm text-blue-600 hover:underline" data-testid="admin-login-link">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
