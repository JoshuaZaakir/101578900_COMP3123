import { Link } from "react-router-dom"

export default function NotFound(){
    return (
        <article>
            <h2>404- Page not found</h2>
            <Link to="/">Go Home</Link>
        </article>
    )
}
