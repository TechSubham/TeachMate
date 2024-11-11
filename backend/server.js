const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/assignments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "student-email"],
    credentials: true
  })

);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Virtual-teaching-platform",
  port: "3306",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database successfully");

  db.query(`
    CREATE TABLE IF NOT EXISTS CourseMaterials (
      Material_ID INT PRIMARY KEY AUTO_INCREMENT,  Course_ID INT NOT NULL,  File_Name VARCHAR(255) NOT NULL,  File_Path VARCHAR(255) NOT NULL,  Upload_Date DATETIME DEFAULT CURRENT_TIMESTAMP,  Description TEXT,  FOREIGN KEY (Course_ID) REFERENCES Courses(Course_ID)
    )
  `);
});

app.get('/CourseMaterials/:courseId', (req, res) => {
  const { courseId } = req.params;
  const sql = "SELECT * FROM CourseMaterials WHERE Course_ID = ? ORDER BY Upload_Date DESC";

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching course materials:", err);
      return res.status(500).json({ error: "An error occurred while fetching course materials" });
    }
    res.status(200).json(results);
  });
});

app.post('/upload-assignment/:courseId', upload.single('pdf'), (req, res) => {
  const courseId = req.params.courseId;
  const { title, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const sql = `
    INSERT INTO CourseMaterials (Course_ID, File_Name, File_Path, Upload_Date, Description)
    VALUES (?, ?, ?, NOW(), ?)
  `;

  const values = [
    courseId,  req.file.originalname,  req.file.path,  description
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error uploading course material:', err);
      return res.status(500).json({ error: 'Failed to save course material information' });
    }

    res.status(200).json({
      message: 'Course material uploaded successfully',
      materialId: result.insertId,
      fileName: req.file.originalname
    });
  });
});

app.get('/Assignments/:courseId', (req, res) => {
  const { courseId } = req.params;
  const sql = "SELECT * FROM Assignments WHERE Course_ID = ? ORDER BY Due_Date ASC";

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "An error occurred while fetching assignments" });
    }
    res.status(200).json(results);
  });
});

app.get('/download-assignment/:assignmentId', (req, res) => {
  const { assignmentId } = req.params;

  const sql = 'SELECT File_Path, File_Name FROM Assignments WHERE Assignment_ID = ?';

  db.query(sql, [assignmentId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const filePath = results[0].File_Path;
    const fileName = results[0].File_Name;

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({ error: 'Error downloading file' });
      }
    });
  });
});

app.post("/Login", (req, res) => {
  const { Email, Password } = req.body;

  const sql = "SELECT * FROM Login WHERE Email = ? AND Password = ?";
  db.query(sql, [Email, Password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "An error occurred" });
    }

    if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ message: "Login successful", role: user.Role, email: user.Email });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

app.post("/Signup", (req, res) => {
  const sql = "INSERT INTO Login(`Name`,`Email`,`Password`,`Role`) VALUES (?)";
  const values = [req.body.Name, req.body.Email, req.body.Password, req.body.Role];

  db.query(sql, [values], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred while registering" });
    } else {
      res.status(200).json({ message: "Registered Successfully!" });
    }
  });
});

app.post("/Profile/Student", (req, res) => {
  const {
    First_Name,  Last_Name,  Email,  Phone_Number,  DOB,  Education_Level
  } = req.body;

  if (!First_Name || !Last_Name || !Email || !Phone_Number || !DOB || !Education_Level) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO StudentProfile 
    (First_Name, Last_Name, Email, Phone_Number, DOB, Education_Level) 
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    First_Name = VALUES(First_Name),  Last_Name = VALUES(Last_Name),  Phone_Number = VALUES(Phone_Number),  DOB = VALUES(DOB),  Education_Level = VALUES(Education_Level)`;

  const values = [First_Name, Last_Name, Email, Phone_Number, DOB, Education_Level];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error inserting/updating data:", err);
      return res.status(500).json({ error: "An error occurred while setting up the profile" });
    }
    return res.status(200).json({
      message: "Profile setup completed successfully",
      data: { First_Name, Last_Name, Email, Phone_Number, DOB, Education_Level }
    });
  });
});
app.post("/ScheduleClass", async (req, res) => {
  const { Course_ID, Class_Date, Duration_Minutes, Description, Meeting_Link } = req.body;

  if (!Course_ID || !Class_Date || !Duration_Minutes) {
    console.log("Missing required fields:", { Course_ID, Class_Date, Duration_Minutes });
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  try {

    const [courseResults] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT Course_ID FROM Courses WHERE Course_ID = ?",
        [Course_ID],
        (err, results) => {
          if (err) reject(err);
          else resolve([results, null]);
        }
      );
    });

    if (!courseResults || courseResults.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const [insertResult] = await new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO ClassSchedules 
        (Course_ID, Class_Date, Duration_Minutes, Description, Meeting_Link) 
        VALUES (?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [Course_ID, Class_Date, Duration_Minutes, Description || '', Meeting_Link || ''],
        (err, result) => {
          if (err) reject(err);
          else resolve([result, null]);
        }
      );
    });

    res.status(200).json({
      message: "Class scheduled successfully",
      scheduleId: insertResult.insertId
    });

  } catch (err) {
    console.error("Error in ScheduleClass:", err);
    res.status(500).json({
      error: "Database error while scheduling class",
      details: err.message
    });
  }
});

const verifyEnrollment = async (req, res, next) => {
  const courseId = req.params.courseId;
  const studentEmail = req.headers['student-email'];

  if (!studentEmail) {
    return res.status(401).json({ error: "Student email not provided" });
  }

  const getStudentIdSql = "SELECT ID FROM StudentProfile WHERE Email = ?";

  db.query(getStudentIdSql, [studentEmail], (err, studentResults) => {
    if (err) {
      console.error("Error getting student ID:", err);
      return res.status(500).json({ error: "Error verifying student" });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentId = studentResults[0].ID;
    const checkEnrollmentSql = `
      SELECT e.Enrollment_ID 
      FROM Enrollments e
      WHERE e.Course_ID = ? AND e.Student_ID = ?
    `;

    db.query(checkEnrollmentSql, [courseId, studentId], (err, results) => {
      if (err) {
        console.error("Error verifying enrollment:", err);
        return res.status(500).json({ error: "Error verifying enrollment" });
      }

      if (results.length === 0) {
        return res.status(403).json({ error: "Student is not enrolled in this course" });
      }
      req.studentId = studentId;
      next();
    });
  });
};


app.get("/ClassSchedules/:courseId", verifyEnrollment, (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT * FROM ClassSchedules 
    WHERE Course_ID = ? 
    ORDER BY Class_Date ASC
  `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching class schedules:", err);
      return res.status(500).json({
        error: "Database error while fetching schedules",
        details: err.message
      });
    }
    res.status(200).json(results);
  });
});

