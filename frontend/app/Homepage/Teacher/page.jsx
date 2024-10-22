'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, BookOpen, GraduationCap } from "lucide-react";

const TeacherHomePage = () => {
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const teacherEmail = localStorage.getItem("userEmail");

      if (!teacherEmail) {
        setError("No teacher email found, please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5050/Profile/Teacher/${encodeURIComponent(teacherEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTeacherDetails({ 
          First_Name: data.First_Name || '',
          Last_Name: data.Last_Name || '',
          Email: teacherEmail 
        });
      } catch (error) {
        setError("Error fetching teacher details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
            <p className="mt-2">{error}</p>
          </div>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Return to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {teacherDetails.First_Name || 'Teacher'}!
          </h1>
          <p className="text-blue-100">
            Ready to empower your students with knowledge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <User className="h-8 w-8 text-blue-500" />
              <h2 className="text-2xl font-semibold">Personal Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {`${teacherDetails.First_Name || ''} ${teacherDetails.Last_Name || ''}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{teacherDetails.Email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Teaching Overview Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <h2 className="text-2xl font-semibold">Teaching Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Deployed Courses</p>
                <p className="text-2xl font-bold text-blue-600">3</p> {/* Placeholder value */}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-500 mb-2" />
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-bold text-green-600">25</p> {/* Placeholder value */}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/DeployCourses">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Deploy Courses
            </button>
          </Link>
          <Link href="/TeacherCourses">
            <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
              My Courses
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;
