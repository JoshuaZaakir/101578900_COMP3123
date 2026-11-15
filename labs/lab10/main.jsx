/*
Purpose:
App component (top level component for our application) injected
into the root of the HTML
*/
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"

// Notice this is similar to ReactDOM.render()
// TODO: Define the HTML page with a element with id="root"
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
)
