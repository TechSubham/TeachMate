"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 

export default function ProfileSetup() {
  const [values, setValues] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_Number: "",
    DOB: "",
    Education_Level: ""
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
        Education_Level: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Profile Setup</h2>
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
            <label htmlFor="First_Name" className="block font-semibold mb-1">First Name</label>
            <input
              type="text"
              name="First_Name"
              value={values.First_Name}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Last_Name" className="block font-semibold mb-1">Last Name</label>
            <input
              type="text"
              name="Last_Name"
              value={values.Last_Name}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Email" className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="Email"
              value={values.Email}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Phone_Number" className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="Phone_Number"
              value={values.Phone_Number}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="DOB" className="block font-semibold mb-1">Date of Birth</label>
            <input
              type="date"
              name="DOB"
              value={values.DOB}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="Education_Level" className="block font-semibold mb-1">Education Level</label>
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
