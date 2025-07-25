import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, MapPin, Clock, Users, Filter, Search, Globe, Video, ChevronRight, Plus, CheckCircle, Lightbulb, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import PageContainer from "../components/common/PageContainer";
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  type: string;
  is_virtual: boolean;
  max_attendees: number;
  price: number;
  organizer_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

const ITEMS_PER_PAGE = 8; // Show 8 events per page (2x4 grid)

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = ['All Events', 'conference', 'webinar', 'workshop', 'seminar', 'networking'];

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        // First get total count
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'upcoming');

        setTotalCount(count || 0);

        // Then fetch current page
        const { data, error: fetchError } = await supabase
          .from('events')
          .select(`
            *,
            profiles (
              full_name,
              is_verified
            )
          `)
          .eq('status', 'upcoming')
          .order('date', { ascending: true })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

        if (fetchError) throw fetchError;
        setEvents(data || []);

        // Fetch registration counts for each event
        if (data && data.length > 0) {
          const counts: Record<number, number> = {};
          await Promise.all(
            data.map(async (event) => {
              const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id)
                .eq('status', 'registered');
              counts[event.id] = count || 0;
            })
          );
          setRegistrationCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    document.title = 'Events | DentalReach';
  }, [currentPage]); // Refetch when page changes

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      selectedCategory === 'All Events' || 
      event.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (error) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pb-16 font-inter">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Events & Webinars
              </h1>
              <p className="text-xl text-dental-100 mb-8">
                Discover upcoming conferences, webinars, and workshops in dentistry. Connect, learn, and grow with professionals worldwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setSelectedCategory('conference')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span>Conferences</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('webinar')}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Video className="h-5 w-5 mr-2" />
                  <span>Webinars</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-4 text-white">Host an Event</h3>
                <p className="text-dental-100 mb-6">
                  Share your expertise and connect with the dental community
                </p>
                {user ? (
                  <Link
                    to="/events/create"
                    className="inline-flex items-center px-6 py-3 bg-white text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Event
                  </Link>
                ) : (
                  <button className="inline-flex items-center px-6 py-3 bg-white text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold">
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search events, topics, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent text-lg"
              />
            </div>
            <select
              value={selectedCategory || 'All Events'}
              onChange={(e) => setSelectedCategory(e.target.value === 'All Events' ? null : e.target.value)}
              className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <PageContainer>
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events, topics, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full shadow-md px-6 py-4 pl-12 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-1">
              <select
                value={selectedCategory || 'All Events'}
                onChange={(e) => setSelectedCategory(e.target.value === 'All Events' ? null : e.target.value)}
                className="w-full rounded-full shadow-md px-6 py-4 border border-neutral-200 text-neutral-700 focus:outline-none focus:border-dental-500 hover:border-dental-400 transition-colors duration-200 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'All Events' ? category : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner text="Loading events..." />
        )}

        {/* Events Grid */}
        {!isLoading && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-neutral-600">
                Showing {filteredEvents.length} of {events.length} events
                {selectedCategory && selectedCategory !== 'All Events' && (
                  <span> in {selectedCategory}</span>
                )}
                {searchQuery && (
                  <span> matching "{searchQuery}"</span>
                )}
              </p>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">No events found</h3>
                <p className="text-neutral-500 mb-6">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search criteria or browse all events.'
                    : 'No upcoming events have been scheduled yet.'}
                </p>
                {user && (
                  <Link to="/events/create">
                    <PrimaryButton className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Create the First Event
                    </PrimaryButton>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            event.is_virtual 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {event.is_virtual ? (
                              <><Video className="h-3 w-3 mr-1" /> Virtual</>
                            ) : (
                              <><Globe className="h-3 w-3 mr-1" /> In Person</>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Event Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-3 py-1 bg-dental-50 text-dental-600 rounded-full text-sm font-medium">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        {event.profiles?.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" title="Verified Organizer" />
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                        <Link 
                          to={`/events/${event.id}`}
                          className="hover:text-dental-600 transition-colors"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      
                      {/* Description */}
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      {/* Event Meta */}
                      <div className="space-y-2 text-sm text-neutral-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(event.date)}</span>
                          {event.time && (
                            <>
                              <Clock className="h-4 w-4 ml-4 mr-2" />
                              <span>{formatTime(event.time)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{registrationCounts[event.id] || 0} registered</span>
                          </div>
                          {event.price > 0 && (
                            <span className="font-medium text-dental-600">${event.price}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Organizer */}
                      <div className="text-xs text-neutral-500 mb-4">
                        Organized by {event.profiles?.full_name || 'Event Organizer'}
                      </div>
                      
                      {/* Learn More Link */}
                      <Link 
                        to={`/events/${event.id}`}
                        className="inline-flex items-center text-dental-600 font-medium hover:text-dental-700 transition-colors"
                      >
                        Learn More & Register
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button (if needed for pagination) */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <SecondaryButton>Load More Events</SecondaryButton>
          </div>
        )}
      </PageContainer>

      {/* Add pagination controls before closing div */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === page
                  ? 'bg-dental-600 text-white border-dental-600'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;