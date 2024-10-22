"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
  const [values, setValues] = useState({
    FullName: "",
    Email: "",
    Expertise: "",
    Bio: "",
    ExperienceYears: "",
    Education_Level: "",
    Rate: "",
  });

  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5050/Profile/Mentor",
        values
      );
      setMessage(response.data.message);

      if (response.data.message.includes("Profile setup completed")) {
        setTimeout(() => {
          router.push("/Login");
        }, 2000);
      }

      setValues({
        FullName: "",
        Email: "",
        Expertise: "",
        Bio: "",
        ExperienceYears: "",
        Rate: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Mentor Profile Setup
        </h2>
        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes("Profile setup completed")
                ? "text-green-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="FullName" className="block font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="FullName"
              value={values.FullName}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Email" className="block font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="Email"
              value={values.Email}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Expertise" className="block font-semibold mb-1">
              Expertise
            </label>
            <input
              type="text"
              name="Expertise"
              value={values.Expertise}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Bio" className="block font-semibold mb-1">
              Bio
            </label>
            <input
              type="text"
              name="Bio"
              value={values.Bio}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="ExperienceYears"
              className="block font-semibold mb-1"
            >
              ExperienceYears
            </label>
            <input
              type="del"
              name="ExperienceYears"
              value={values.ExperienceYears}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="Education_Level"
              className="block font-semibold mb-1"
            >
              Education Level
            </label>
            <select
              name="Education_Level"
              value={values.Education_Level}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="Rate" className="block font-semibold mb-1">
              Rate
            </label>
            <input
              type="del"
              name="Rate"
              value={values.Rate}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
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
