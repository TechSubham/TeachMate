"use client";
import React from 'react';
import Button from "./Components/Button/page";
import Photo from "../Public/jskvj.jpg";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Globe } from 'lucide-react';

const Page = () => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: "Interactive Learning",
      description: "Engage with dynamic content and real-time exercises"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Community Driven",
      description: "Learn together with peers from around the world"
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Global Access",
      description: "Access courses anytime, anywhere on any device"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center pt-20 lg:pt-32">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-blue-600 font-extrabold text-4xl lg:text-6xl leading-tight animate-fade-in">
                Discover the power 
                <span className="block">of knowledge</span>
              </h2>
              <p className="text-gray-700 text-lg max-w-xl">
                Transform the way you learn through our engaging virtual classroom, 
                offering interactive lessons and immersive educational experiences.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/Signup">
                <Button/>
              
              </Link>
             
            </div>

            <div className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md 
                    transition-shadow duration-200">
                    <div className="mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={Photo} 
                alt="Learning Platform Preview"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            
            {/* Stats overlay */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
              bg-white rounded-xl shadow-lg p-4 flex space-x-8">
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">10k+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">95%</div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;