import { useState, useEffect, useCallback, useRef } from 'react'
import styles from '../style/dashboard.module.scss'
import { useProjects } from '../hooks/useProjects'
import { useDeployments } from '../hooks/useDeployments'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../../auth/Hooks/UseAuth'

// ── Icons ──────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const ProjectsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const DeployIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
)
const CanvasIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="13" y2="15"/>
  </svg>
)
const NotesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const GearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const SupportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const DocsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

// ── Helpers ────────────────────────────────
const timeAgo = (date) => {
  if (!date) return 'Never'
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const getStatus = (p) => {
  const s = p.latestDeployment?.status?.toLowerCase()
  if (s === 'running') return 'active'
  if (s === 'building' || s === 'deploying') return 'building'
  if (s === 'failed') return 'failed'
  return 'inactive'
}

const STATUS_LABELS = { active: 'ACTIVE', building: 'BUILDING', failed: 'FAILED', inactive: 'INACTIVE' }
const PROJECT_ICONS = ['🔷', '🛒', '🗄️', '📊', '⚙️', '🌐', '🔬', '🧩', '🚀', '🔐']

// ── INSIGHT ICON TYPES ─────────────────────
const INSIGHT_TYPE_MAP = {
  warn: '⚠️',
  boost: '⚡',
  save: '💰',
  info: 'ℹ️',
  error: '🔴',
}

// ── ProjectCard ────────────────────────────
function ProjectCard({ project, onDeploy, onDelete, onView, loading }) {
  const [showDelete, setShowDelete] = useState(false)
  const status = getStatus(project)
  // Use project _id hash for consistent icon, fallback to index
  const iconIndex = project._id
    ? project._id.charCodeAt(project._id.length - 1) % PROJECT_ICONS.length
    : 0
  const icon = PROJECT_ICONS[iconIndex]

  return (
    <div className={`${styles.projectCard} ${styles[status]}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardTitleRow}>
          <h3>{project.name}</h3>
          <span className={styles.repoUrl}>
            {project.repositoryUrl || 'No repo linked'}
          </span>
        </div>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {status === 'building' && (
        <div className={styles.buildProgress}>
          <div className={styles.buildStep}>
            Step: {project.latestDeployment?.step || 'building...'}
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
        </div>
      )}

      {project.latestDeployment?.errorMessage && (
        <div className={styles.errorBlock}>
          {project.latestDeployment.errorMessage}
        </div>
      )}

      {(project.environment || project.region || project.traffic) && (
        <div className={styles.cardMeta}>
          {project.environment && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Environment</span>
              <span className={styles.metaValue}>{project.environment}</span>
            </div>
          )}
          {project.region && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Region</span>
              <span className={styles.metaValue}>{project.region}</span>
            </div>
          )}
          {project.traffic && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Traffic</span>
              <span className={styles.metaValue}>{project.traffic}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.cardActions}>
        <span style={{ fontSize: '11px', color: '#555', flex: 1 }}>
          Updated {timeAgo(project.latestDeployment?.createdAt)}
        </span>
        {status === 'failed' && (
          <button
            className={styles.retryBtn}
            onClick={() => onDeploy?.(project._id)}
            disabled={loading}
          >
            Retry
          </button>
        )}
        <button
          className={styles.logsBtn}
          onClick={() => onView?.(project._id)}
          disabled={loading}
        >
          View Logs →
        </button>
        <button
          className={styles.deleteCardBtn}
          onClick={() => setShowDelete(true)}
          disabled={loading}
          title="Delete project"
        >
          🗑️
        </button>
      </div>

      {showDelete && (
        <div className={styles.deleteConfirm}>
          <p>Delete "{project.name}"?</p>
          <div className={styles.confirmRow}>
            <button
              className={`${styles.confirmBtn} ${styles.yes}`}
              onClick={() => { onDelete?.(project._id); setShowDelete(false) }}
              disabled={loading}
            >
              Delete
            </button>
            <button
              className={`${styles.confirmBtn} ${styles.no}`}
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Create Project Modal ───────────────────
const REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
]

const ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
]

function CreateProjectModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    repositoryUrl: '',
    environment: 'production',
    region: 'us-east-1',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (!form.repositoryUrl.trim()) e.repositoryUrl = 'Repository URL is required'
    else if (!/^https?:\/\/.+/.test(form.repositoryUrl) && !form.repositoryUrl.startsWith('github.com')) {
      e.repositoryUrl = 'Enter a valid GitHub URL (e.g. https://github.com/user/repo)'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    await onSubmit(form)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <div className={styles.modalIcon}><GithubIcon /></div>
            <div>
              <h2>Create New Project</h2>
              <p>Connect your GitHub repo and deploy in seconds</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className={styles.formGroup}>
            <label>Project Name <span className={styles.required}>*</span></label>
            <input
              type="text"
              placeholder="e.g. nexus-core-api"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className={errors.name ? styles.inputError : ''}
              autoFocus
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* GitHub Repo URL */}
          <div className={styles.formGroup}>
            <label>GitHub Repository URL <span className={styles.required}>*</span></label>
            <div className={styles.inputWithIcon}>
              <span className={styles.inputIcon}><GithubIcon /></span>
              <input
                type="text"
                placeholder="https://github.com/your-org/your-repo"
                value={form.repositoryUrl}
                onChange={e => handleChange('repositoryUrl', e.target.value)}
                className={errors.repositoryUrl ? styles.inputError : ''}
              />
            </div>
            {errors.repositoryUrl && <span className={styles.errorMsg}>{errors.repositoryUrl}</span>}
            <span className={styles.fieldHint}>Make sure HostKit has access to this repository</span>
          </div>

          {/* Two-column: Environment + Region */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Environment</label>
              <select
                value={form.environment}
                onChange={e => handleChange('environment', e.target.value)}
              >
                {ENVIRONMENTS.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Deploy Region</label>
              <select
                value={form.region}
                onChange={e => handleChange('region', e.target.value)}
              >
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <><span className={styles.spinner} /> Creating...</>
              ) : (
                <><PlusIcon /> Create Project</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── User Avatar ────────────────────────────
function UserAvatar({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Initials fallback
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : '?'

  // OAuth provider badge
  const provider = user?.provider // 'google' | 'github' | 'local'

  return (
    <div className={styles.avatarWrap} ref={ref}>
      <button
        className={styles.avatarBtn}
        onClick={() => setOpen(prev => !prev)}
        title={user?.username || user?.email || 'Profile'}
      >
        {user?.picture || user?.avatar ? (
          <img
            src={user.picture || user.avatar}
            alt={user.username}
            className={styles.avatarImg}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatarInitials}>{initials}</div>
        )}
        {provider && provider !== 'local' && (
          <span className={`${styles.providerBadge} ${styles[provider]}`}>
            {provider === 'google' ? '𝐆' : provider === 'github' ? '⌥' : ''}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.profileDropdown}>
          <div className={styles.profileHeader}>
            {user?.picture || user?.avatar ? (
              <img
                src={user.picture || user.avatar}
                alt={user.username}
                className={styles.profileAvatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.profileAvatarFallback}>{initials}</div>
            )}
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.username || 'User'}</span>
              <span className={styles.profileEmail}>{user?.email || ''}</span>
              {provider && provider !== 'local' && (
                <span className={styles.profileProvider}>
                  via {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </span>
              )}
            </div>
          </div>
          <div className={styles.profileDivider} />
          <div className={styles.profileMenu}>
            <button className={styles.profileMenuItem}>⚙️ Account Settings</button>
            <button className={styles.profileMenuItem}>🔑 API Keys</button>
            <button className={styles.profileMenuItem}>📋 Billing</button>
          </div>
          <div className={styles.profileDivider} />
          <button
            className={`${styles.profileMenuItem} ${styles.logoutItem}`}
            onClick={() => { window.location.href = 'http://localhost:3000/api/auth/logout' }}
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

// ── Dashboard ──────────────────────────────
export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [activeNav, setActiveNav] = useState('projects')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const { user } = useAuth()
  const { projects, loading, error, fetchProjects, createProject, deleteProject } = useProjects()
  const { createDeployment } = useDeployments()
  const {  resourceUsage, insights, uniqueRegions } = useDashboard()

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.repositoryUrl?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateProject = useCallback(async (formData) => {
    setCreateLoading(true)
    try {
      await createProject(formData)
      setShowCreateModal(false)
    } catch (err) {
      // error is already set in context via useProjects
      console.error('Create project failed:', err)
    } finally {
      setCreateLoading(false)
    }
  }, [createProject])

  const handleDeploy = useCallback(async (projectId) => {
    try {
      await createDeployment(projectId)
      await fetchProjects() // refresh to get updated latestDeployment
    } catch (err) {
      console.error('Deploy failed:', err)
    }
  }, [createDeployment, fetchProjects])

  const handleDelete = useCallback(async (projectId) => {
    try {
      await deleteProject(projectId)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [deleteProject])

  const handleView = useCallback((projectId) => {
    // Navigate to project detail — wire up router as needed
    console.log('View project:', projectId)
  }, [])

  // Derived resource stats
  const bwUsed = resourceUsage?.bandwidth?.used ?? 0
  const bwTotal = resourceUsage?.bandwidth?.total ?? 10
  const bwPct = Math.min(100, Math.round((bwUsed / bwTotal) * 100))
  const bmUsed = resourceUsage?.buildMinutes?.used ?? 0
  const bmTotal = resourceUsage?.buildMinutes?.total ?? 2000
  const bmPct = Math.min(100, Math.round((bmUsed / bmTotal) * 100))
  const planName = resourceUsage?.plan?.name ?? '—'

  const regionCount = uniqueRegions.length || 0

  const NAV = [
    { id: 'projects', icon: <ProjectsIcon />, label: 'PROJECTS' },
    { id: 'deployments', icon: <DeployIcon />, label: 'DEPLOYMENTS' },
    { id: 'canvas', icon: <CanvasIcon />, label: 'CANVAS' },
    { id: 'notes', icon: <NotesIcon />, label: 'NOTES' },
    { id: 'settings', icon: <GearIcon />, label: 'SETTINGS' },
  ]

  return (
    <div className={styles.dashboardRoot}>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
          loading={createLoading}
        />
      )}

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src="/hostkit-logo-text-white.png" alt="HostKit" />
          <span className={styles.version}>V1.0.4</span>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.active : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button className={styles.navItemBottom}><SupportIcon /> SUPPORT</button>
          <button className={styles.navItemBottom}><DocsIcon /> DOCUMENTATION</button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.mainArea}>

        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.searchWrap}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn}><BellIcon /></button>
            <button className={styles.iconBtn}><SettingsIcon /></button>
            <UserAvatar user={user} />
          </div>
        </div>

        {/* Global error banner */}
        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}
            <button onClick={() => fetchProjects()}>Retry</button>
          </div>
        )}

        {/* Split content */}
        <div className={styles.contentSplit}>

          {/* Center panel */}
          <div className={styles.centerPanel}>
            <div className={styles.pageHeader}>
              <div>
                <h1>Active Projects</h1>
                <p>
                  Managing {projects.length} active deployment{projects.length !== 1 ? 's' : ''}{' '}
                  {regionCount > 0 && `across ${regionCount} region${regionCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                className={styles.createBtn}
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon /> Create New Project
              </button>
            </div>

            <div className={styles.projectsGrid}>
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeleton} style={{ height: '14px', width: '60%', marginBottom: '10px' }} />
                    <div className={styles.skeleton} style={{ height: '10px', width: '40%', marginBottom: '20px' }} />
                    <div className={styles.skeleton} style={{ height: '10px', width: '80%' }} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  {search ? (
                    <p>No projects match "{search}"</p>
                  ) : (
                    <>
                      <p>No projects yet. Create your first one!</p>
                      <button onClick={() => setShowCreateModal(true)}>
                        <PlusIcon /> Create New Project
                      </button>
                    </>
                  )}
                </div>
              ) : (
                filtered.map(p => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    loading={loading}
                    onDeploy={handleDeploy}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className={styles.rightPanel}>

            {/* AI Insights */}
            <div className={styles.insightsCard}>
              <div className={styles.insightsHeader}>
                <div className={styles.insightsTitle}>
                  <div className={styles.aiDot}>✦</div>
                  AI Insights
                </div>
              </div>
              <div className={styles.insightsList}>
                {insights.length === 0 ? (
                  <div className={styles.insightsEmpty}>
                    No insights yet — deploy a project to get started.
                  </div>
                ) : (
                  insights.map((ins, i) => (
                    <div key={ins._id || ins.id || i} className={styles.insightItem}>
                      <div className={`${styles.insightIcon} ${styles[ins.type]}`}>
                        {ins.icon || INSIGHT_TYPE_MAP[ins.type] || 'ℹ️'}
                      </div>
                      <div className={styles.insightContent}>
                        <h4>{ins.title}</h4>
                        <p>{ins.desc || ins.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className={styles.refreshBtn} onClick={() => fetchProjects()}>
                REFRESH INSIGHTS
              </button>
            </div>

            {/* Resource Usage */}
            <div className={styles.resourceCard}>
              <div className={styles.resourceTitle}>Resource Usage</div>

              <div className={styles.resourceItem}>
                <div className={styles.resourceLabel}>
                  <span>Monthly Bandwidth</span>
                  <span>{bwUsed} / {bwTotal} {resourceUsage?.bandwidth?.unit ?? 'TB'}</span>
                </div>
                <div className={styles.resourceTrack}>
                  <div className={styles.resourceFill} style={{ width: `${bwPct}%` }} />
                </div>
              </div>

              <div className={styles.resourceItem}>
                <div className={styles.resourceLabel}>
                  <span>Total Build Minutes</span>
                  <span>{bmUsed.toLocaleString()} / {bmTotal.toLocaleString()}</span>
                </div>
                <div className={styles.resourceTrack}>
                  <div className={styles.resourceFill} style={{ width: `${bmPct}%` }} />
                </div>
              </div>

              <div className={styles.planRow}>
                <div className={styles.planIcon}>💳</div>
                <div className={styles.planInfo}>
                  Current Plan
                  <strong>{planName}</strong>
                </div>
                <button className={styles.upgradeBtn}>Upgrade</button>
              </div>
            </div>

            {/* System Status */}
            <div className={styles.statusBar}>
              <div className={styles.statusDot} />
              <span className={styles.statusText}>All Systems Operational</span>
              <span className={styles.uptimeText}>99.99%</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}