const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const DB_URI = process.env.DB_URI;
const connectDb = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

connectDb();

const studentSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true },
  prn: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },

});

const StudentTEA = mongoose.model('TEA', studentSchema);
const StudentTEB = mongoose.model('TEB', studentSchema);
const StudentTEC = mongoose.model('TEC', studentSchema);

const getStudentModel = (section) => {
  switch (section) {
    case 'A': return StudentTEA;
    case 'B': return StudentTEB;
    case 'C': return StudentTEC;
    default: throw new Error('Invalid section');
  }
};


const validateStudentData = (data) => {
  const { prn, password, mobile, branch, year, section } = data;
  if (!prn || !password || !mobile || !branch || !year || !section) {
    return 'All fields are required.';
  }
  if (!/^\d{16}$/.test(prn)) {
    return 'PRN must be exactly 16 digits long.';
  }
  return null;
};

app.post('/add-student', async (req, res) => {
  const validationError = validateStudentData(req.body);
  if (validationError) {
    return res.status(400).send(validationError);
  }

  const { prn, password, mobile, branch, year, section } = req.body;

  try {
    const Student = getStudentModel(section);

    const lastStudent = await Student.findOne().sort({ serialNumber: -1 }).limit(1);
    const newSerialNumber = lastStudent ? lastStudent.serialNumber + 1 : 1;

    console.log('New Serial Number:', newSerialNumber);

    const newStudent = new Student({
      prn,
      password,
      mobile,
      branch,
      year,
      section,
      serialNumber: newSerialNumber
    });

    await newStudent.save();
    res.status(200).send('Student added');
  } catch (error) {
    console.error('Error adding student:', error.message);
    res.status(500).send('Error adding student');
  }
});

app.post('/login', async (req, res) => {
  const { prn, password } = req.body;

  try {
    for (const section of ['A', 'B', 'C']) {
      const Student = getStudentModel(section);
      const student = await Student.findOne({ prn, password });
      if (student) {
        return res.json({ success: true });
      }
    }

    res.json({ success: false });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

app.delete('/remove-student/:prn', async (req, res) => {
  const { prn } = req.params;
  const { section } = req.body;

  console.log('Received section:', section);

  try {
    const Student = getStudentModel(section);
    const result = await Student.deleteOne({ prn });

    if (result.deletedCount === 0) {
      return res.status(404).send('Student not found');
    }

    res.status(200).send('Student removed');
  } catch (error) {
    console.error('Error removing student:', error.message);
    res.status(500).send('Error removing student');
  }
});

app.get('/students', async (req, res) => {
  const { branch, year, section } = req.query;

  try {
    const Student = getStudentModel(section);
    const students = await Student.find({ branch, year, section }).select('prn password mobile branch year section serialNumber');
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).send('Error fetching students');
  }
});

app.get('/prns', async (req, res) => {
  const { section } = req.query;

  try {
    const Student = getStudentModel(section);
    const prns = await Student.find({}, 'prn');
    res.status(200).json(prns);
  } catch (error) {
    console.error('Error fetching PRNs:', error.message);
    res.status(500).send('Error fetching PRNs');
  }
});

app.listen(5002, () => {
  console.log('Server running on port 5002');
});




















































// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const connectDb = async () => {
//   try {
//     await mongoose.connect('mongodb+srv://anuragpatil01978:qZac6Xq3YuGlIXv3@cluster0.3o7pt.mongodb.net', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to the database");
//   } catch (error) {
//     console.error("Error connecting to the database:", error.message);
//   }
// };

// connectDb();

// const studentSchema = new mongoose.Schema({
//   serialNumber: { type: Number, required: true },
//   prn: { type: String, required: true },
//   password: { type: String, required: true },
//   mobile: { type: String, required: true },
//   branch: { type: String, required: true },
//   year: { type: String, required: true },
//   section: { type: String, required: true },
//   yearDrop: { type: Boolean, default: false }, // Indicates if the student should remain in the same class
// });

// const Student = mongoose.model('Student', studentSchema);

// // Schema for HOD and Teacher login
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['HOD', 'Teacher'], required: true },
// });

// const User = mongoose.model('User', userSchema);



// const teacherSchema = new mongoose.Schema({
//   teacherId: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   branch: { type: String, required: true },
//   section: { type: String, required: true },
// });

// const Teacher = mongoose.model('Teacher', teacherSchema);




// // API Routes
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ username, password });
//     if (!user) return res.status(401).send('Invalid credentials');
//     res.status(200).json({ role: user.role });
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).send('Error logging in');
//   }
// });

// app.post('/add-student', async (req, res) => {
//   const { prn, password, mobile, branch, year, section, yearDrop } = req.body;

//   try {
//     const lastStudent = await Student.findOne().sort({ serialNumber: -1 });
//     const newSerialNumber = lastStudent ? lastStudent.serialNumber + 1 : 1;

//     const newStudent = new Student({
//       serialNumber: newSerialNumber,
//       prn,
//       password,
//       mobile,
//       branch,
//       year,
//       section,
//       yearDrop,
//     });

//     await newStudent.save();
//     res.status(200).send('Student added successfully');
//   } catch (error) {
//     console.error('Error adding student:', error.message);
//     res.status(500).send('Error adding student');
//   }
// });

// app.post('/promote-students', async (req, res) => {
//   try {
//     const students = await Student.find();
//     for (const student of students) {
//       if (!student.yearDrop) {
//         if (student.year === 'SE') student.year = 'TE';
//         else if (student.year === 'TE') student.year = 'BE';
//         else if (student.year === 'BE') {
//           await Student.deleteOne({ _id: student._id });
//           continue; // Skip saving BE students
//         }
//       }
//       await student.save();
//     }
//     res.status(200).send('Students promoted successfully');
//   } catch (error) {
//     console.error('Error promoting students:', error.message);
//     res.status(500).send('Error promoting students');
//   }
// });

// app.get('/students', async (req, res) => {
//   const { branch, year, section } = req.query;

//   try {
//     const students = await Student.find({ branch, year, section });
//     res.status(200).json(students);
//   } catch (error) {
//     console.error('Error fetching students:', error.message);
//     res.status(500).send('Error fetching students');
//   }
// });


// // Add a teacher (HOD-only functionality)
// app.post('/add-teacher', async (req, res) => {
//   const { teacherId, password, branch, section } = req.body;

//   try {
//     const newTeacher = new Teacher({ teacherId, password, branch, section });
//     await newTeacher.save();
//     res.status(200).send('Teacher added successfully');
//   } catch (error) {
//     console.error('Error adding teacher:', error.message);
//     res.status(500).send('Error adding teacher');
//   }
// });

// // Fetch teachers (HOD functionality)
// app.get('/teachers', async (req, res) => {
//   try {
//     const teachers = await Teacher.find();
//     res.status(200).json(teachers);
//   } catch (error) {
//     console.error('Error fetching teachers:', error.message);
//     res.status(500).send('Error fetching teachers');
//   }
// });


// app.listen(5002, () => {
//   console.log('Server running on port 5002');
// });
