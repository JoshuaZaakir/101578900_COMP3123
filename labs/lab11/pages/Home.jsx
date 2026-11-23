import { Link } from "react-router-dom"

export default function Home(){
    return (
        <article>
            <h2>Home</h2>
            <Link to="/users">View all users</Link>
        </article>
    )
}