app.put("/ClassSchedules/:scheduleId", (req, res) => {
  const { scheduleId } = req.params;
  const { Class_Date, Duration_Minutes, Description, Meeting_Link } = req.body;

  const sql = `
    UPDATE ClassSchedules 
    SET 
      Class_Date = ?,  Duration_Minutes = ?,  Description = ?,  Meeting_Link = ?
    WHERE Schedule_ID = ?
  `;

  db.query(
    sql,
    [Class_Date, Duration_Minutes, Description, Meeting_Link, scheduleId],
    (err, result) => {
      if (err) {
        console.error("Error updating class schedule:", err);
        return res.status(500).json({ error: "An error occurred while updating the class schedule" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Class schedule not found" });
      }

      res.status(200).json({ message: "Class schedule updated successfully" });
    }
  );
});

app.delete("/ClassSchedules/:scheduleId", (req, res) => {
  const { scheduleId } = req.params;

  const sql = "DELETE FROM ClassSchedules WHERE Schedule_ID = ?";

  db.query(sql, [scheduleId], (err, result) => {
    if (err) {
      console.error("Error deleting class schedule:", err);
      return res.status(500).json({ error: "An error occurred while deleting the class schedule" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Class schedule not found" });
    }

    res.status(200).json({ message: "Class schedule deleted successfully" });
  });
});

app.post("/CreateAssignment", (req, res) => {
  const { Course_ID, Title, Description, Due_Date, Max_Score } = req.body;

  const checkCourseQuery = "SELECT Course_ID FROM Courses WHERE Course_ID = ?";

  db.query(checkCourseQuery, [Course_ID], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking course:", checkErr);
      return res.status(500).json({ error: "An error occurred while verifying the course" });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const sql = `
      INSERT INTO Assignments 
      (Course_ID, Title, Description, Due_Date, Max_Score) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [Course_ID, Title, Description, Due_Date, Max_Score],
      (err, result) => {
        if (err) {
          console.error("Error creating assignment:", err);
          return res.status(500).json({ error: "An error occurred while creating the assignment" });
        }
        res.status(200).json({
          message: "Assignment created successfully",
          assignmentId: result.insertId
        });
      }
    );
  });
});

app.get("/Assignments/:courseId", verifyEnrollment, (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT * FROM Assignments 
    WHERE Course_ID = ? 
    ORDER BY Due_Date ASC
  `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "An error occurred while fetching assignments" });
    }
    res.status(200).json(results);
  });
});

app.get("/AssignmentSubmissions/:assignmentId", (req, res) => {
  const { assignmentId } = req.params;

  const sql = `
    SELECT 
      s.Submission_ID, s.Student_ID, s.Submission_Date,s.Submission_Content,s.Score,s.Feedback,sp.First_Name,sp.Last_Name,sp.Email
      FROM AssignmentSubmissions s
    JOIN StudentProfile sp ON s.Student_ID = sp.ID
    WHERE s.Assignment_ID = ?
    ORDER BY s.Submission_Date DESC
  `;

  db.query(sql, [assignmentId], (err, results) => {
    if (err) {
      console.error("Error fetching assignment submissions:", err);
      return res.status(500).json({
        error: "An error occurred while fetching assignment submissions"
      });
    }
    res.status(200).json(results);
  });
});



