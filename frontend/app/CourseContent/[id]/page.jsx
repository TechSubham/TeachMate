"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const CourseContent = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        const classesResponse = await axios.get(
          `http://localhost:5050/ClassSchedules/${courseId}`,
          {
            headers: {
              'student-email': studentEmail
            }
          }
        );

        const assignmentsResponse = await axios.get(
          `http://localhost:5050/Assignments/${courseId}`,
          {
            headers: {
              'student-email': studentEmail
            }
          }
        );

        const materialsResponse = await axios.get(
          `http://localhost:5050/CourseMaterials/${courseId}`,
          {
            headers: {
              'student-email': studentEmail
            }
          }
        );

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

  const handleDownload = (materialId) => {
    const studentEmail = localStorage.getItem('studentEmail');
    if (!studentEmail) {
      setError('Please log in to download materials');
      return;
    }
    
    const downloadUrl = `http://localhost:5050/download-material/${materialId}`;
    
    axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'blob',
      headers: {
        'student-email': studentEmail
      }
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'course_material.pdf'); 
      document.body.appendChild(link);
      link.click();
    }).catch((error) => {
      console.error('Error downloading file:', error);
      setError('Failed to download the file');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Course Content</h1>

      {/* Classes Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Scheduled Classes</h2>
        {classes.length === 0 ? (
          <p className="text-gray-600 text-center">No classes scheduled yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.Schedule_ID} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-xl text-gray-800">
                      Class on {new Date(classItem.Class_Date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Time: {new Date(classItem.Class_Date).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {classItem.Duration_Minutes} mins
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{classItem.Description}</p>
                {classItem.Meeting_Link && (
                  <a
                    href={classItem.Meeting_Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-600 text-center">No assignments posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.Assignment_ID} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-xl text-gray-800">{assignment.Title}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    {assignment.Max_Score} points
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{assignment.Description}</p>
                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-gray-600">
                    Due: {new Date(assignment.Due_Date).toLocaleString()}
                  </div>
                  {assignment.File_Path && (
                    <a
                      href={`http://localhost:5050/download-assignment/${assignment.Assignment_ID}`}
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Assignment
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Materials Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Course Materials</h2>
        {materials.length === 0 ? (
          <p className="text-gray-600 text-center">No materials uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map((material) => (
              <div key={material.Material_ID} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-xl text-gray-800 mb-4">{material.File_Name}</h3>
                <p className="text-gray-600 mb-4">Uploaded on: {new Date(material.Upload_Date).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-6">{material.Description}</p>
                <button
                  onClick={() => handleDownload(material.Material_ID)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
