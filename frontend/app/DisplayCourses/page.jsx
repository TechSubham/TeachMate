"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollmentData, setEnrollmentData] = useState({
    Enrollment_Date: new Date().toISOString().split('T')[0],
    Status: 'Pending',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5050/Courses');
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('An error occurred while fetching courses');
      }
    };

    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = courses.filter(course =>
      course.Course_Title.toLowerCase().includes(query) ||
      course.Category.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);
  };

  const handleEnrollCourse = (course) => {
    const studentEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (!studentEmail || userRole !== 'Student') {
      setError('Please log in as a student to enroll in courses');
      return;
    }

    setSelectedCourse(course);
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentEmail = localStorage.getItem('userEmail');

    if (!studentEmail || !selectedCourse) {
      setError('Please log in to enroll in a course');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/Enrollments', {
        Student_Email: studentEmail,
        Course_ID: selectedCourse.Course_ID,
        Enrollment_Date: enrollmentData.Enrollment_Date,
        Status: enrollmentData.Status,
      });

      if (response.status === 200) {
        alert('Course enrollment successful!');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setError(error.response?.data?.error || 'An error occurred while enrolling in the course');
    }
  };

  const handleChange = (e) => {
    setEnrollmentData({ ...enrollmentData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">Explore Courses</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search courses by title or category"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute right-4 top-3 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 16l4 4m0 0l4-4m-4 4V4m-7 9a7 7 0 0014 0A7 7 0 0010 4z" />
        </svg>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.Course_ID}
              className="bg-white shadow-lg rounded-lg p-6 transform hover:scale-105 transition-transform"
            >
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">{course.Course_Title}</h2>
              <p className="text-gray-600 mb-4">{course.Description}</p>
              <p className="text-sm mb-2 text-gray-500">Category: {course.Category}</p>
              <p className="text-sm mb-2 text-gray-500">Duration: {course.Duration_Hours} hours</p>
              <p className="text-sm mb-2 text-gray-500">
                Start Date: {new Date(course.Start_Date).toLocaleDateString()}
              </p>
              <p className="text-sm mb-2 text-gray-500">
                End Date: {new Date(course.End_Date).toLocaleDateString()}
              </p>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-4 hover:bg-blue-600 transition-colors"
                onClick={() => handleEnrollCourse(course)}
              >
                Enroll Now
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No courses match your search.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Enroll in {selectedCourse.Course_Title}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Enrollment Date</label>
                <input
                  type="date"
                  name="Enrollment_Date"
                  value={enrollmentData.Enrollment_Date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  Enroll Now
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