app.post("/SubmitAssignment", (req, res) => {
  const { Assignment_ID, Student_ID, Submission_Content } = req.body;
  const Submission_Date = new Date();

  const checkEnrollmentQuery = `
    SELECT e.Enrollment_ID 
    FROM Enrollments e
    JOIN Assignments a ON e.Course_ID = a.Course_ID
    WHERE a.Assignment_ID = ? AND e.Student_ID = ?
  `;

  db.query(checkEnrollmentQuery, [Assignment_ID, Student_ID], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking enrollment:", checkErr);
      return res.status(500).json({ error: "An error occurred while verifying enrollment" });
    }

    if (checkResults.length === 0) {
      return res.status(403).json({ error: "Student is not enrolled in this course" });
    }

    const checkAssignmentQuery = `
      SELECT * FROM Assignments 
      WHERE Assignment_ID = ? AND Due_Date > NOW()
    `;

    db.query(checkAssignmentQuery, [Assignment_ID], (assignErr, assignResults) => {
      if (assignErr) {
        console.error("Error checking assignment:", assignErr);
        return res.status(500).json({ error: "An error occurred while verifying assignment" });
      }

      if (assignResults.length === 0) {
        return res.status(400).json({ error: "Assignment not found or past due date" });
      }

      const sql = `
        INSERT INTO AssignmentSubmissions 
        (Assignment_ID, Student_ID, Submission_Date, Submission_Content) 
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        sql,
        [Assignment_ID, Student_ID, Submission_Date, Submission_Content],
        (err, result) => {
          if (err) {
            console.error("Error submitting assignment:", err);
            return res.status(500).json({ error: "An error occurred while submitting the assignment" });
          }

          res.status(200).json({
            message: "Assignment submitted successfully",
            submissionId: result.insertId
          });
        }
      );
    });
  });
});

app.put("/GradeAssignment/:submissionId", (req, res) => {
  const { submissionId } = req.params;
  const { Score, Feedback } = req.body;

  const sql = `
    UPDATE AssignmentSubmissions 
    SET Score = ?, Feedback = ?
    WHERE Submission_ID = ?
  `;

  db.query(sql, [Score, Feedback, submissionId], (err, result) => {
    if (err) {
      console.error("Error grading assignment:", err);
      return res.status(500).json({ error: "An error occurred while grading the assignment" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json({ message: "Assignment graded successfully" });
  });
});

app.get("/CourseProgress/:courseId/:studentId", (req, res) => {
  const { courseId, studentId } = req.params;

  const sql = `
    SELECT 
      a.Assignment_ID,a.Max_Score,s.Score
    FROM Assignments a
    LEFT JOIN AssignmentSubmissions s 
      ON a.Assignment_ID = s.Assignment_ID 
      AND s.Student_ID = ?
    WHERE a.Course_ID = ?
  `;

  db.query(sql, [studentId, courseId], (err, results) => {
    if (err) {
      console.error("Error fetching course progress:", err);
      return res.status(500).json({ error: "An error occurred while fetching course progress" });
    }

    const totalAssignments = results.length;
    const completedAssignments = results.filter(r => r.Score != null).length;
    const progressPercentage = totalAssignments > 0
      ? (completedAssignments / totalAssignments) * 100
      : 0;

    const scores = results.filter(r => r.Score != null).map(r => (r.Score / r.Max_Score) * 100);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b) / scores.length
      : 0;

    res.status(200).json({
      totalAssignments,completedAssignments,  progressPercentage,  averageScore
    });
  });
});

app.get("/Profile/:role/:email", (req, res) => {
  const { role, email } = req.params;
  const decodedEmail = decodeURIComponent(email);

  let tableName;
  if (role === 'Student') {
    tableName = 'StudentProfile';
  } else if (role === 'Teacher') {
    tableName = 'TeacherProfile';
  } else {
    tableName = 'MentorProfile';
  }

  const sql = `SELECT * FROM ${tableName} WHERE Email = ?`;

  db.query(sql, [decodedEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "An error occurred",
        details: err.message
      });
    }

    if (results.length > 0) {
      return res.status(200).json({
        exists: true,
        data: results[0]
      });
    } else {
      return res.status(404).json({
        exists: false,
        message: "Profile not found"
      });
    }
  });
});

app.get("/Profile/Student/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  console.log("Fetching student profile for email:", email);

  const sql = `
    SELECT First_Name,Last_Name,Email,Phone_Number,DOB,Education_Level 
    FROM StudentProfile 
    WHERE Email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "An error occurred while fetching profile",
        details: err.message
      });
    }

    if (results.length > 0) {
      const studentData = results[0];
      console.log("Found student profile:", studentData);
      res.status(200).json(studentData);
    } else {
      console.log("No student profile found for email:", email);
      res.status(404).json({
        error: "Student profile not found",
        email: email
      });
    }
  });
});

