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

  const InputField = ({ label, name, type = "text", ...props }) => (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={values[name]}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Profile Setup</h2>
            <p className="text-gray-600">Please fill in your information below</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("Profile setup completed")
                  ? "bg-green-50 text-green-800"
                  : "bg-green-50 text-green-800"
              } mb-6`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="First_Name"
                placeholder="Enter your first name"
                required
              />
              <InputField
                label="Last Name"
                name="Last_Name"
                placeholder="Enter your last name"
                required
              />
            </div>

            <InputField
              label="Email Address"
              name="Email"
              type="email"
              placeholder="you@example.com"
              required
            />

            <InputField
              label="Phone Number"
              name="Phone_Number"
              type="tel"
              placeholder=" "
              required
            />

            <InputField
              label="Date of Birth"
              name="DOB"
              type="date"
              required
            />

            <div className="mb-6">
              <label htmlFor="Education_Level" className="block text-sm font-medium text-gray-700 mb-2">
                Education Level
              </label>
              <select
                name="Education_Level"
                id="Education_Level"
                value={values.Education_Level}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
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
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
            >
              Complete Profile Setup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}