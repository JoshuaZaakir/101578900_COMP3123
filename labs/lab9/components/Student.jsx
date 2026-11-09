/*
Student will be defined as a class component

We will not define a constructor for this example, rather, the
default constructor will be used. But you could definitely define a custom constructor instead - Optional Homework

*/

import { Component } from "react";

class Student extends Component {
  render() {
    const { studentId, firstName, lastName } = this.props;

    return (
      <>
        <h3>{studentId}</h3>
        <p className="student-name">{firstName} {lastName}</p>
      </>
    );
  }
}

export default Student;