app.post("/Profile/Teacher", (req, res) => {
  const {
    Name,Email,Password,PhoneNumber,Gender,DateOfBirth,Address,SubjectsTaught,Qualification,YearsOfExperience,Bio,ProfilePicture
  } = req.body;

  if (!Name || !Email || !Password || !Gender || !Qualification) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
  INSERT INTO TeacherProfile 
  (Name, Email, Password, PhoneNumber, Gender, DateOfBirth, Address, 
     SubjectsTaught, Qualification, YearsOfExperience, Bio, ProfilePicture) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     `;

  const values = [
    Name,Email,Password,PhoneNumber,Gender,DateOfBirth,Address,SubjectsTaught,Qualification,YearsOfExperience,Bio,ProfilePicture
  ];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "An error occurred while setting up the profile" });
    }
    return res.status(200).json({ message: "Teacher profile setup completed successfully" });
  });
});


app.post("/Enrollments", (req, res) => {
  const { Student_Email, Course_ID } = req.body;
  const Enrollment_Date = new Date().toISOString().slice(0, 10);

  if (!Student_Email || !Course_ID) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const getStudentIdSql = "SELECT ID FROM StudentProfile WHERE Email = ?";
  db.query(getStudentIdSql, [Student_Email], (err, studentResults) => {
    if (err) {
      console.error("Database error while getting student ID:", err);
      return res.status(500).json({ error: "An error occurred while processing enrollment" });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const Student_ID = studentResults[0].ID;

    const checkEnrollmentSql = "SELECT * FROM Enrollments WHERE Student_ID = ? AND Course_ID = ?";
    db.query(checkEnrollmentSql, [Student_ID, Course_ID], (err, results) => {
      if (err) {
        console.error("Database error while checking enrollment:", err);
        return res.status(500).json({ error: "An error occurred while checking enrollment" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "Student is already enrolled in this course" });
      }
      const sql = "INSERT INTO Enrollments (Student_ID, Course_ID, Enrollment_Date) VALUES (?, ?, ?)";
      db.query(sql, [Student_ID, Course_ID, Enrollment_Date], (err, results) => {
        if (err) {
          console.error("Database error during enrollment:", err);
          return res.status(500).json({ error: "An error occurred while enrolling" });
        }
        return res.status(200).json({
          message: "Enrollment successful",
          enrollmentId: results.insertId
        });
      });
    });
  });
});

app.get("/Enrollments/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  const getStudentSql = `
    SELECT ID 
    FROM StudentProfile 
    WHERE Email = ?
  `;

  db.query(getStudentSql, [email], (err, studentResults) => {
    if (err) {
      console.error("Error finding student:", err);
      return res.status(500).json({ error: "Error retrieving student information" });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentId = studentResults[0].ID;

    const sql = `
      SELECT 
        e.Enrollment_ID, e.Course_ID,e.Enrollment_Date,e.Status,c.Course_Title,c.Description,c.Category,c.Duration_Hours,c.Start_Date,c.End_Date
      FROM Enrollments e
      INNER JOIN Courses c ON e.Course_ID = c.Course_ID
      WHERE e.Student_ID = ?
      ORDER BY e.Enrollment_Date DESC
    `;

    db.query(sql, [studentId], (err, results) => {
      if (err) {
        console.error("Error fetching enrolled courses:", err);
        return res.status(500).json({ error: "Error retrieving enrolled courses" });
      }

      const coursesWithStatus = results.map(course => ({
        ...course,
        progress: 0,
        status: course.Status || 'Enrolled'
      }));

      res.status(200).json(coursesWithStatus);
    });
  });
});

app.get("/Enrollments/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT 
      e.Enrollment_ID, e.Student_ID, e.Course_ID,e.Enrollment_Date, c.Course_Title
    FROM 
      Enrollments e
    JOIN 
      Courses c ON e.Course_ID = c.Course_ID
    WHERE
      e.Student_ID = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching enrollments with course titles:", err);
      return res.status(500).json({ error: "An error occurred while fetching enrollments" });
    }
    res.status(200).json(results);
  });
});

app.post("/DeployCourses", (req, res) => {
  const {
    Course_Title,Description,Category,Duration_Hours,Start_Date,End_Date,Teacher_Email
  } = req.body;

  if (!Course_Title || !Description || !Category || !Duration_Hours || !Start_Date || !End_Date || !Teacher_Email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO Courses (
      Course_Title,Description,Category,Duration_Hours,Start_Date,End_Date,Teacher_Email
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Course_Title,Description,Category,Duration_Hours,Start_Date,End_Date,Teacher_Email
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error deploying course:", err);
      return res.status(500).json({ error: "An error occurred while deploying the course" });
    }
    return res.status(200).json({
      message: "Course deployed successfully",
      courseId: result.insertId
    });
  });
});

app.get("/Profile/Teacher/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const sql = "SELECT * FROM TeacherProfile WHERE Email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "An error occurred" });
    }
    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ error: "Teacher not found" });
    }
  });
});

app.get("/Courses", (req, res) => {
  const sql = "SELECT * FROM Courses";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).json({ error: "An error occurred while fetching courses" });
    }
    res.status(200).json(results);
  });
});

app.put("/Enrollments/:enrollmentId/status", async (req, res) => {
  const { enrollmentId } = req.params;
  const { status } = req.body;

  const sql = `
  UPDATE Enrollments 
  SET Status = ?
  WHERE Enrollment_ID = ?
  `;

  try {
    db.query(sql, [status, enrollmentId], (err, result) => {
      if (err) {
        console.error("Error updating enrollment status:", err);
        return res.status(500).json({
          error: "An error occurred while updating enrollment status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Enrollment not found"
        });
      }

      res.status(200).json({
        message: "Enrollment status updated successfully"
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "An internal server error occurred"
    });
  }
});

app.get("/TeacherCourses/:email", (req, res) => {
  const teacherEmail = decodeURIComponent(req.params.email);

  const sql = `
  SELECT 
  c.*,
  COUNT(DISTINCT e.Enrollment_ID) as enrolled_students,
  GROUP_CONCAT(DISTINCT s.First_Name, ' ', s.Last_Name) as enrolled_student_names
  FROM Courses c 
  LEFT JOIN Enrollments e ON c.Course_ID = e.Course_ID 
    LEFT JOIN StudentProfile s ON e.Student_ID = s.ID
    WHERE c.Teacher_Email = ?
    GROUP BY c.Course_ID, c.Course_Title, c.Description, c.Category, 
    c.Duration_Hours, c.Start_Date, c.End_Date, c.Teacher_Email
    ORDER BY c.Start_Date DESC
    `;

  db.query(sql, [teacherEmail], (err, results) => {
    if (err) {
      console.error("Error fetching teacher courses:", err);
      return res.status(500).json({ error: "An error occurred while fetching courses" });
    }
    res.status(200).json(results);
  });
});

app.get("/VerifyCourseOwnership/:courseId/:teacherEmail", (req, res) => {
  const { courseId, teacherEmail } = req.params;

  const sql = "SELECT COUNT(*) as count FROM Courses WHERE Course_ID = ? AND Teacher_Email = ?";

  db.query(sql, [courseId, decodeURIComponent(teacherEmail)], (err, results) => {
    if (err) {
      console.error("Error verifying course ownership:", err);
      return res.status(500).json({ error: "An error occurred while verifying course ownership" });
    }

    res.status(200).json({
      isOwner: results[0].count > 0
    });
  });
});

app.get('/CourseMaterials/:courseId', verifyEnrollment, (req, res) => {
  const { courseId } = req.params;
  const sql = "SELECT * FROM CourseMaterials WHERE Course_ID = ? ORDER BY Upload_Date DESC";

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching course materials:", err);
      return res.status(500).json({ error: "An error occurred while fetching course materials" });
    }
    res.status(200).json(results);
  });
});

app.get('/download-material/:materialId', verifyEnrollment, (req, res) => {
  const { materialId } = req.params;

  const sql = 'SELECT File_Path, File_Name FROM CourseMaterials WHERE Material_ID = ?';

  db.query(sql, [materialId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const filePath = results[0].File_Path;
    const fileName = results[0].File_Name;

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({ error: 'Error downloading file' });
      }
    });
  });
});

app.get("/Enrollments/:courseId/students", (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT 
    s.*,
    e.Enrollment_Date
    FROM StudentProfile s
    JOIN Enrollments e ON s.ID = e.Student_ID
    WHERE e.Course_ID = ?
    ORDER BY e.Enrollment_Date DESC
    `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching enrolled students:", err);
      return res.status(500).json({ error: "An error occurred while fetching enrolled students" });
    }
    res.status(200).json(results);
  });
});

