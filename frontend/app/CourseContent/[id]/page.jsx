"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../../lib/utils";
import { useParams } from 'next/navigation';

const CourseContent = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const params = useParams();
  const courseId = params.id;

  useEffect(() => {
    const fetchCourseContent = async () => {
      const studentEmail = localStorage.getItem('userEmail');
      
      if (!studentEmail) {
        setError('Please log in to view course content');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [classesResponse, assignmentsResponse, materialsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/ClassSchedules/${courseId}`, {
            headers: { 'student-email': studentEmail }
          }),
          axios.get(`${API_BASE_URL}/Assignments/${courseId}`, {
            headers: { 'student-email': studentEmail }
          }),
          axios.get(`${API_BASE_URL}/CourseMaterials/${courseId}`, {
            headers: { 'student-email': studentEmail }
          })
        ]);

        setClasses(classesResponse.data);
        setAssignments(assignmentsResponse.data);
        setMaterials(materialsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course content:', error);
        setError(error.response?.data?.error || 'Failed to fetch course content');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseContent();
    }
  }, [courseId]);

  const handleDownload = async (materialId) => {
    const studentEmail = localStorage.getItem('studentEmail');
    if (!studentEmail) {
      setError('Please log in to download materials');
      return;
    }
    
    try {
      const response = await axios({
        url: `${API_BASE_URL}/download-material/${materialId}`,
        method: 'GET',
        responseType: 'blob',
        headers: { 'student-email': studentEmail }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'course_material.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download the file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="mt-1 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TabButton = ({ name, label, count }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-200
        ${activeTab === name 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50'}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-1 text-xs rounded-full
          ${activeTab === name 
            ? 'bg-blue-400 text-white' 
            : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Course Content</h1>
        
        <div className="flex space-x-4 mb-8">
          <TabButton name="classes" label="Classes" count={classes.length} />
          <TabButton name="assignments" label="Assignments" count={assignments.length} />
          <TabButton name="materials" label="Materials" count={materials.length} />
        </div>

        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.Schedule_ID} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {new Date(classItem.Class_Date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        {new Date(classItem.Class_Date).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                        {' · '}{classItem.Duration_Minutes} minutes
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{classItem.Description}</p>
                  {classItem.Meeting_Link && (
                    <a
                      href={classItem.Meeting_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for updated class schedule.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.Assignment_ID} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{assignment.Title}</h3>
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {assignment.Max_Score} points
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{assignment.Description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Due {new Date(assignment.Due_Date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    {assignment.File_Path && (
                      <a
                        href={`${API_BASE_URL}/download-assignment/${assignment.Assignment_ID}`}
                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new assignments.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {materials.map((material) => (
              <div key={material.Material_ID} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{material.File_Name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploaded {new Date(material.Upload_Date).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6">{material.Description}</p>
                  <button
                    onClick={() => handleDownload(material.Material_ID)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
            {materials.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No materials uploaded</h3>
                <p className="mt-1 text-sm text-gray-500">Course materials will appear here once uploaded.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification for Errors */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContent;