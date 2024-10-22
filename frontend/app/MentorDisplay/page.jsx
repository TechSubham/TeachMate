"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState({});

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get('http://localhost:5050/MentorDisplay');
        setMentors(response.data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
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

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-4xl font-bold mb-8">Meet our Mentors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mentors.map((mentor) => (
          <div
            key={mentor.email}
            className="bg-white shadow-lg rounded-lg p-6 transform hover:scale-105 transition-transform"
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
            <button
              onClick={() => handleAssign(mentor.email)}
              className={`mt-4 px-4 py-2 rounded ${
                assignmentStatus[mentor.email] === 'Assigned'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={assignmentStatus[mentor.email] === 'Assigned'}
            >
              {assignmentStatus[mentor.email] === 'Assigned' ? 'Assigned' : 'Assign Mentor'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorsPage;