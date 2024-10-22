"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, GraduationCap, Briefcase, DollarSign, Mail } from "lucide-react";

const MentorHomepage = () => {
  const [mentorData, setMentorData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    if (role !== "Mentor") {
      router.push("/Login");
      return;
    }

    const fetchMentorProfile = async () => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `http://localhost:5050/Profile/Mentor/${encodedEmail}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mentor profile");
        }

        const data = await response.json();
        setMentorData(data);
      } catch (error) {
        setError("An error occurred while fetching mentor data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorProfile();
  }, [router]);

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
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
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
            Welcome back, {mentorData.FullName || "Mentor"}!
          </h1>
          <p className="text-blue-100">Your mentoring journey continues here</p>
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
                <p className="font-medium">{mentorData.FullName || ""}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{mentorData.Email || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Expertise and Experience Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <h2 className="text-2xl font-semibold">Expertise & Experience</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Expertise</p>
                <p className="font-medium">{mentorData.Expertise || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">
                  {mentorData.ExperienceYears || 0} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-medium">${mentorData.Rate || 0}/hr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Bio */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Briefcase className="h-8 w-8 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Bio</h2>
          </div>
          <p className="text-gray-700">{mentorData.Bio || "No bio available"}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/SettingMentorProfile")}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Setup Profile
          </button>
          <Link href="/MentorAssignedStudents">
            <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
              Assigned Students
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentorHomepage;
