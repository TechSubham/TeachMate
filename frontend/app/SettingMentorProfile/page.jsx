"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "../../lib/utils";

export default function SetupProfile() {
  const [values, setValues] = useState({
    email: "",
    full_name: "",
    expertise: "",
    experience_years: "",
    rate: "",
    bio: "",
    linkedin: "",
    github: ""
  });

  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = localStorage.getItem("userEmail");
    const profileData = { email, ...values };

    try {
      const response = await axios.post(`${API_BASE_URL}/SettingMentorProfile`, profileData);
      setMessage(response.data.message);

      if (response.data.message.includes("Profile setup completed")) {
        setTimeout(() => {
          router.push("/MentorHomepage");
        }, 2000);
      }

      setValues({
        email: "",
        full_name: "",
        expertise: "",
        experience_years: "",
        rate: "",
        bio: "",
        linkedin: "",
        github: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white text-center">
              Setup Your Mentor Profile
            </h2>
            <p className="mt-2 text-blue-100 text-center">
              Fill in your details to get started as a mentor
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`px-8 py-4 ${
              message.includes("Profile setup completed")
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-green-50 text-green-700 border-l-4 border-green-500"
            }`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={values.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area of Expertise
                  </label>
                  <input
                    type="text"
                    name="expertise"
                    value={values.expertise}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={values.experience_years}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="rate"
                    value={values.rate}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={values.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Profiles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={values.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={values.github}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://github.com/your-profile"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5"
              >
                Complete Profile Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}