'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BookOpen, Calendar, GraduationCap, BookOpenCheck, Clock, Search, Users, BookMarked, Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentHomepage() {
  const router = useRouter();
  const [studentData, setStudentData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const navLinks = [
    { name: 'My Courses', href: '/EnrolledCourses' },
    { name: 'Browse Courses', href: '/DisplayCourses' },
    { name: 'Find Mentors', href: '/MentorDisplay' },
    { name: 'My Mentors', href: '/AssignedMentors' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');

        if (!studentEmail || userRole !== 'Student') {
          router.push('/login');
          return;
        }

        const encodedEmail = encodeURIComponent(studentEmail.trim());
        const profileResponse = await fetch(
          `http://localhost:5050/Profile/Student/${encodedEmail}`,
          {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }
        );

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
        }

        const profileData = await profileResponse.json();
        setStudentData(profileData);

        const coursesResponse = await fetch(
          `http://localhost:5050/Enrollments/${encodedEmail}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'student-email': studentEmail
            },
            credentials: 'include'
          }
        );

        if (!coursesResponse.ok) {
          throw new Error(`Failed to fetch courses: ${coursesResponse.statusText}`);
        }

        const coursesData = await coursesResponse.json();
        setEnrolledCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
            <p className="mt-2">{error || 'Unable to load student profile'}</p>
          </div>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Return to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-blue-600">Tutorly</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, {studentData.First_Name || 'Student'}!
          </h1>
          <p className="text-blue-100 text-lg">
            Your learning journey continues here. What would you like to learn today?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpenCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(course => course.status === 'Enrolled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/EnrolledCourses">
            <div className="bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-all border border-gray-100">
              <BookMarked className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <p className="font-medium text-gray-700">My Courses</p>
            </div>
          </Link>
          <Link href="/DisplayCourses">
            <div className="bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-all border border-gray-100">
              <Search className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="font-medium text-gray-700">Browse Courses</p>
            </div>
          </Link>
          <Link href="/MentorDisplay">
            <div className="bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-all border border-gray-100">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <p className="font-medium text-gray-700">Find Mentors</p>
            </div>
          </Link>
          <Link href="/AssignedMentors">
            <div className="bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-all border border-gray-100">
              <GraduationCap className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
              <p className="font-medium text-gray-700">My Mentors</p>
            </div>
          </Link>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
            <Link href="/DisplayCourses">
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                Browse more courses →
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div 
                key={course.Course_ID} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">{course.Course_Title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.Description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Started: {new Date(course.Start_Date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'Enrolled' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}