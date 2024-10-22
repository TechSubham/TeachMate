"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
      const response = await axios.post("http://localhost:5050/SettingMentorProfile", profileData);
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
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Setup Your Profile</h2>
        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes("Profile setup completed") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="full_name" className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={values.full_name}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="expertise" className="block font-semibold mb-1">Expertise</label>
            <input
              type="text"
              name="expertise"
              value={values.expertise}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="experience_years" className="block font-semibold mb-1">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={values.experience_years}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="rate" className="block font-semibold mb-1">Hourly Price (₹)</label>
            <input
              type="number"
              name="rate"
              value={values.rate}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bio" className="block font-semibold mb-1">Bio</label>
            <textarea
              name="bio"
              value={values.bio}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder=" "
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="linkedin" className="block font-semibold mb-1">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={values.linkedin}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="github" className="block font-semibold mb-1">GitHub Profile</label>
            <input
              type="url"
              name="github"
              value={values.github}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="https://github.com/your-profile"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors"
          >
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
}
