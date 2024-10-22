"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const studentEmail = localStorage.getItem('studentEmail');
        if (!studentEmail) {
          throw new Error('No student email found. Please log in.');
        }

        const studentResponse = await axios.get(`http://localhost:5050/Profile/Student/${encodeURIComponent(studentEmail)}`);
        const studentId = studentResponse.data.Student_ID;

        const coursesResponse = await axios.get(`http://localhost:5050/Enrollments/${studentId}`);
        setEnrolledCourses(coursesResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading enrolled courses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">My Enrolled Courses</h1>
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => (
            <div
              key={course.Course_ID}
              className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-3 text-gray-800">{course.Course_Title}</h2>
              <p className="text-gray-600 mb-4">{course.Description}</p>
              <p className="text-sm mb-2 text-gray-500">Category: {course.Category}</p>
              <p className="text-sm mb-2 text-gray-500">Duration: {course.Duration_Hours} hours</p>
              <p className="text-sm mb-2 text-gray-500">
                Start Date: {new Date(course.Start_Date).toLocaleDateString()}
              </p>
              <p className="text-sm mb-4 text-gray-500">
                End Date: {new Date(course.End_Date).toLocaleDateString()}
              </p>
              <p className="text-sm mb-4 text-gray-700 font-medium">
                Instructor: {course.Teacher_Name}
              </p>
              <p className="text-sm mb-4 text-gray-500">
                Enrollment Date: {new Date(course.Enrollment_Date).toLocaleDateString()}
              </p>
              <p className="text-sm mb-4 font-bold text-green-500">
                Status: {course.Status}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl">You haven't enrolled in any courses yet.</p>
      )}
    </div>
  );
};

export default EnrolledCourses;