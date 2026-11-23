import axios from "axios"

// The axios API connector connects to our external
// API called jsonplaceholder to get and update data on
// In other files, we will use api.get(), api.delete()
const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com"
})

export default api
