import React, { useState } from 'react';
import styles from '../style/projectCard.module.scss';

const ProjectCard = ({
    project,
    onView,
    onDeploy,
    onDelete,
    onRollback,
    loading
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getProjectStatus = () => {
        if (project.latestDeployment?.status === 'running') return 'active';
        if (project.latestDeployment?.status === 'failed') return 'failed';
        return 'inactive';
    };

    const getStatusText = () => {
        const status = getProjectStatus();
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(project._id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className={`${styles.projectCard} ${styles[getProjectStatus()]}`}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{project.name}</h3>
                <span className={styles.statusBadge}>{getStatusText()}</span>
            </div>

            <p className={styles.cardDescription}>
                {project.description || 'No description provided'}
            </p>

            <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Repository</span>
                    <span className={styles.metaValue} title={project.repositoryUrl}>
                        {project.repositoryUrl?.split('/').pop() || 'N/A'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Environment</span>
                    <span className={styles.metaValue}>
                        {project.environment || 'production'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Last Deploy</span>
                    <span className={styles.metaValue}>
                        {project.latestDeployment?.createdAt
                            ? new Date(project.latestDeployment.createdAt).toLocaleDateString()
                            : 'Never'
                        }
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Deployments</span>
                    <span className={styles.metaValue}>
                        {project.deploymentCount || 0}
                    </span>
                </div>
            </div>

            <div className={styles.cardActions}>
                <button
                    className={styles.viewBtn}
                    onClick={() => onView(project._id)}
                    disabled={loading}
                    title="View project details"
                >
                    👁️ View
                </button>

                <button
                    className={styles.deployBtn}
                    onClick={() => onDeploy(project._id)}
                    disabled={loading || getProjectStatus() === 'active'}
                    title={getProjectStatus() === 'active' ? 'Deployment already running' : 'Deploy project'}
                >
                    🚀 Deploy
                </button>

                {getProjectStatus() === 'active' && (
                    <button
                        className={styles.rollbackBtn}
                        onClick={() => onRollback(project._id)}
                        disabled={loading || !project.latestDeployment}
                        title="Rollback to previous version"
                    >
                        ↩️ Rollback
                    </button>
                )}

                <button
                    className={styles.deleteBtn}
                    onClick={handleDeleteClick}
                    disabled={loading}
                    title="Delete project"
                >
                    🗑️ Delete
                </button>
            </div>

            {showDeleteConfirm && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(239, 83, 80, 0.1)',
                    border: '1px solid #ef5350',
                    borderRadius: '6px',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <span style={{ flex: 1, color: '#ffcdd2' }}>
                        Are you sure you want to delete "{project.name}"?
                    </span>
                    <button
                        onClick={confirmDelete}
                        disabled={loading}
                        style={{
                            background: '#ef5350',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                        style={{
                            background: 'rgba(107, 122, 219, 0.2)',
                            color: '#6b7adb',
                            border: '1px solid #6b7adb',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;
