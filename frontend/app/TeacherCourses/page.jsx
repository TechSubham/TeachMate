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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
        <button
          onClick={() => router.push("/DeployCourses")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 min-w-[150px]"
        >
          Deploy New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Courses Yet</h2>
          <p className="text-gray-500">Start by deploying your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.Course_ID} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">{course.Course_Title}</h2>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {course.Category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{course.Description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>{course.Duration_Hours} hours</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📅</span>
                    <span className="text-sm">
                      {new Date(course.Start_Date).toLocaleDateString()} - 
                      {new Date(course.End_Date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">👥</span>
                    <span>{course.enrolled_students || 0} students enrolled</span>
                  </div>

                  {course.enrolled_student_names && (
                    <div className="text-gray-600 text-sm">
                      <span className="font-medium">Enrolled Students: </span>
                      <span className="italic">
                        {course.enrolled_student_names.split(',').join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleViewDetails(course.Course_ID)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEditCourse(course.Course_ID)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition-colors duration-200"
                  >
                    Edit Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}