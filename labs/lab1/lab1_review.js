/*
Purpose: Review JavaScript concepts
Prototypes vs. classes
Regular functions, anonymous functions, and arrow functions
Callback functions
MERN: M stands for MongoDB, E stands for Express, R stands for React, and N stands for Node.js.

*/

var globalVariable = 100;
let localVariable = 200;

function functionName(params) {
  let varInFunc = "local";
}

// console.log(varInFunc); // WILL FAIL

// Prototype - a one time use object from a prototype.
const oneTimeUseObj = {
  prop1: "Joshua",
  prop2: "Comp 3123",
  method1: function (param1) {
    console.log(param1);
  },
};

// const oneTimeUseObj = new Object()

console.log(oneTimeUseObj);
console.log(oneTimeUseObj.prop1);
console.log(oneTimeUseObj.prop2);
oneTimeUseObj.method1("pizza");

//Prototype - using a costructor
function Student(student_name_p, course_p, lunch_p) {
  this.student_name = student_name_p;
  this.course = course_p;
  this.lunch = lunch_p;
  this.method1 = function (param1) {
    return param1;
  };
}

const morning_student = new Student("Joshua", "comp2132", 4);
console.log(morning_student);
console.log(morning_student.student_name);
console.log(morning_student.course);
console.log(morning_student.lunch);
console.log(morning_student.method1);

//Classes - always have costructors
class Prof {
  constructor(prof_name_p) {
    this.prof_name = prof_name_p;
  }
  method1(lunch) {
    console.log(lunch);
  }
}

const morning_prof = new Prof("Laily");
console.log(morning_prof.prof_name);
morning_prof.method1("burger");

/*
    Optional Homework:  Practice a callback funciton using an array and
    the .map() method
*/