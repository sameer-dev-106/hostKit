import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true,
});


export async function registerApi(username, email, password) {
    try {
        const response = await API.post("/register", {
            username,
            email,
            password
        })
    
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Something went wrong";
    }

}

export async function loginApi(email, password) {
    try {
        const response = await API.post("/login", {
            email,
            password
        })
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Something went wrong";
    }
}

export async function getMeApi() {
    try {
        const response = await API.get("/me")
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Something went wrong";
    }
}
