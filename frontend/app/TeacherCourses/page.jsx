"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');

      if (!email || role !== 'Teacher') {
        router.push('/login');
        return null;
      }
      return email;
    };

    const email = checkAuth();
    if (email) {
      setTeacherEmail(email);
      fetchCourses(email);
    }
  }, [router]);

  const fetchCourses = async (email) => {
    try {
      if (!email) {
        throw new Error('Please log in to view your courses');
      }

      const response = await fetch(`http://localhost:5050/TeacherCourses/${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
 
      const verifiedCourses = await Promise.all(
        data.map(async (course) => {
          const verifyResponse = await fetch(
            `http://localhost:5050/VerifyCourseOwnership/${course.Course_ID}/${encodeURIComponent(email)}`
          );
          const verifyData = await verifyResponse.json();
          return verifyData.isOwner ? course : null;
        })
      );

      setCourses(verifiedCourses.filter(course => course !== null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (courseId) => {
    try {
      const response = await fetch(
        `http://localhost:5050/VerifyCourseOwnership/${courseId}/${encodeURIComponent(teacherEmail)}`
      );
      const data = await response.json();
      
      if (data.isOwner) {
        router.push(`/course/${courseId}`);
      } else {
        setError("You don't have permission to view this course");
      }
    } catch (err) {
      setError("Failed to verify course ownership");
    }
  };

  const handleEditCourse = async (courseId) => {
    try {
      const response = await fetch(
        `http://localhost:5050/VerifyCourseOwnership/${courseId}/${encodeURIComponent(teacherEmail)}`
      );
      const data = await response.json();
      
      if (data.isOwner) {
        router.push(`/course/${courseId}/edit`);
      } else {
        setError("You don't have permission to edit this course");
      }
    } catch (err) {
      setError("Failed to verify course ownership");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
              <p className="text-gray-600">Manage and monitor your teaching portfolio</p>
            </div>
            <button
              onClick={() => router.push("/DeployCourses")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 min-w-[180px] justify-center"
            >
              <span className="text-xl">+</span>
              <span>Deploy New Course</span>
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Courses Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your teaching journey by deploying your first course. It only takes a few minutes to get started!</p>
            <button
              onClick={() => router.push("/DeployCourses")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Deploy Your First Course</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.Course_ID} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="h-3 bg-blue-600"></div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                        {course.Category}
                      </span>
                      <span className="text-gray-400 text-sm">ID: {course.Course_ID}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{course.Course_Title}</h2>
                    <p className="text-gray-600 line-clamp-2">{course.Description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="mr-3 text-lg">⏰</span>
                      <span className="font-medium">{course.Duration_Hours} hours</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="mr-3 text-lg">📅</span>
                      <div className="text-sm">
                        <div>Start: {new Date(course.Start_Date).toLocaleDateString()}</div>
                        <div>End: {new Date(course.End_Date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="mr-3 text-lg">👥</span>
                      <span className="font-medium">{course.enrolled_students || 0} students enrolled</span>
                    </div>
                  </div>

                  {course.enrolled_student_names && (
                    <div className="mb-6 p-3 bg-gray-50 rounded">
                      <h3 className="font-medium text-gray-700 mb-2">Enrolled Students</h3>
                      <div className="text-sm text-gray-600">
                        {course.enrolled_student_names.split(',').map((name, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-white px-2 py-1 rounded mr-2 mb-2"
                          >
                            {name.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleViewDetails(course.Course_ID)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                    >
                      View Details
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}