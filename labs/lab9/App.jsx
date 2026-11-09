/*
this is going to be our first and top level component.
Written with functional component syntax and will be
injected into the top level of React Vite application
*/
import College from "./components/College";
import Student from "./components/Student";
import reactLogo from "./react.svg";

function App(){
    return (
        <section>
            <img className="react-logo" src={reactLogo} alt="React logo" />
            <h1>Welcome to Fullstack Development - I</h1>
            <h2>React JS Programming Week09 Lab exercise</h2>
            <Student studentId="101578900" firstName="Joshua" lastName="Zaakir" />
            <College name="George Brown College" city="Toronto" />
        </section>
    )
}

export default App
