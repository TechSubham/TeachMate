"use client"
import React, { useState, useEffect } from 'react';
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
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-4xl font-bold mb-8">Your Assigned Mentors</h1>
      {assignedMentors.length === 0 ? (
        <p className="text-center text-gray-500">You don't have any assigned mentors yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignedMentors.map((mentor) => (
            <div
              key={mentor.email}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">{mentor.full_name}</h2>
              <p className="text-gray-600 mb-4">{mentor.expertise}</p>
              <p className="text-sm mb-2 text-gray-500">Years of Experience: {mentor.experience_years}</p>
              <p className="text-sm mb-2 text-gray-500">Rate: {mentor.rate} USD/hour</p>
              <p className="text-sm mb-2 text-gray-500">Bio: {mentor.bio}</p>
              <div className="mt-4">
                <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="mr-2 text-blue-500 hover:text-blue-700">
                  LinkedIn
                </a>
                <a href={mentor.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                  GitHub
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">Assigned on: {new Date(mentor.assignment_date).toLocaleDateString()}</p>
              <button
                onClick={() => handleSessionClick(mentor)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Session
              </button>
            </div>
          ))}
        </div>
      )}

      {showSessionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Scheduled Sessions</h2>
            <p className="mb-4">Mentor: {selectedMentor.full_name}</p>
            {scheduledSessions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {scheduledSessions.map((session) => (
                  <div key={session.id} className="mb-4 p-4 bg-gray-100 rounded">
                    <p className="font-semibold">
                      Date: {new Date(session.meeting_date).toLocaleString()}
                    </p>
                    <p className="mt-2">
                      Meeting Link:{' '}
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Join Meeting
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Scheduled on: {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No sessions scheduled yet.</p>
            )}
            <button
              onClick={() => setShowSessionPopup(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignedMentors;