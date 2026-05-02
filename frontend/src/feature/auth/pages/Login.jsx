import React from 'react'
import { useState } from 'react'
import styles from '../style/login.module.scss'
import { Link } from "react-router-dom";
import { useAuth } from '../Hooks/UseAuth';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const { handleLogin, loading ,authLoading } = useAuth()


    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()



    const handleSubmit = async (e) => {
        e.preventDefault()

        await handleLogin(email, password)


        navigate("/dashboard")


    }


    // google and github login function 
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/api/auth/google";
    };

    const handleGithubLogin = () => {
        window.location.href = "http://localhost:3000/api/auth/github";
    };


    return (
        <main>
            <div className={styles.formContainer}>
                <h1> welcome back </h1>

                <form onSubmit={handleSubmit}>
                    {/* email */}
                    <div className={styles.field}>
                        <label>Email</label>
                        <input type="email" placeholder='enter your email' required
                            onChange={(e) => { setEmail(e.target.value) }}
                        />
                    </div>

                    {/* pasword */}
                    <div className={styles.field}>
                        <label>Password</label>
                        <input type="password" placeholder='enter password' required minLength={6}
                            onChange={(e) => { setPassword(e.target.value) }}
                        />
                    </div>

                    <button type='submit'> {authLoading? "Logging in..." : "Login"}</button>

                    <p>or</p>

                    <button onClick={handleGoogleLogin} type='button' className={styles.googleButton}>
                        <span><i className="fa-brands fa-google"></i></span>
                        Continue with Google
                    </button>

                    <button onClick={handleGithubLogin} type='button' className={styles.githubButton}>
                        <span><i className="fa-brands fa-github"></i></span>
                        Continue with github

                    </button>
                </form>
            </div>
            <p>don't have an account <Link to="/register">register</Link></p>
        </main>
    )
}

export default Login