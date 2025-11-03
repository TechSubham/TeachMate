"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../lib/utils";
import { useRouter } from 'next/navigation';

export default function MentorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const mentorEmail = localStorage.getItem('userEmail');
        
        if (!mentorEmail) {
          router.push('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/MentorStudents/${encodeURIComponent(mentorEmail)}`);
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [router]);

  const handleContactStudent = (student) => {
    setSelectedStudent(student);
    setShowPopup(true);
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    
    const mentorEmail = localStorage.getItem('userEmail');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/scheduleMeeting`, {
        mentorEmail,
        studentEmail: selectedStudent.Email,
        meetingDate,
        meetingLink
      });

      alert('Meeting scheduled successfully!');
      setShowPopup(false);
      setMeetingDate('');
      setMeetingLink('');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const handleRemoveStudent = async (student) => {
    if (window.confirm(`Are you sure you want to remove ${student.First_Name} ${student.Last_Name}?`)) {
      try {
        const mentorEmail = localStorage.getItem('userEmail');
        await axios.delete(`${API_BASE_URL}/mentor-assignments/${encodeURIComponent(student.Email)}/${encodeURIComponent(mentorEmail)}`);

        setStudents(students.filter((s) => s.Email !== student.Email));
        alert('Student removed successfully');
      } catch (error) {
        console.error('Error removing student:', error);
        alert('Failed to remove student. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Students</h1>
        
        {students.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <p className="text-gray-600">No students assigned yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div key={student.Email} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {student.First_Name} {student.Last_Name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    Assigned: {new Date(student.assignment_date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {student.Email}
                  </p>
                  {student.Phone_Number && (
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {student.Phone_Number}
                    </p>
                  )}
                  {student.Education_Level && (
                    <p className="text-gray -600">
                      <span className="font-medium">Education:</span> {student.Education_Level}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleContactStudent(student)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Contact Student
                  </button>
                  <button
                    onClick={() => handleRemoveStudent(student)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Remove Student
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Schedule Meeting</h2>
            <p className="mb-4">Student: {selectedStudent.First_Name} {selectedStudent.Last_Name}</p>
            <form onSubmit={handleScheduleMeeting}>
              <div className="mb-4">
                <label htmlFor="meetingDate" className="block mb-2">Meeting Date and Time:</label>
                <input
                  type="datetime-local"
                  id="meetingDate"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="meetingLink" className="block mb-2">Meeting Link:</label>
                <input
                  type="url"
                  id="meetingLink"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required
                  placeholder="https://example.com/meeting"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}