import { useSearchParams } from "react-router-dom"

export default function About(){
    const [searchParams] = useSearchParams()
    console.log(searchParams)
    const college = searchParams.get("college")

    return (
        <article>
            <h2>About us</h2>
            <p>College: {college ?? "not provided"}</p>
        </article>
    )
}
