import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
});


export async function registerApi(username, email, password) {
    const response = await API.post("/auth/register", {
        username,
        email,
        password
    })

    return response.data

}

export async function loginApi(email, password) {
    const response = await API.post("/auth/login", {
        email,
        password
    })
    return response.data
}

export async function getMeApi() {
    const response = await API.get("/auth/me")
    return response.data
}