app.delete('/Enrollments/:courseId/:teacherEmail', (req, res) => {
  const { courseId, teacherEmail } = req.params;

  const sql = `
    DELETE c
    FROM Courses c
    WHERE c.Course_ID = ? AND c.Teacher_Email = ?
  `;

  db.query(sql, [courseId, decodeURIComponent(teacherEmail)], (err, result) => {
    if (err) {
      console.error('Error deleting course:', err);
      return res.status(500).json({ error: 'An error occurred while removing the course' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ message: 'Course removed successfully' });
  });
});

app.delete('/Enrollments/:courseId/:studentId', (req, res) => {
  const { courseId, studentId } = req.params;

  const sql = 'DELETE FROM Enrollments WHERE Course_ID = ? AND Student_ID = ?';

  db.query(sql, [courseId, studentId], (err, result) => {
    if (err) {
      console.error('Error deleting enrollment:', err);
      return res.status(500).json({ error: 'An error occurred while removing the student' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.status(200).json({ message: 'Student removed from the course successfully' });
  });
});



app.delete('/scheduledMeeting/:studentEmail/:mentorEmail', (req, res) => {
  const { studentEmail, mentorEmail } = req.params;

  const sql = 'DELETE FROM mentor_meetings WHERE student_email = ? AND mentor_email = ?';

  db.query(sql, [studentEmail, mentorEmail], (err, result) => {
    if (err) {
      console.error('Error deleting scheduled meeting:', err);
      return res.status(500).json({ error: 'An error occurred while removing the scheduled meeting' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Scheduled meeting not found' });
    }

    res.status(200).json({ message: 'Scheduled meeting removed successfully' });
  });
});

// Add this new endpoint to your backend code
app.delete('/mentor-assignments/:studentEmail/:mentorEmail', (req, res) => {
  const { studentEmail, mentorEmail } = req.params;
  
  const sql = 'DELETE FROM mentor_assignments WHERE student_email = ? AND mentor_email = ?';

  db.query(sql, [studentEmail, mentorEmail], (err, result) => {
    if (err) {
      console.error('Error removing mentor assignment:', err);
      return res.status(500).json({ 
        error: 'An error occurred while removing the mentor assignment',
        details: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Mentor assignment not found',
        studentEmail,
        mentorEmail 
      });
    }

    res.status(200).json({ 
      message: 'Mentor assignment removed successfully',
      studentEmail,
      mentorEmail
    });
  });
});

app.delete('/AssignMentor/:studentEmail/:mentorEmail', (req, res) => {
  const { studentEmail, mentorEmail } = req.params;

  const sql = 'DELETE FROM mentor_assignments WHERE student_email = ? AND mentor_email = ?';

  db.query(sql, [studentEmail, mentorEmail], (err, result) => {
    if (err) {
      console.error('Error removing mentor assignment:', err);
      return res.status(500).json({ error: 'An error occurred while removing the mentor assignment' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mentor assignment not found' });
    }

    res.status(200).json({ message: 'Mentor assignment removed successfully' });
  });
});

app.delete('/Courses/:courseId', (req, res) => {
  const { courseId } = req.params;

  const sql = 'DELETE FROM Courses WHERE Course_ID = ?';

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error('Error deleting course:', err);
      return res.status(500).json({ error: 'An error occurred while deleting the course', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete all enrollments associated with the course
    const deleteEnrollmentsSQL = 'DELETE FROM Enrollments WHERE Course_ID = ?';
    db.query(deleteEnrollmentsSQL, [courseId], (err, _) => {
      if (err) {
        console.error('Error deleting course enrollments:', err);
        return res.status(500).json({ error: 'An error occurred while deleting the course enrollments', details: err.message });
      }

      res.status(200).json({ message: 'Course deleted successfully' });
    });
  });
});

app.get("/MentorDisplay", (req, res) => {
  const sql = "SELECT * FROM mentors";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching mentors:", err);
      return res.status(500).json({ error: "An error occurred while fetching mentors" });
    }
    res.status(200).json(results);
  })
})
app.post("/Profile/Mentor", (req, res) => {
  const {
    FullName,Email,Expertise,Bio,ExperienceYears,Education_Level,Rate
  } = req.body;

  if (!FullName || !Email || !Expertise || !ExperienceYears || !Education_Level || !Rate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
  INSERT INTO MentorProfile 
  (FullName, Email, Expertise, Bio, ExperienceYears, Education_Level, Rate) 
     VALUES (?, ?, ?, ?, ?, ?, ?)
     `;

  const values = [
    FullName,
    Email,
    Expertise,
    Bio,
    ExperienceYears,
    Education_Level,
    Rate
  ];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "An error occurred while setting up the profile" });
    }
    return res.status(200).json({ message: "Mentor profile setup completed successfully" });
  });
});

app.post("/SettingMentorProfile", (req, res) => {
  const {
    email,full_name,expertise,experience_years,rate,bio,linkedin,github
  } = req.body;

  if (!email || !full_name || !expertise || !experience_years || !rate || !bio || !linkedin || !github) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO mentors
    (email, full_name, expertise, experience_years, rate, bio, linkedin, github)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    full_name = ?,expertise = ?,experience_years = ?,rate = ?,bio = ?,linkedin = ?,github = ?`;

  const values = [
    email, full_name, expertise, experience_years, rate, bio, linkedin, github, full_name, expertise, experience_years, rate, bio, linkedin, github
  ];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error inserting/updating data:", err);
      return res.status(500).json({ error: "An error occurred while setting up the profile: " + err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to set up or update the mentor profile" });
    }

    const isNewProfile = results.insertId > 0;
    return res.status(200).json({
      message: isNewProfile
        ? "Mentor profile setup completed successfully"
        : "Mentor profile updated successfully"
    });
  });
});

app.get("/Profile/Mentor/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  console.log("Fetching mentor profile for email:", email);

  const sql = `
    SELECT 
      FullName,Email,Expertise,Bio,ExperienceYears,Rate
    FROM MentorProfile 
    WHERE Email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "An error occurred while fetching profile",
        details: err.message
      });
    }

    if (results.length > 0) {
      const MentorData = results[0];
      console.log("Found Mentor profile:", MentorData);
      res.status(200).json(MentorData);
    } else {
      console.log("No Mentor profile found for email:", email);
      res.status(404).json({
        error: "Mentor profile not found",
        email: email
      });
    }
  });
});


app.post("/AssignMentor", (req, res) => {
  const { student_email, mentor_email } = req.body;

  if (!student_email || !mentor_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO mentor_assignments (student_email, mentor_email, assignment_date)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    mentor_email = ?,
    assignment_date = NOW()
  `;

  const values = [student_email, mentor_email, mentor_email];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error assigning mentor:", err);
      return res.status(500).json({ error: "An error occurred while assigning the mentor: " + err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to assign the mentor" });
    }

    return res.status(200).json({
      message: "Mentor assigned successfully"
    });
  });
});

app.get("/StudentAssignedMentors/:studentEmail", (req, res) => {
  const studentEmail = req.params.studentEmail;

  const sql = `
    SELECT m.*, ma.assignment_date
    FROM mentors m
    JOIN mentor_assignments ma ON m.email = ma.mentor_email
    WHERE ma.student_email = ?
  `;

  db.query(sql, [studentEmail], (err, results) => {
    if (err) {
      console.error("Error fetching assigned mentors:", err);
      return res.status(500).json({ error: "An error occurred while fetching assigned mentors" });
    }

    res.status(200).json(results);
  });
});

app.get("/MentorStudents/:mentorEmail", (req, res) => {
  const mentorEmail = decodeURIComponent(req.params.mentorEmail);

  const sql = `
    SELECT 
      sp.*,
      ma.assignment_date,
      l.Role as student_role
    FROM mentor_assignments ma
    JOIN StudentProfile sp ON ma.student_email = sp.Email
    JOIN Login l ON sp.Email = l.Email
    WHERE ma.mentor_email = ?
    ORDER BY ma.assignment_date DESC
  `;

  db.query(sql, [mentorEmail], (err, results) => {
    if (err) {
      console.error("Error fetching mentor's students:", err);
      return res.status(500).json({ error: "An error occurred while fetching students" });
    }
    res.status(200).json(results);
  });
});

// Backend API
app.delete("/Enrollments/:courseId/:studentId", async (req, res) => {
  const { courseId, studentId } = req.params;
  const { teacherEmail } = req.body;

  if (!teacherEmail) {
    return res.status(401).json({ error: "Teacher email is required" });
  }

  try {
    // First verify the teacher owns this course
    const [[course]] = await pool.query(
      "SELECT * FROM Courses WHERE Course_ID = ? AND Teacher_Email = ?",
      [courseId, teacherEmail]
    );

    if (!course) {
      return res.status(403).json({ error: "You don't have permission to modify this course" });
    }

    // Check if the student is enrolled
    const [[enrollment]] = await pool.query(
      "SELECT * FROM Enrollments WHERE Course_ID = ? AND Student_ID = ?",
      [courseId, studentId]
    );

    if (!enrollment) {
      return res.status(404).json({ error: "Student not found in the course" });
    }

    // Remove the enrollment
    await pool.query(
      "DELETE FROM Enrollments WHERE Course_ID = ? AND Student_ID = ?",
      [courseId, studentId]
    );

    res.json({ message: "Student removed from the course" });
  } catch (err) {
    console.error("Error removing student:", err);
    res.status(500).json({ error: "Failed to remove student" });
  }
});

// Add middleware for checking teacher email
const checkTeacherEmail = async (req, res, next) => {
  const teacherEmail = req.headers.teacheremail;
  
  if (!teacherEmail) {
    return res.status(401).json({ error: "Teacher email is required" });
  }

  // Add the teacher email to the request object
  req.teacherEmail = teacherEmail;
  next();
};


app.delete('/courses/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // Code to delete the course from the database
    await deleteCourseFromDB(courseId);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the course' });
  }
});

app.get('/Enrollments/:courseId/students', (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT 
      s.ID, s.First_Name, s.Last_Name, s.Email, s.Phone_Number, s.Education_Level, e.Enrollment_Date
    FROM StudentProfile s
    JOIN Enrollments e ON s.ID = e.Student_ID
    WHERE e.Course_ID = ?
    ORDER BY e.Enrollment_Date DESC
  `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching enrolled students:', err);
      return res.status(500).json({ error: 'An error occurred while fetching enrolled students' });
    }
    res.status(200).json(results);
  });
});

app.post("/ScheduleMentorClass", (req, res) => {
  const {
    mentor_email, student_email, class_date, duration_minutes, description, meeting_link,
  } = req.body;

  if (!mentor_email || !student_email || !class_date || !duration_minutes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const verifySQL = `
    SELECT * FROM mentor_assignments 
    WHERE mentor_email = ? AND student_email = ?
  `;

  db.query(verifySQL, [mentor_email, student_email], (verifyErr, verifyResults) => {
    if (verifyErr) {
      console.error("Error verifying mentor-student relationship:", verifyErr);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (verifyResults.length === 0) {
      return res.status(403).json({ error: "No mentor-student relationship found" });
    }
    const conflictSQL = `
      SELECT * FROM mentor_schedules 
      WHERE mentor_email = ? 
      AND class_date <= DATE_ADD(?, INTERVAL ? MINUTE)
      AND DATE_ADD(class_date, INTERVAL duration_minutes MINUTE) >= ?
    `;

    db.query(
      conflictSQL,
      [mentor_email, class_date, duration_minutes, class_date],
      (conflictErr, conflictResults) => {
        if (conflictErr) {
          console.error("Error checking schedule conflicts:", conflictErr);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (conflictResults.length > 0) {
          return res.status(409).json({ error: "Schedule conflict detected" });
        }
        const insertSQL = `
          INSERT INTO mentor_schedules 
          (mentor_email, student_email, class_date, duration_minutes, description, meeting_link)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [  mentor_email,  student_email,  class_date,  duration_minutes,  description || null,  meeting_link || null,
        ];

        db.query(insertSQL, values, (insertErr, insertResults) => {
          if (insertErr) {
            console.error("Error scheduling class:", insertErr);
            return res.status(500).json({
              error: "An error occurred while scheduling the class"
            });
          }
          return res.status(200).json({
            message: "Class scheduled successfully",
            schedule_id: insertResults.insertId,
          });
        });
      }
    );
  });
});
app.get("/MentorSchedules/:mentorEmail/:studentEmail", (req, res) => {
  const mentorEmail = decodeURIComponent(req.params.mentorEmail);
  const studentEmail = decodeURIComponent(req.params.studentEmail);

  const sql = `
    SELECT 
      Schedule_ID,  Class_Date,  Duration_Minutes,  Description,  Meeting_Link,  Created_At
    FROM mentor_schedules
    WHERE mentor_email = ? AND student_email = ?
    ORDER BY Class_Date ASC
  `;

  db.query(sql, [mentorEmail, studentEmail], (err, results) => {
    if (err) {
      console.error("Error fetching scheduled classes:", err);
      return res.status(500).json({
        error: "An error occurred while fetching scheduled classes"
      });
    }

    res.status(200).json(results);
  });
});

