import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../Hooks/UseAuth'
import AuthLeft from '../components/common/AuthLeft'
import styles from '../style/register.module.scss'

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

const getStrength = (pwd) => {
  if (pwd.length === 0) return { level: 0, label: '', cls: '' }
  if (pwd.length < 4) return { level: 1, label: 'Weak', cls: 'weak' }
  if (pwd.length < 7) return { level: 2, label: 'Fair', cls: 'fair' }
  if (pwd.length < 10) return { level: 3, label: 'Good', cls: 'good' }
  return { level: 4, label: 'Strong', cls: 'strong' }
}

export default function Register() {
  const { handleRegister, loading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleRegister(username, email, password)
    alert('Check email for verification link')
    navigate('/login')
  }

  const handleGoogleRegister = () => {
    window.location.href = "/api/auth/google";
  }

  const handleGithubRegister = () => {
    window.location.href = '/api/auth/github'
  }

  const strength = getStrength(password)

  return (
    <div className={styles.authPage}>
      <AuthLeft />

      <div className={styles.rightPanel}>
        <div className={styles.mobileLogo}>
         <div className={styles.mobileLogo}>
  <img src="/hostkit-logo-text-white.png" alt="HostKit" style={{ height: '28px', width: 'auto' }} />
</div>
          
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.heading}>
            <h1>Create your account</h1>
            <p>Start deploying in minutes</p>
          </div>

          <div className={styles.oauthRow}>
            <button className={styles.googleBtn} onClick={handleGoogleRegister} type="button">
              <GoogleIcon /> Google
            </button>
            <button className={styles.githubBtn} onClick={handleGithubRegister} type="button">
              <GithubIcon /> GitHub
            </button>
          </div>

          <div className={styles.divider}>
            <span>or continue with email</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>

            <div className={styles.field}>
              <label>Username</label>
              <input
                type="text"
                placeholder="yourname"
                required
                minLength={3}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <>
                  <div className={styles.strengthBar}>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`${styles.bar} ${i <= strength.level ? styles[strength.cls] : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`${styles.strengthLabel} ${styles[strength.cls]}`}>
                    {strength.label}
                  </span>
                </>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><span className={styles.spinner} /> Creating account...</>
                : <>Start Creating <ArrowRight size={15} /></>
              }
            </button>

          </form>

          <p className={styles.footerLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className={styles.terms}>
            By signing up, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}