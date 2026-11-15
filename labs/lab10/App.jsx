/*
Purpose: Collect and display the data entered in the Week 10 lab form.
*/

import { useState } from "react"

const provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan"
]

function App() {
    const [submittedData, setSubmittedData] = useState(null)

    function handleSubmit(event) {
        event.preventDefault()
        setSubmittedData(Object.fromEntries(new FormData(event.currentTarget)))
    }

    return (
        <article className="data-entry">
            <form onSubmit={handleSubmit}>
                <h1>Data Entry Form</h1>

                <div className="form-row">
                    <label>
                        Email
                        <input name="email" type="email" placeholder="Enter email" required />
                    </label>
                    <label>
                        Name
                        <input name="fullName" placeholder="Full Name" required />
                    </label>
                </div>

                <label>
                    Address
                    <input name="address" placeholder="1234 Main St" required />
                </label>

                <label>
                    Address 2
                    <input name="address2" placeholder="Apartment, studio, or floor" />
                </label>

                <div className="form-row">
                    <label>
                        City
                        <input name="city" required />
                    </label>
                    <div>
                        <label htmlFor="province">Province</label>
                        <select id="province" name="province" defaultValue="" required>
                            <option value="" disabled>Choose...</option>
                            {provinces.map(province => (
                                <option key={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                    <label>
                        Postal Code
                        <input name="postalCode" required />
                    </label>
                </div>

                <label className="terms">
                    <input type="checkbox" required />
                    Agree Terms &amp; Condition?
                </label>

                <button type="submit">Submit</button>
            </form>

            {submittedData && (
                <dl className="submitted-data">
                    <dt>Email:</dt>
                    <dd>{submittedData.email}</dd>
                    <dt>Full Name:</dt>
                    <dd>{submittedData.fullName}</dd>
                    <dt>Address:</dt>
                    <dd>{[submittedData.address, submittedData.address2].filter(Boolean).join(", ")}</dd>
                    <dt>City:</dt>
                    <dd>{submittedData.city}</dd>
                    <dt>Province:</dt>
                    <dd>{submittedData.province}</dd>
                    <dt>Postal Code:</dt>
                    <dd>{submittedData.postalCode}</dd>
                </dl>
            )}
        </article>
    )
}

export default App
