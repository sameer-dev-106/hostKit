import React from 'react'
import { useState } from 'react'
import styles from '../style/register.module.scss'
import { Link } from "react-router-dom";
import { useAuth } from '../Hooks/UseAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {

    const { loading, handleRegister , } = useAuth()

    // useStates 
    const [username, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()

        await handleRegister(username, email, password)

        alert("Check email for verification link");

        navigate("/login")

    }


    // google and github login function 
    const handleGoogleRegister = () => {
        window.location.href = "http://localhost:3000/api/auth/google";
    };

    const handleGithubRegister = () => {
        window.location.href = "http://localhost:3000/api/auth/github";
    };
    return (
        <main>
            <div className={styles.formContainer}>
                <h1> sing up </h1>

                <form onSubmit={handleSubmit}>
                    {/* username */}
                    <div className={styles.field}>
                        <label>Username</label>
                        <input type="text" placeholder='enter your name' required minLength={3}
                            onChange={(e) => {
                                setUserName(e.target.value)
                            }}
                        />

                    </div>

                    {/* email */}
                    <div className={styles.field}>
                        <label>Email</label>
                        <input type="email" placeholder='enter your email' required
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                        />
                    </div>

                    {/* pasword */}
                    <div className={styles.field}>
                        <label>Password</label>
                        <input type="password" placeholder='enter password' required minLength={6}
                            onChange={(e) => {
                                setPassword(e.target.value)
                            }}
                        />
                    </div>

                    <button type='submit'>  {loading ? "Creating account..." : "Register"}</button>

                    <p>or</p>

                    <button onClick={handleGoogleRegister} type='button' className={styles.googleButton}>
                        <span><i className="fa-brands fa-google"></i></span>
                        Continue with Google
                    </button>

                    <button onClick={handleGithubRegister} type='button' className={styles.githubButton}>
                        <span><i className="fa-brands fa-github"></i></span>
                        Continue with github

                    </button>
                </form>
            </div>
            <p>already have an account <Link to="/login">login</Link></p>
        </main>
    )
}

export default Register