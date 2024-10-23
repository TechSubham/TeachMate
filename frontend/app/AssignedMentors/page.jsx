"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Award, DollarSign, Briefcase, Github, Linkedin, X, Video, Loader2 } from 'lucide-react';
import axios from 'axios';

const StudentAssignedMentors = () => {
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [scheduledSessions, setScheduledSessions] = useState([]);

  useEffect(() => {
    const fetchAssignedMentors = async () => {
      const studentEmail = localStorage.getItem('userEmail');
      if (!studentEmail) {
        setError('Please log in to view your assigned mentors.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5050/StudentAssignedMentors/${studentEmail}`);
        setAssignedMentors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assigned mentors:', error);
        setError('Failed to fetch assigned mentors. Please try again later.');
        setLoading(false);
      }
    };

    fetchAssignedMentors();
  }, []);

  const handleSessionClick = async (mentor) => {
    setSelectedMentor(mentor);
    try {
      const studentEmail = localStorage.getItem('userEmail');
      const response = await axios.get(
        `http://localhost:5050/scheduledSessions/${mentor.email}/${studentEmail}`
      );
      setScheduledSessions(response.data);
      setShowSessionPopup(true);
    } catch (error) {
      console.error('Error fetching scheduled sessions:', error);
      alert('Failed to fetch session details. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 font-medium">Loading your mentors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-lg">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Assigned Mentors
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Connect with experienced professionals who are here to guide you
        </p>

        {assignedMentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Award className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">You don't have any assigned mentors yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignedMentors.map((mentor) => (
              <div
                key={mentor.email}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{mentor.full_name}</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      <Award className="h-4 w-4 mr-1" />
                      Expert
                    </span>
                  </div>

                  <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-4">
                    {mentor.expertise}
                  </div>

                  <p className="text-gray-600 mb-6">{mentor.bio}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span>{mentor.experience_years} Years Experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span>{mentor.rate} USD/hour</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Assigned: {new Date(mentor.assignment_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-6">
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 mr-1" />
                      LinkedIn
                    </a>
                    <a
                      href={mentor.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Github className="h-5 w-5 mr-1" />
                      GitHub
                    </a>
                  </div>

                  <button
                    onClick={() => handleSessionClick(mentor)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    View Sessions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSessionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Scheduled Sessions</h2>
                    <p className="text-gray-600">with {selectedMentor.full_name}</p>
                  </div>
                  <button
                    onClick={() => setShowSessionPopup(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {scheduledSessions.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledSessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-blue-500" />
                              <span className="font-semibold text-gray-800">
                                {new Date(session.meeting_date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Scheduled on: {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No sessions scheduled yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignedMentors;