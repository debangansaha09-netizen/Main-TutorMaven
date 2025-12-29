import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, Upload, Shield, TrendingUp, Star, Users, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function VerificationBenefits({ user, logout }) {
  const navigate = useNavigate();
  const [showApplication, setShowApplication] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage || !phoneNumber) {
      toast.error('Please provide payment proof and phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/tutors/verification`, {
        proof_image: proofImage,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {!showApplication ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl text-white">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg mb-6">
                <Shield className="w-12 h-12" />
              </div>
              <h1 className="text-5xl font-bold mb-4">Get Verified Today</h1>
              <p className="text-xl text-blue-100 mb-2">Boost your credibility and reach more students</p>
              <div className="inline-flex items-center space-x-2 text-2xl font-bold bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full mt-4">
                <span>Only</span>
                <span className="text-4xl text-yellow-300">₹99</span>
                <span>Lifetime</span>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="backdrop-blur-lg bg-white/80 hover:shadow-2xl transition-all border-0 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA */}
            <Card className="backdrop-blur-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Verified?</h2>
                <p className="text-blue-100 mb-6 text-lg">Join hundreds of verified tutors and grow your student base</p>
                <Button 
                  size="lg" 
                  onClick={() => setShowApplication(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
                  data-testid="apply-verification-btn"
                >
                  Apply for Verification - ₹99
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="backdrop-blur-lg bg-white/90 shadow-2xl border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Verification Application</CardTitle>
              <p className="text-gray-600">Submit payment proof and contact details</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Pay ₹99 to our UPI: <span className="font-mono bg-white px-2 py-1 rounded">tutormaven@upi</span></li>
                    <li>Take a screenshot of the payment confirmation</li>
                    <li>Upload it below along with your phone number</li>
                    <li>Admin will verify and approve within 24-48 hours</li>
                  </ol>
                </div>

                <div>
                  <Label className="text-base font-semibold">Payment Proof (Screenshot)</Label>
                  <div className="mt-2">
                    <label htmlFor="proof-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        {proofImage ? (
                          <img src={proofImage} alt="Proof" className="w-48 h-48 mx-auto object-cover rounded-lg" />
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                            <p className="font-medium text-gray-700">Click to upload payment screenshot</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="proof-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Contact Phone Number</Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    className="mt-2 h-12"
                    data-testid="phone-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">Admin may contact you for verification</p>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowApplication(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="submit-verification-btn">
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
