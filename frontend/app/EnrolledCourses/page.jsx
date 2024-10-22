"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EnrolledCourses() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Check for authentication
        const studentEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');

        if (!studentEmail || userRole !== 'Student') {
          setError('Please log in as a student to view enrolled courses');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Fetch enrolled courses
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Enrolled Courses</h1>
          <p className="text-gray-600 mt-2">View and manage your enrolled courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div 
              key={course.Course_ID}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  <h3 className="font-semibold text-lg">{course.Course_Title}</h3>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.Description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {new Date(course.Start_Date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{course.Duration_Hours} hours</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.status === 'Enrolled' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                    <Link href={`/CourseContent/${course.Course_ID}`}>
                      <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Course →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {enrolledCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">No courses enrolled yet</h3>
            <Link href="/DisplayCourses">
              <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Browse Courses
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}