app.get("/MentorUpcomingClasses/:mentorEmail", (req, res) => {
  const mentorEmail = decodeURIComponent(req.params.mentorEmail);

  const sql = `
    SELECT 
      ms.*,  sp.First_Name,  sp.Last_Name,  sp.Email as student_email
    FROM mentor_schedules ms
    JOIN StudentProfile sp ON ms.student_email = sp.Email
    WHERE ms.mentor_email = ?
    AND ms.class_date >= NOW()
    ORDER BY ms.class_date ASC
  `;

  db.query(sql, [mentorEmail], (err, results) => {
    if (err) {
      console.error("Error fetching upcoming classes:", err);
      return res.status(500).json({
        error: "An error occurred while fetching upcoming classes"
      });
    }

    res.status(200).json(results);
  });
});

app.put("/UpdateScheduledClass/:scheduleId", (req, res) => {
  const scheduleId = req.params.scheduleId;
  const {
    class_date,  duration_minutes,  description,  meeting_link,
  } = req.body;

  const sql = `
    UPDATE mentor_schedules
    SET 
      class_date = ?,  duration_minutes = ?,  description = ?,  meeting_link = ?
    WHERE Schedule_ID = ?
  `;

  const values = [
    class_date, duration_minutes, description || null, meeting_link || null, scheduleId,
  ];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error updating scheduled class:", err);
      return res.status(500).json({
        error: "An error occurred while updating the scheduled class"
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        error: "Scheduled class not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      message: "Scheduled class updated successfully"
    });
  });
});

