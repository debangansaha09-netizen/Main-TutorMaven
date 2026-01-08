import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';

export default function HelpSupport({ user, logout }) {
  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="help-support-page">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">We're here to help you with any questions or issues</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Email Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Send us an email and we'll get back to you within 24 hours</p>
              <a href="mailto:tutormaven100@gmail.com" className="text-blue-600 hover:underline" data-testid="email-link">
                tutormaven100@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Call Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Speak directly with our support team</p>
              <a href="tel:+918167218152" className="text-green-600 hover:underline" data-testid="phone-link">
                +91 8167218152
              </a>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <MessageCircle className="w-6 h-6" />
              <span>Important Disclaimer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-900 font-semibold mb-2">⚠️ Safety and Responsibility Notice</p>
              <p className="text-red-800 text-sm leading-relaxed">
                TutorMaven is a platform that connects students with tutors. We are <strong>NOT responsible for any kind of misbehavior</strong>, 
                misconduct, or disputes between tutors and students. All users are responsible for their own actions and interactions. 
                We strongly recommend meeting in public places and informing parents/guardians about all tutoring arrangements. 
                Please report any inappropriate behavior to authorities immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <span>Quick Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.role === 'student' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Students:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Browse tutors by subject from the "Find Tutors" page</li>
                    <li>Send subscription requests to tutors you're interested in</li>
                    <li>Once accepted, track your fees and attendance in "My Learning"</li>
                    <li>Leave reviews for your tutors after active subscriptions</li>
                  </ul>
                </div>
              )}
              {user.role === 'tutor' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Tutors:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Complete your profile with subjects, fees, and coaching details</li>
                    <li>Upload ₹99 payment proof to get verified badge</li>
                    <li>Accept or reject subscription requests from students</li>
                    <li>Manage student fees and attendance from your dashboard</li>
                    <li>View your stats including reach, subscribers, and income</li>
                  </ul>
                </div>
              )}
              {user.role === 'admin' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Admins:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Review and approve tutor verification requests</li>
                    <li>Manage all users (students and tutors)</li>
                    <li>View platform statistics and active subscriptions</li>
                    <li>Monitor fee payments and attendance records</li>
                  </ul>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Common Issues:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Can't login?</strong> Make sure you're using the correct email and password</li>
                  <li><strong>Verification pending?</strong> Admin will review within 24-48 hours</li>
                  <li><strong>Notifications not showing?</strong> Refresh the page or check your notification bell</li>
                  <li><strong>Profile not updating?</strong> Ensure all required fields are filled</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
