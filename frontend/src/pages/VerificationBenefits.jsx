import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, Shield, TrendingUp, Star, Users, Award, Phone } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function VerificationBenefits({ user, logout }) {
  const navigate = useNavigate();
  const [showApplication, setShowApplication] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please provide your phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/tutors/verification`, {
        proof_image: '', // No longer required
        phone_number: phoneNumber
      });
      toast.success('Verification submitted! Admin will review within 24-48 hours.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error('Error submitting verification');
    }
    setLoading(false);
  };

  const benefits = [
    { icon: Shield, title: 'Blue Verification Badge', desc: 'Stand out with a premium blue checkmark on your profile' },
    { icon: TrendingUp, title: 'Higher Visibility', desc: 'Your profile appears first in search results' },
    { icon: Star, title: 'Premium Banner', desc: 'Upload custom promotional banners shown to all students' },
    { icon: Users, title: 'Increased Trust', desc: 'Students prefer verified tutors - get 3x more subscription requests' },
    { icon: Award, title: 'Lifetime Verification', desc: 'One-time fee of ₹99 - verified forever, no renewals' },
    { icon: Check, title: 'Priority Support', desc: 'Get faster response from our support team' }
  ];

  return (
    <Layout user={user}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-4 md:mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {!showApplication ? (
          <div className="space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8 md:py-12 px-4 md:px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/20 mb-4 md:mb-6">
                <Shield className="w-8 h-8 md:w-12 md:h-12" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">Get Verified Today</h1>
              <p className="text-base md:text-xl text-blue-100 mb-2">Boost your credibility and reach more students</p>
              <div className="inline-flex items-center space-x-2 text-lg md:text-2xl font-bold bg-white/20 px-4 md:px-6 py-2 md:py-3 rounded-full mt-3 md:mt-4">
                <span>Only</span>
                <span className="text-2xl md:text-4xl text-yellow-300">₹99</span>
                <span>Lifetime</span>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-3 md:mb-4">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-sm md:text-base text-gray-600">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="py-8 md:py-12 text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Get Verified?</h2>
                <p className="text-blue-100 mb-4 md:mb-6 text-base md:text-lg">Join hundreds of verified tutors and grow your student base</p>
                <Button 
                  size="lg" 
                  onClick={() => setShowApplication(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
                  data-testid="apply-verification-btn"
                >
                  Apply for Verification - ₹99
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Application Card - Mobile Friendly */
          <Card className="shadow-2xl border-0 max-w-lg mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl">Verification Application</CardTitle>
              <p className="text-sm md:text-base text-gray-600">Submit your contact details for verification</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Payment Instructions Card */}
                <div className="p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 text-base md:text-lg">Payment Instructions</h3>
                  <ol className="text-sm md:text-base text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Pay ₹99 to our UPI:</li>
                    <div className="ml-5 my-2">
                      <span className="font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 inline-block text-blue-900 font-semibold">tutormaven@upi</span>
                    </div>
                    <li>Enter your phone number below</li>
                    <li>Admin will verify within 24-48 hours</li>
                  </ol>
                </div>

                {/* Phone Number Input */}
                <div>
                  <Label className="text-base font-semibold flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Contact Phone Number</span>
                  </Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    className="mt-2 h-12 md:h-14 text-base md:text-lg"
                    data-testid="phone-input"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Admin will contact you on this number to verify payment</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowApplication(false)} 
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    data-testid="submit-verification-btn"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
