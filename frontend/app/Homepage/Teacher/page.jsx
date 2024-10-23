'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Layout, Users, Book } from "lucide-react";

const TeacherHomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    {
      text: "Education is not preparation for life; education is life itself.",
      author: "John Dewey"
    },
    {
      text: "The art of teaching is the art of assisting discovery.",
      author: "Mark Van Doren"
    },
    {
      text: "Teaching is the greatest act of optimism.",
      author: "Colleen Wilcox"
    },
    {
      text: "Teachers plant seeds that grow forever.",
      author: "Robert John Meehan"
    }
  ];

  useEffect(() => {
    // Simulate loading for demo purposes
    const timer = setTimeout(() => setIsLoading(false), 1000);

    // Rotate quotes every 5 seconds
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const features = [
    {
      icon: <Layout className="h-6 w-6" />,
      title: "Course Management",
      description: "Create and manage your online courses",
      link: "/DeployCourses",
      color: "bg-blue-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student Overview",
      description: "Track student progress and engagement",
      link: "/Students",
      color: "bg-green-500"
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Learning Resources",
      description: "Access teaching materials and guides",
      link: "/Resources",
      color: "bg-purple-500"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "My Courses",
      description: "View and edit your active courses",
      link: "/TeacherCourses",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teacher Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your courses and empower student learning
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Link href={feature.link} key={index}>
              <div className="group hover:transform hover:scale-105 transition-all duration-200">
                <div className="bg-white rounded-xl shadow-lg p-6 h-full border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className={`${feature.color} text-white p-3 rounded-lg inline-block mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quotes Section (replacing Quick Actions) */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
          <div className="animate-fade-in transition-opacity duration-500">
            <p className="text-xl text-gray-800 italic mb-4">
              "{quotes[currentQuoteIndex].text}"
            </p>
            <p className="text-gray-600 font-medium">
              — {quotes[currentQuoteIndex].author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;