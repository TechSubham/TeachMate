"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserCircle, Mail, Calendar, GraduationCap, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseStudentsPage({ params }) {
  const [students, setStudents] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const teacherEmail = localStorage.getItem('userEmail');
        if (!teacherEmail) {
          throw new Error('Teacher email not found');
        }

        const verifyResponse = await fetch(
          `http://localhost:5050/VerifyCourseOwnership/${params.id}/${encodeURIComponent(teacherEmail)}`
        );
        const verifyData = await verifyResponse.json();

        if (!verifyData.isOwner) {
          throw new Error("You don't have permission to view this course's details");
        }

        const [courseResponse, enrollmentsResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/courses/${params.id}`),
          fetch(`http://localhost:5050/Enrollments/${params.id}/students`)
        ]);

        if (!courseResponse.ok || !enrollmentsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const courseData = await courseResponse.json();
        const enrollmentsData = await enrollmentsResponse.json();

        setCourseDetails(courseData);
        setStudents(enrollmentsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="bg-gray-50">
          <h1 className="text-2xl font-bold">Course Details</h1>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{courseDetails?.Course_Title}</h2>
              <p className="text-gray-600 mb-4">{courseDetails?.Description}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Category:</strong> {courseDetails?.Category}</p>
              <p><strong>Duration:</strong> {courseDetails?.Duration_Hours} hours</p>
              <p><strong>Total Enrolled:</strong> {students.length} students</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-6">Enrolled Students</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            No students enrolled in this course yet.
          </p>
        ) : (
          students.map((student) => (
            <Card key={student.ID} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <UserCircle className="w-12 h-12 text-gray-400" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold">
                      {student.First_Name} {student.Last_Name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{student.Email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{student.Phone_Number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{student.Education_Level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Enrolled: {new Date(student.Enrollment_Date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}