import { NavLink, Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import About from "../pages/About"
import NotFound from "../pages/NotFound"
import UserList from "../users/UserList"

export default function App(){
    return (
        <section>
            <h1>Lab Exercise 9 - Week 11 - Axios for API connection</h1>
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/about?college=GBP">About</NavLink>
                <NavLink to="/users">Users</NavLink>
            </nav>
            <hr />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/users" element={<UserList />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </section>
    )
}
