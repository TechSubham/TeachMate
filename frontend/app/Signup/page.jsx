"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "../../lib/utils";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import background from "../../Public/login_bg.jpg"; 

export default function SignUp() {
  const [values, setValues] = useState({
    Name: "",
    Email: "",
    Password: "",
    Role: "Student",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/Signup`, values);
      setMessage(response.data.message);
  
      if (response.data.message.includes("Successfully")) {
        localStorage.setItem('userRole', values.Role);
        localStorage.setItem('userEmail', values.Email);
        
        setTimeout(() => {
          if (values.Role === "Student") {
            router.push('/Profile/Student');
          } else if (values.Role === "Teacher") {
            router.push('/Profile/Teacher');
          } else if (values.Role === "Mentor") {
            router.push('/Profile/Mentor'); 
          }
        }, 2000);
      }
      
      setValues({ Name: "", Email: "", Password: "", Role: "Student" });
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="relative flex w-full max-w-4xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <motion.div
          className="w-full lg:w-1/2 p-8 flex flex-col justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="text-5xl text-blue-600">
              <FontAwesomeIcon icon={faUser} className="text-blue-500" />
            </div>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold text-center text-gray-800 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create an Account
          </motion.h2>
          {message && (
            <motion.div
              className={`mb-4 text-center ${message.includes("Successfully") ? "text-green-600" : "text-red-500"}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {message}
            </motion.div>
          )}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <label className="block text-gray-600 text-sm md:text-base mb-2" htmlFor="name">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="Name"
                  placeholder="Enter Name"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={values.Name}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm md:text-base mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="Email"
                  placeholder="Enter Email"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={values.Email}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm md:text-base mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="Password"
                  placeholder="Enter Password"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={values.Password}
                  onChange={handleChange}
                  required
                />
                <FontAwesomeIcon
                  icon={faLock}
                  className="w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm md:text-base mb-2">Role</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Role"
                    value="Student"
                    checked={values.Role === "Student"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Role"
                    value="Teacher"
                    checked={values.Role === "Teacher"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Teacher
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Role"
                    value="Mentor"
                    checked={values.Role === "Mentor"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Mentor
                </label>
              </div>
            </div>
            <motion.button
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
            >
              Create Account
            </motion.button>
          </motion.form>
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/Login" className="text-blue-600 hover:underline">
              Already have an account? Log in
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden lg:block w-1/2 relative"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={background}
            alt="Signup Background"
            layout="fill"
            objectFit="cover"
          />
        </motion.div>
      </div>
    </div>
  );
}