"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Clock, Target, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function EnrolledCourses() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const studentEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');

        if (!studentEmail || userRole !== 'Student') {
          setError('Please log in as a student to view enrolled courses');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        const encodedEmail = encodeURIComponent(studentEmail);
        const response = await fetch(`http://localhost:5050/Enrollments/${encodedEmail}`, {
          headers: {
            'Content-Type': 'application/json',
            'student-email': studentEmail
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enrolled courses');
        }

        const data = await response.json();
        setEnrolledCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-6 text-lg text-gray-600 font-medium">Loading your learning journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-red-100">
          <div className="text-center">
            <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
              <Target className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Error</h2>
            <p className="text-gray-600">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Redirecting you to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Learning Journey</h1>
          <p className="text-xl text-gray-600">Track your progress and continue learning</p>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map((course) => (
              <div 
                key={course.Course_ID}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">{course.Course_Title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-2 min-h-[3rem]">{course.Description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Started {new Date(course.Start_Date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{course.Duration_Hours} hours of content</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === 'Enrolled' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status}
                    </span>
                    <Link 
                      href={`/CourseContent/${course.Course_ID}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold group"
                    >
                      Continue Learning
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Learning Journey</h3>
            <p className="text-gray-600 mb-8">Explore our courses and begin your educational adventure</p>
            <Link href="/DisplayCourses">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200">
                Browse Available Courses
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}