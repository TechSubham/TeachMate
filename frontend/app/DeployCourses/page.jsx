"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function DeployCourses() {
  const router = useRouter();
  const [values, setValues] = useState({
    Course_Title: "",
    Description: "",
    Category: "",
    Duration_Hours: "",
    Start_Date: "",
    End_Date: "",
    Teacher_Email: "" 
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const teacherEmail = localStorage.getItem('userEmail');
    if (!teacherEmail) {
      setError("Please log in to deploy courses");
      return;
    }
    setValues(prev => ({ ...prev, Teacher_Email: teacherEmail }));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Add validation for dates
    if (name === "End_Date" && values.Start_Date && new Date(value) < new Date(values.Start_Date)) {
      setError("End date cannot be earlier than start date");
      return;
    }
    
    if (name === "Start_Date" && values.End_Date && new Date(value) > new Date(values.End_Date)) {
      setError("Start date cannot be later than end date");
      return;
    }

    setError(""); // Clear error when input changes
    setValues({ ...values, [name]: value });
  };

  const validateForm = () => {
    if (!values.Teacher_Email) {
      setError("Please log in to deploy courses");
      return false;
    }

    if (new Date(values.End_Date) < new Date(values.Start_Date)) {
      setError("End date must be after start date");
      return false;
    }

    if (new Date(values.Start_Date) < new Date()) {
      setError("Start date cannot be in the past");
      return false;
    }

    if (values.Duration_Hours <= 0) {
      setError("Duration must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting form with values:", values);
      const response = await axios.post("http://localhost:5050/DeployCourses", values);
      console.log("Server response:", response);
      setMessage(response.data.message);

      setTimeout(() => {
        router.push('/TeacherCourses');
      }, 2000);

      setValues({
        Course_Title: "",
        Description: "",
        Category: "",
        Duration_Hours: "",
        Start_Date: "",
        End_Date: "",
        Teacher_Email: values.Teacher_Email 
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        setError(`Server error: ${error.response.data.error || "Unknown error"}`);
      } else if (error.request) {
        setError("No response received from the server. Please check your connection.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Programming",
    "Data Science",
    "Web Development",
    "Mobile Development",
    "Design",
    "Business",
    "Mathematics",
    "Science",
    "Language",
    "Other"
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Deploy New Course</h2>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="Course_Title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              id="Course_Title"
              name="Course_Title"
              value={values.Course_Title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="Description"
              name="Description"
              value={values.Description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              rows={4}
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="Category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="Category"
              name="Category"
              value={values.Category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="Duration_Hours" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Hours)
            </label>
            <input
              type="number"
              id="Duration_Hours"
              name="Duration_Hours"
              value={values.Duration_Hours}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
              max="1000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="Start_Date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="Start_Date"
                name="Start_Date"
                value={values.Start_Date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="End_Date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="End_Date"
                name="End_Date"
                value={values.End_Date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={values.Start_Date}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/TeacherCourses')}
              className="flex-1 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 ${
                isSubmitting ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'
              } text-white font-semibold rounded-md transition-colors`}
            >
              {isSubmitting ? 'Deploying...' : 'Deploy Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
