import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ArrowLeft, CheckCircle, MapPin, Phone, GraduationCap, Calendar, Clock, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TutorDetail({ user, logout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchTutor();
  }, [id]);

  const fetchTutor = async () => {
    try {
      const response = await axios.get(`${API}/tutors/${id}`);
      setTutor(response.data);
      
      // Check if already subscribed
      if (user.role === 'student') {
        const subsRes = await axios.get(`${API}/subscriptions/my`);
        const hasSub = subsRes.data.some(s => s.tutor_id === id);
        setSubscribed(hasSub);
      }
    } catch (error) {
      toast.error('Error fetching tutor details');
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    try {
      await axios.post(`${API}/subscriptions`, { tutor_id: id });
      toast.success('Subscription request sent!');
      setSubscribed(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error subscribing');
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    try {
      await axios.post(`${API}/reviews`, {
        tutor_id: id,
        rating,
        comment
      });
      toast.success('Review submitted!');
      setReviewDialogOpen(false);
      setRating(5);
      setComment('');
      fetchTutor();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error submitting review');
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

  if (!tutor) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <p className="text-gray-600">Tutor not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="tutor-detail-page">
        <Link to="/find-tutors" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tutors
        </Link>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0 mb-4 md:mb-0">
                <AvatarImage src={tutor.user?.profile_picture} />
                <AvatarFallback className="text-2xl">{tutor.user?.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tutor.user?.name}</h1>
                  {tutor.is_verified && (
                    <CheckCircle className="w-6 h-6 text-green-500" data-testid="verified-badge" />
                  )}
                </div>
                {tutor.avg_rating > 0 && (
                  <div className="flex items-center justify-center md:justify-start space-x-1 mb-3">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tutor.avg_rating.toFixed(1)}</span>
                    <span className="text-gray-600">({tutor.reviews?.length} reviews)</span>
                  </div>
                )}
                {tutor.bio && <p className="text-gray-600 mb-4">{tutor.bio}</p>}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {tutor.subjects?.map((subject, idx) => (
                    <Badge key={idx} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right mt-4 md:mt-0">
                <p className="text-3xl font-bold text-blue-600 mb-4">₹{tutor.monthly_fee}/month</p>
                {user.role === 'student' && (
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribed}
                    className="w-full md:w-auto"
                    data-testid="subscribe-btn"
                  >
                    {subscribed ? 'Subscription Sent' : 'Subscribe'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-blue-600 mt-1" />
                <p className="text-gray-700">{tutor.education || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700">{tutor.contact_number || 'Not specified'}</p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <p className="text-gray-700">{tutor.coaching_address || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teaching Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Teaching Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Teaching Days</p>
                  <p className="font-medium">{tutor.teaching_days?.length > 0 ? tutor.teaching_days.join(', ') : 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Hours per Week</p>
                  <p className="font-medium">{tutor.total_hours_per_week || 0} hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Taught */}
        {tutor.classes_taught?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Classes Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tutor.classes_taught.map((cls, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Class {cls.class_range}</p>
                    <p className="text-sm text-gray-600">{cls.subjects.join(', ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coaching Centre Photo */}
        {tutor.coaching_photo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Coaching Centre</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={tutor.coaching_photo} alt="Coaching Centre" className="w-full h-64 object-cover rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reviews ({tutor.reviews?.length || 0})</CardTitle>
              {user.role === 'student' && subscribed && (
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="write-review-btn">Write Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex space-x-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-8 h-8 cursor-pointer transition-colors ${
                                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                              onClick={() => setRating(star)}
                              data-testid={`star-${star}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Comment</Label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={4}
                          data-testid="review-comment-input"
                        />
                      </div>
                      <Button onClick={handleSubmitReview} className="w-full" data-testid="submit-review-btn">
                        Submit Review
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tutor.reviews?.length > 0 ? (
              <div className="space-y-4">
                {tutor.reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg" data-testid={`review-${review.id}`}>
                    <div className="flex items-start space-x-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.student?.profile_picture} />
                        <AvatarFallback>{review.student?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.student?.name}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
