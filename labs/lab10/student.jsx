/*
Define Student as a class component and then later inject
this into App component by instantiating it inside
*/
import { Component } from "react";

export default class Student extends Component {
    // Can use the default constructor instead, but since
    // we want to initialize the constructor values custom,
    // we will define one
    constructor(props){
        // The first thing to always do in a child constructor is...
        super(props)
        this.showMessage = this.showMessage.bind(this)
        this.regularProperty = "regular property, this does not hook into react"

        // Define internal data variables for this class component
        this.state = {
            studentId: props.studentId,
            firstName: "Josh"
        }



    }

    // Helper methods
    // Regular syntax method - must bind the context of the
    // "this: keyword to it in the constructor
    showMessage(){
        alert("Welcome " + this.state.firstName)
    }


    // Arrow syntax methods - the binding is automatically done for you
    incrementEventHandler = () => {
        this.regularProperty = "Updated: " + this.regularProperty
        console.log(this.regularProperty)
        this.setState(state => ({
            studentId: Number(state.studentId) + 1
        }))
    }

    eventHandlerPrinter = (event) => {
        console.log(event)
        console.log(event.currentTarget.name + " : " + event.currentTarget.value)
    }

    readName = (event) => {
        this.setState({
            firstName: event.target.value
        })
    }

    // Required method for every Component
    render(){
        console.log("The Student class component is about to return")
        return (
            <section>
                <h2>Student Component</h2>
                <p>studentId: { this.state.studentId } </p>
                <p>State: {JSON.stringify(this.state)}</p>

                <input name="firstname" onChange={this.readName}/>
                <br/>
                <button name="buttonEvent" value="Event" onClick={this.eventHandlerPrinter}>
                    Show event
                </button>
                <button onClick={this.showMessage}>Click to show message</button>
            </section>
        )
    }
    // Use the old React lifecycle methods for practice
    componentDidMount(){
        console.log("Component just mounted")
    }

    shouldComponentUpdate(newProps, newState){
        console.log("Component will update to this new state " + JSON.stringify(newState))
        return true
    }
}
