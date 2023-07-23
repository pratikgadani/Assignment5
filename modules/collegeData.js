const fs = require('fs');

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, studentDataFromFile) => {
      if (err) {
        reject('Unable to read students.json');
        return;
      }
      
      fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
        if (err) {
          reject('Unable to read courses.json');
          return;
        }
        
        const studentData = JSON.parse(studentDataFromFile);
        const courseData = JSON.parse(courseDataFromFile);
        
        dataCollection = new Data(studentData, courseData);
        resolve();
      });
    });
  });
}

function getTAs(){
  return new Promise((resolve,reject) => {
    const tas = dataCollection.students.filter(student => student.TA);
    if (tas.length === 0)
    {
      reject ('No Results returned');
      return;
    }
    resolve(tas);
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject('No results returned');
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject('No results returned');
    }
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      const students = dataCollection.students.filter(student => student.course == course);
      if (students.length > 0) {
        resolve(students);
      } else {
        reject('No results returned');
      }
    } else {
      reject('No results returned');
    }
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      const student = dataCollection.students.find(student => student.studentNum == num);
      if (student) {
        resolve(student);
      } else {
        reject('No results returned');
      }
    } else {
      reject('No results returned');
    }
  });
}

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (studentData.TA === undefined) {
      studentData.TA = false;
    } else {
      studentData.TA = true;
    }

    const studentNum = dataCollection.students.length + 1;
    studentData.studentNum = studentNum;

    dataCollection.students.push(studentData);
    resolve();
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
      const course = dataCollection.courses.find((course) => course.courseId === id);
      if (course) {
          resolve(course);
      } else {
          reject(new Error("query returned 0 results"));
      }
  });
}


function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
      const index = dataCollection.students.findIndex((student) => student.studentNum === studentData.studentNum);
      if (index !== -1) {
          // Update the student with the new data
          dataCollection.students[index] = {
              ...studentData,
              TA: studentData.TA === "on", // Convert checkbox value to boolean
          };
          resolve();
      } else {
          reject(new Error("Student not found"));
      }
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent,
  getCourseById,
  updateStudent
  
};