app.delete("/CancelScheduledClass/:scheduleId", (req, res) => {
  const scheduleId = req.params.scheduleId;
  const { mentor_email } = req.body;

  const sql = `
    DELETE FROM mentor_schedules 
    WHERE Schedule_ID = ? AND mentor_email = ?
  `;

  db.query(sql, [scheduleId, mentor_email], (err, results) => {
    if (err) {
      console.error("Error canceling scheduled class:", err);
      return res.status(500).json({
        error: "An error occurred while canceling the scheduled class"
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        error: "Scheduled class not found or you don't have permission to cancel it"
      });
    }

    res.status(200).json({
      message: "Scheduled class canceled successfully"
    });
  });
});

app.get("/StudentUpcomingClasses/:studentEmail", (req, res) => {
  const studentEmail = decodeURIComponent(req.params.studentEmail);

  const sql = `
    SELECT 
      ms.*,
      m.full_name as mentor_name,
      m.expertise as mentor_expertise
    FROM mentor_schedules ms
    JOIN mentors m ON ms.mentor_email = m.email
    WHERE ms.student_email = ?
    AND ms.class_date >= NOW()
    ORDER BY ms.class_date ASC
  `;

  db.query(sql, [studentEmail], (err, results) => {
    if (err) {
      console.error("Error fetching student's upcoming classes:", err);
      return res.status(500).json({
        error: "An error occurred while fetching upcoming classes"
      });
    }

    res.status(200).json(results);
  });
});

