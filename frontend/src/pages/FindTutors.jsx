import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, CheckCircle, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FindTutors({ user, logout }) {
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async (subject = '') => {
    setLoading(true);
    try {
      const url = subject ? `${API}/tutors?subject=${encodeURIComponent(subject)}` : `${API}/tutors`;
      const response = await axios.get(url);
      setTutors(response.data);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors(searchTerm);
  };

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="find-tutors-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Tutors</h1>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by subject (e.g., Math, Science)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" data-testid="search-btn">Search</Button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <Link key={tutor.user_id} to={`/tutor/${tutor.user_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`tutor-card-${tutor.user_id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.user?.profile_picture} />
                        <AvatarFallback>{tutor.user?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg">{tutor.user?.name}</h3>
                          {tutor.is_verified && (
                            <CheckCircle className="w-5 h-5 text-blue-500" data-testid={`verified-${tutor.user_id}`} />
                          )}
                        </div>
                        {tutor.avg_rating > 0 && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{tutor.avg_rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-600">({tutor.reviews.length} reviews)</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tutor.subjects?.slice(0, 3).map((subject, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        {tutor.classes_taught?.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            Classes: {tutor.classes_taught.map(c => c.class_range).join(', ')}
                          </p>
                        )}
                        <p className="text-lg font-bold text-blue-600">₹{tutor.monthly_fee}/month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tutors found</p>
            {searchTerm && (
              <Button onClick={() => { setSearchTerm(''); fetchTutors(); }} className="mt-4" data-testid="clear-search-btn">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
