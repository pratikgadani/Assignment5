/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Pratik Gadani ID: 115220220 Date: July-22-2023
*  Online Cyclic Link: 
*
********************************************************************************/
const path = require('path');
const collegeData = require('./modules/collegeData');
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');



const HTTP_PORT = process.env.PORT || 8080;


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + '/public'));
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
  next();
});
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
  navLink: function (url, options) {
      return (
          '<li' +
          ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
          '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'
      );
  },
  // Handlebars helper for equality check
  equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
}, }));
app.set('view engine', 'hbs');




// Initialize collegeData module
collegeData.initialize()
  .then(() => {
    // Routes
    app.get('/students', (req, res) => {
      const { course } = req.query;
      if (course) {
        collegeData.getStudentsByCourse(course)
          .then((students) => {
            res.render("students", {students: students});
          })
          .catch((err) => {
            console.log(err)
            res.render("students", { message: 'no results' });
          });
      } else {
        collegeData.getAllStudents()
          .then((students) => {
            res.render("students", {students: students});
          })
          .catch(() => {
            res.render("students", { message: 'no results' });
          });
      }
    });


    app.get('/tas', (req, res) => {
      collegeData.getTAs()
        .then((tas) => {
          res.json(tas);
        })
        .catch(() => {
          res.status(404).json({ message: 'no results' });
        });
    });

    app.get("/courses", function(req, res) {
      collegeData.getCourses()
        .then(function(data) {
          res.render("courses", { courses: data });
        })
        .catch(function(err) {
          res.render("courses", { message: "no results" });
        });
    });
    

    app.get("/course/:id", (req, res) => {
      const courseId = parseInt(req.params.id);
      collegeData
          .getCourseById(courseId)
          .then((data) => {
              res.render("course", { course: data });
          })
          .catch((err) => {
              res.render("course", { message: err.message });
          });
  });
  
    app.get('/student/:num', (req, res) => {
      const { num } = req.params;
      collegeData.getStudentByNum(num)
        .then((student) => {
          res.render("student", { student: student });
        })
        .catch(() => {
          res.render("student", { message: "Student not found" });
        });
    });


  app.post("/student/update", (req, res) => {
    const updatedStudent = {
        studentNum: parseInt(req.body.studentNum),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        addressStreet: req.body.addressStreet,
        addressCity: req.body.addressCity,
        addressProvince: req.body.addressProvince,
        TA: req.body.TA === "on", // Convert checkbox value to boolean
        status: req.body.status,
        course: req.body.course,
    };

    collegeData
        .updateStudent(updatedStudent)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            console.error("Error updating student:", err.message);
            res.redirect("/students");
        });
});


    app.get('/', (req, res) => {
      res.render("home")
    });

    app.get('/about', (req, res) => {
      res.render("about")
    });

    app.get('/htmlDemo', (req, res) => {
      res.render("htmlDemo")
    });

    app.get('/students/add', (req, res) => {
      res.render("addStudent")
    });
    
    app.post('/students/add', (req, res) => {
      const studentData = req.body;
    
      // Call addStudent function from collegeData module
      collegeData.addStudent(studentData)
        .then(() => {
          res.redirect('/students');
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('An error occurred while adding the student.');
        });
    });
    

    // 404 route
    app.use((req, res) => {
      res.status(404).send('Page Not Found');
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log('Server listening on port:', HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });
