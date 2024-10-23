"use client"
import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, BookOpen, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Explore Courses
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Discover and enroll in courses that match your interests
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title or category..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.Course_ID}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
                    {course.Category}
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-800 line-clamp-2">
                    {course.Course_Title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">{course.Description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{course.Duration_Hours} hours</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(course.Start_Date).toLocaleDateString()} - {new Date(course.End_Date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEnrollCourse(course)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl text-gray-500">No courses match your search criteria.</p>
            </div>
          )}
        </div>

        {/* Enrollment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md m-4 transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Enroll in Course
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {selectedCourse?.Course_Title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    name="Enrollment_Date"
                    value={enrollmentData.Enrollment_Date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                  >
                    Confirm Enrollment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;