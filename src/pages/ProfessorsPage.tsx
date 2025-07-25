// src/pages/DentistsPage.tsx

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Filter, SortAsc, Users, BookOpen, Award, GraduationCap, UserCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PageContainer from '../components/common/PageContainer';
import DentistCard from '../components/professors/ProfessorCard';
import { supabase } from '../lib/supabase';
import type { ProfessorCardData } from '../types/professor'; // TODO: Rename type file to dentist, and type to DentistCardData

const ITEMS_PER_PAGE = 12; // Show 12 dentists per page (3x4 grid)

const DentistsPage: React.FC = () => {
  const [dentists, setDentists] = useState<ProfessorCardData[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<ProfessorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'publications' | 'courses'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch dentists data
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get total count
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setTotalCount(count || 0);

        // Fetch dentists with stats using a proper join
        const { data: dentistsData, error: dentistsError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            specialty,
            institution,
            university,
            position,
            avatar_url,
            publications_count,
            is_featured,
            display_order,
            professor_stats (
              courses_count
            )
          `)
          .order('display_order', { ascending: true })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

        if (dentistsError) {
          console.error('Error fetching dentists:', dentistsError);
          throw dentistsError;
        }

        if (!dentistsData || dentistsData.length === 0) {
          setError('No dentists found in database');
          return;
        }

        // Format the data - handle the array structure of professor_stats
        const formattedDentists: ProfessorCardData[] = dentistsData.map(prof => {
          const stats = Array.isArray(prof.professor_stats) ? prof.professor_stats[0] : prof.professor_stats;
          return {
            id: prof.id,
            name: prof.full_name || 'Unknown Dentist',
            position: prof.position || 'Dentist',
            institution: prof.institution || prof.university || 'Institution',
            specialty: prof.specialty || 'General Dentistry',
            avatar_url: prof.avatar_url || undefined,
            courses_count: stats?.courses_count || 3,
            publications_count: prof.publications_count || 0,
            is_featured: prof.is_featured || false,
          };
        });

        setDentists(formattedDentists);
        setFilteredDentists(formattedDentists);
      } catch (err) {
        console.error('Error fetching dentists:', err);
        setError(`Failed to load dentists: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDentists();
  }, [currentPage]); // Refetch when page changes

  // Filter and sort dentists
  useEffect(() => {
    let filtered = dentists;
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dentist =>
        dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentist.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(dentist => dentist.specialty === selectedSpecialty);
    }
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'publications':
          return b.publications_count - a.publications_count;
        case 'courses':
          return b.courses_count - a.courses_count;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Featured professors first
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    setFilteredDentists(filtered);
  }, [dentists, searchTerm, selectedSpecialty, sortBy]);

  const specialties = Array.from(new Set(dentists.map(dentist => dentist.specialty)));
  const totalDentists = dentists.length;
  const totalPublications = dentists.reduce((sum, dentist) => sum + dentist.publications_count, 0);
  const totalCourses = dentists.reduce((sum, dentist) => sum + dentist.courses_count, 0);
  const featuredDentists = dentists.filter(dentist => dentist.is_featured).length;

  useEffect(() => {
    document.title = 'Dentists | DentalReach';
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dental-600 to-dental-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Expert Dentists</h1>
            <p className="text-lg opacity-90 mb-8">
              Discover world-class dental professionals and researchers who are shaping the future of dentistry
            </p>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalDentists}</div>
                <div className="text-xs opacity-80">Expert Dentists</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalPublications}</div>
                <div className="text-xs opacity-80">Publications</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <div className="text-xs opacity-80">Courses</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{featuredDentists}</div>
                <div className="text-xs opacity-80">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dentists, specialties, institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Specialty Filter */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'publications' | 'courses')}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="publications">Sort by Publications</option>
                  <option value="courses">Sort by Courses</option>
                </select>
                <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-gray-600 text-sm">
            Showing {filteredDentists.length} of {totalDentists} dentists
          </div>
        </div>
      </section>

      {/* Dentists Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner text="Loading dentists..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-dental-600 text-white rounded-lg hover:bg-dental-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredDentists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No dentists found</div>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDentists.map((dentist) => (
                <DentistCard
                  key={dentist.id}
                  dentist={dentist}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </div>
      </section>

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

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-dental-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Want to Become a Featured Dentist?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our prestigious community of dental professionals and share your expertise with professionals worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-dental-600 text-white rounded-lg hover:bg-dental-700 transition-colors font-semibold">
                Apply Now
              </button>
              <button className="px-8 py-4 border-2 border-dental-600 text-dental-600 rounded-lg hover:bg-dental-50 transition-colors font-semibold">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DentistsPage;