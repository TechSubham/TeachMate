"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CourseDetails({ params }) {
  const [course, setCourse] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]); 
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  const [newSchedule, setNewSchedule] = useState({
    class_date: "",
    duration_minutes: "",
    description: "",
    meeting_link: "",
  });

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    max_score: "",
  });

  const router = useRouter();
  const courseId = params.id;

  useEffect(() => {
    const initializeData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          router.push("/login");
          return;
        }

        setTeacherEmail(email);

        const verifyResponse = await fetch(
          `http://localhost:5050/VerifyCourseOwnership/${courseId}/${encodeURIComponent(
            email
          )}`
        );
        const verifyData = await verifyResponse.json();

        if (!verifyData.isOwner) {
          setError("You don't have permission to view this course");
          setLoading(false);
          return;
        }

        const [courseResponse, schedulesResponse, assignmentsResponse, enrolledStudentsResponse] =
          await Promise.all([
            fetch(
              `http://localhost:5050/TeacherCourses/${encodeURIComponent(
                email
              )}`
            ),
            fetch(`http://localhost:5050/ClassSchedules/${courseId}`),
            fetch(`http://localhost:5050/Assignments/${courseId}`),
            fetch(`http://localhost:5050/Enrollments/${courseId}/students`),

          ]);

        const courses = await courseResponse.json();
        const courseData = courses.find(
          (c) => c.Course_ID === parseInt(courseId)
        );

        if (!courseData) {
          setError("Course not found");
          setLoading(false);
          return;
        }

        const schedulesData = await schedulesResponse.json();
        const assignmentsData = await assignmentsResponse.json();
        const enrolledStudentsData = await enrolledStudentsResponse.json();


        setCourse(courseData);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        setEnrolledStudents(Array.isArray(enrolledStudentsData) ? enrolledStudentsData : []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [courseId, router]);


  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newSchedule.class_date || !newSchedule.duration_minutes) {
        setError("Please fill in all required fields");
        return;
      }

      const date = new Date(newSchedule.class_date);
      const formattedDate = date.toISOString().slice(0, 19).replace("T", " ");

      const requestBody = {
        Course_ID: parseInt(courseId),
        Class_Date: formattedDate,
        Duration_Minutes: parseInt(newSchedule.duration_minutes),
        Description: newSchedule.description || "",
        Meeting_Link: newSchedule.meeting_link || "",
      };

      const response = await fetch("http://localhost:5050/ScheduleClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule class");
      }

      const updatedSchedules = await fetch(
        `http://localhost:5050/ClassSchedules/${courseId}`
      );
      const schedulesData = await updatedSchedules.json();
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);

      setNewSchedule({
        class_date: "",
        duration_minutes: "",
        description: "",
        meeting_link: "",
      });

      alert("Class scheduled successfully!");
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "An error occurred while scheduling the class");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    try {
      if (!newMaterial.title || !newMaterial.description || !file) {
        setError("Please fill in all fields and upload a PDF file");
        return;
      }

      const formData = new FormData();
      formData.append("title", newMaterial.title);
      formData.append("description", newMaterial.description);
      formData.append("pdf", file);

      const response = await fetch(`http://localhost:5050/upload-assignment/${courseId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload course material");
      }

      setNewMaterial({
        title: "",
        description: "",
      });
      setFile(null);

      setError(null);
      alert("Course material uploaded successfully!");
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "An error occurred while uploading the course material");
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !newAssignment.title ||
        !newAssignment.description ||
        !newAssignment.due_date ||
        !newAssignment.max_score ||
        !file
      ) {
        setError("Please fill in all assignment fields and upload a PDF file");
        return;
      }

      if (parseInt(newAssignment.max_score) <= 0) {
        setError("Maximum score must be a positive number");
        return;
      }

      const dueDate = new Date(newAssignment.due_date);
      const formattedDueDate = dueDate.toISOString().slice(0, 19).replace("T", " ");

      const formData = new FormData();
      formData.append("title", newAssignment.title);
      formData.append("description", newAssignment.description);
      formData.append("dueDate", formattedDueDate);
      formData.append("maxScore", newAssignment.max_score);
      formData.append("pdf", file);

      const response = await fetch(`http://localhost:5050/upload-assignment/${courseId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }

      const updatedAssignments = await fetch(`http://localhost:5050/Assignments/${courseId}`);
      const assignmentsData = await updatedAssignments.json();
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

      setNewAssignment({
        title: "",
        description: "",
        due_date: "",
        max_score: "",
      });
      setFile(null);

      setError(null);
      alert("Assignment created successfully!");
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "An error occurred while creating the assignment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
          <p>The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{course.Course_Title}</h1>
        <p className="text-gray-600 mb-4">{course.Description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Category:</strong> {course.Category}
            </p>
            <p>
              <strong>Duration:</strong> {course.Duration_Hours} hours
            </p>
          </div>
          <div>
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(course.Start_Date).toLocaleDateString()}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {new Date(course.End_Date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
        {enrolledStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No students enrolled yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrolledStudents.map((student, index) => (
                  <tr key={student.ID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.First_Name} {student.Last_Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.Email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.Phone_Number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.Education_Level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(student.Enrollment_Date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Schedule Next Class</h2>
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Class Date and Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={newSchedule.class_date}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, class_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newSchedule.duration_minutes}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    duration_minutes: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={newSchedule.description}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={newSchedule.meeting_link}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, meeting_link: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Schedule Class
          </button>
        </form>
      </div>

      <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Create Assignment</h2>
    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={newAssignment.title}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, title: e.target.value })
          }
          placeholder="Enter assignment title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded"
          value={newAssignment.description}
          onChange={(e) =>
            setNewAssignment({
              ...newAssignment,
              description: e.target.value,
            })
          }
          placeholder="Enter assignment description"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={newAssignment.due_date}
            onChange={(e) =>
              setNewAssignment({
                ...newAssignment,
                due_date: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maximum Score</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={newAssignment.max_score}
            onChange={(e) =>
              setNewAssignment({
                ...newAssignment,
                max_score: e.target.value,
              })
            }
            min="1"
            placeholder="Enter maximum score"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Upload PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Assignment
      </button>
    </form>
  </div>

  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Upload Course Material</h2>
    <form onSubmit={handleMaterialUpload} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={newMaterial.title}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, title: e.target.value })
          }
          placeholder="Enter material title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded"
          value={newMaterial.description}
          onChange={(e) =>
            setNewMaterial({
              ...newMaterial,
              description: e.target.value,
            })
          }
          placeholder="Enter material description"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Upload PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload Material
      </button>
    </form>
  </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Scheduled Classes</h2>
        {schedules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No classes scheduled yet.
          </p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.Schedule_ID} className="border p-4 rounded">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(schedule.Class_Date).toLocaleString()}
                </p>
                <p>
                  <strong>Duration:</strong> {schedule.Duration_Minutes} minutes
                </p>
                <p>
                  <strong>Description:</strong> {schedule.Description}
                </p>
                {schedule.Meeting_Link && (
                  <a
                    href={schedule.Meeting_Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No assignments created yet.
          </p>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.Assignment_ID}
                className="border p-4 rounded"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {assignment.Title}
                </h3>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {new Date(assignment.Due_Date).toLocaleString()}
                </p>
                <p>
                  <strong>Max Score:</strong> {assignment.Max_Score}
                </p>
                <p className="mt-2">{assignment.Description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