app.post('/scheduleMeeting', (req, res) => {
  const { mentorEmail, studentEmail, meetingDate, meetingLink } = req.body;

  if (!mentorEmail || !studentEmail || !meetingDate || !meetingLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO scheduled_meetings (mentor_email, student_email, meeting_date, meeting_link)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [mentorEmail, studentEmail, meetingDate, meetingLink], (err, result) => {
    if (err) {
      console.error('Error scheduling meeting:', err);
      return res.status(500).json({ error: 'An error occurred while scheduling the meeting' });
    }

    res.status(201).json({ message: 'Meeting scheduled successfully', id: result.insertId });
  });
});

app.get('/scheduledSessions/:mentorEmail/:studentEmail', async (req, res) => {
  try {
    const { mentorEmail, studentEmail } = req.params;

    const query = `
      SELECT 
        id, mentor_email, student_email, meeting_date, meeting_link, created_at
      FROM scheduled_meetings
      WHERE mentor_email = ? AND student_email = ?
      ORDER BY meeting_date ASC
    `;

    db.query(query, [mentorEmail, studentEmail], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching scheduled sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An unexpected error occurred" });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

async function deleteCourseFromDB(courseId) {
  const query = 'DELETE FROM Courses WHERE Course_ID = ?';
  await db.query(query, [courseId]);
}
