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
      className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 relative"
      style={{
        backgroundImage: `url('https://customer-assets.emergentagent.com/job_learnhub-498/artifacts/ip50tq76_IMG-20251229-WA0000.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header with glassmorphic effect */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md mb-3 md:mb-4 shadow-xl border border-white/30">
            <img 
              src="https://customer-assets.emergentagent.com/job_b50a8eda-643d-42ca-93a2-b95046836ba5/artifacts/p815m8ok_IMG-20251102-WA0004.jpg" 
              alt="TutorMaven Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg px-2">
            Welcome to TutorMaven
          </h1>
          <p className="text-sm md:text-base text-white/90 mt-2 drop-shadow">Sign in or create an account</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl md:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/30">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-md" data-testid="auth-tabs">
              <TabsTrigger value="login" className="data-[state=active]:bg-white/40 data-[state=active]:text-gray-900 text-white/90" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white/40 data-[state=active]:text-gray-900 text-white/90" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-email" className="text-white font-medium">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    data-testid="login-email-input"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="mt-1 bg-white/80 backdrop-blur-sm border-white/40 focus:border-blue-400 placeholder:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-white font-medium">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    data-testid="login-password-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="mt-1 bg-white/80 backdrop-blur-sm border-white/40 focus:border-blue-400 placeholder:text-gray-500"
                    placeholder="Enter your password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg" 
                  disabled={loading} 
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name" className="text-white font-medium">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    data-testid="register-name-input"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    className="mt-1 bg-white/80 backdrop-blur-sm border-white/40 focus:border-blue-400 placeholder:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email" className="text-white font-medium">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    data-testid="register-email-input"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="mt-1 bg-white/80 backdrop-blur-sm border-white/40 focus:border-blue-400 placeholder:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password" className="text-white font-medium">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    data-testid="register-password-input"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="mt-1 bg-white/80 backdrop-blur-sm border-white/40 focus:border-blue-400 placeholder:text-gray-500"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">I am a</Label>
                  <RadioGroup
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                    data-testid="role-radio-group"
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
                      <RadioGroupItem value="student" id="student" data-testid="student-radio" className="border-white text-white" />
                      <Label htmlFor="student" className="font-normal cursor-pointer flex-1 text-white">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
                      <RadioGroupItem value="tutor" id="tutor" data-testid="tutor-radio" className="border-white text-white" />
                      <Label htmlFor="tutor" className="font-normal cursor-pointer flex-1 text-white">Tutor</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="profile-picture" className="text-white font-medium">Profile Picture (Optional)</Label>
                  <div className="mt-2">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-white/40 rounded-lg p-4 text-center hover:border-white/60 hover:bg-white/10 transition-colors backdrop-blur-sm">
                        {registerData.profile_picture ? (
                          <img src={registerData.profile_picture} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white/40" />
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto text-white/70" />
                            <p className="text-sm text-white/80 mt-2">Click to upload</p>
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
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg" 
                  disabled={loading} 
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <a href="/admin" className="block text-sm text-white/90 hover:text-white hover:underline drop-shadow transition-colors" data-testid="admin-login-link">
            Admin Login
          </a>
          <a href="/parent" className="block text-sm text-white/90 hover:text-white hover:underline drop-shadow transition-colors" data-testid="parent-login-link">
            Parent Access Portal
          </a>
        </div>
      </div>
    </div>
  );
}
