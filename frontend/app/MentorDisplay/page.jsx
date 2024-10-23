"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Linkedin, Github, Clock, DollarSign, Award } from 'lucide-react';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get('http://localhost:5050/MentorDisplay');
        setMentors(response.data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);
  
  const handleAssign = async (mentorEmail) => {
    const studentEmail = localStorage.getItem('userEmail');
    if (!studentEmail) {
      alert('Please log in to assign a mentor.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/AssignMentor', {
        student_email: studentEmail,
        mentor_email: mentorEmail,
      });

      if (response.status === 200) {
        setAssignmentStatus(prev => ({ ...prev, [mentorEmail]: 'Assigned' }));
        alert('Mentor assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      alert('Failed to assign mentor. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Meet our Expert Mentors
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with industry professionals who are passionate about helping you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <div
              key={mentor.email}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className=" h-3"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{mentor.full_name}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {mentor.expertise.split(',')[0]}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{mentor.experience_years} Years Experience</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>{mentor.rate} USD/hour</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <Award className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                    <p className="line-clamp-3">{mentor.bio}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>

                <button
                  onClick={() => handleAssign(mentor.email)}
                  disabled={assignmentStatus[mentor.email] === 'Assigned'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    assignmentStatus[mentor.email] === 'Assigned'
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95'
                  }`}
                >
                  {assignmentStatus[mentor.email] === 'Assigned' ? 'Mentor Assigned' : 'Connect with Mentor'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorsPage;