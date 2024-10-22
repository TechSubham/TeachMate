"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TeacherProfileForm() {
  const [values, setValues] = useState({
    Name: "",
    Email: "",
    Password: "",
    PhoneNumber: "",
    Gender: "Male", 
    DateOfBirth: "",
    Address: "",
    SubjectsTaught: "",
    Qualification: "",
    YearsOfExperience: "",
    Bio: "",
    ProfilePicture: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:5050/Profile/Teacher", values);
      setMessage(response.data.message);
      if (response.status === 200) {
        setValues({
          Name: "",
          Email: "",
          Password: "",
          PhoneNumber: "",
          Gender: "Male",
          DateOfBirth: "",
          Address: "",
          SubjectsTaught: "",
          Qualification: "",
          YearsOfExperience: "",
          Bio: "",
          ProfilePicture: "",
        });
        setTimeout(() => {
          router.push("/Profile/Teacher"); 
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred while setting up the profile");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Teacher Profile Setup</h2>

        {message && (
          <p className={`text-center mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              name="Name"
              value={values.Name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="Email"
              value={values.Email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              name="Password"
              value={values.Password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              name="PhoneNumber"
              value={values.PhoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Gender</label>
            <select
              name="Gender"
              value={values.Gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Date of Birth</label>
            <input
              type="date"
              name="DateOfBirth"
              value={values.DateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              name="Address"
              value={values.Address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your address"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Subjects Taught</label>
            <input
              type="text"
              name="SubjectsTaught"
              value={values.SubjectsTaught}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter the subjects you teach"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Qualification</label>
            <input
              type="text"
              name="Qualification"
              value={values.Qualification}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your highest qualification"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Years of Experience</label>
            <input
              type="number"
              name="YearsOfExperience"
              value={values.YearsOfExperience}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your years of experience"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Bio</label>
            <textarea
              name="Bio"
              value={values.Bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Write a short bio"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Profile Picture URL</label>
            <input
              type="text"
              name="ProfilePicture"
              value={values.ProfilePicture}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter the URL of your profile picture"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
}

