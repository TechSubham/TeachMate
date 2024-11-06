"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ProfileSetup = () => {
  const [values, setValues] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_Number: "",
    DOB: "",
    Education_Level: "",
  });

  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5050/Profile/Student", values);
      setMessage(response.data.message);

      if (response.data.message.includes("Profile setup completed")) {
        setTimeout(() => {
          router.push("/Login");
        }, 2000);
      }

      setValues({
        First_Name: "",
        Last_Name: "",
        Email: "",
        Phone_Number: "",
        DOB: "",
        Education_Level: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Student Profile Setup</h2>
        <p className="text-gray-600 text-center mb-6">Fill in the form to complete your profile</p>

        {message && (
          <div
            className={`p-4 rounded-lg text-center ${
              message.includes("Profile setup completed") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="First_Name">First Name</label>
              <input
                type="text"
                name="First_Name"
                value={values.First_Name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Last_Name">Last Name</label>
              <input
                type="text"
                name="Last_Name"
                value={values.Last_Name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Email">Email Address</label>
            <input
              type="email"
              name="Email"
              value={values.Email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Phone_Number">Phone Number</label>
            <input
              type="tel"
              name="Phone_Number"
              value={values.Phone_Number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="DOB">Date of Birth</label>
            <input
              type="date"
              name="DOB"
              value={values.DOB}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="Education_Level">Education Level</label>
            <select
              name="Education_Level"
              value={values.Education_Level}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select your education level</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition transform hover:scale-105"
          >
            Complete Profile Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
