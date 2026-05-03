import React from 'react';
import styles from '../style/deploymentStatus.module.scss';

const DeploymentStatus = ({
    deployment,
    onViewLogs,
    onStop,
    onRollback,
    loading
}) => {
    const getStatusClass = () => {
        return deployment.status?.toLowerCase() || 'pending';
    };

    const getStatusDotClass = () => {
        const status = deployment.status?.toLowerCase() || 'pending';
        return styles[status] || '';
    };

    const getDeploymentProgress = () => {
        const statusProgress = {
            'pending': 10,
            'building': 50,
            'deploying': 75,
            'running': 100,
            'failed': 0,
            'stopped': 100
        };
        return statusProgress[deployment.status?.toLowerCase()] || 0;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate) return 'N/A';
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const duration = Math.floor((end - start) / 1000);
        
        if (duration < 60) return `${duration}s`;
        if (duration < 3600) return `${Math.floor(duration / 60)}m`;
        return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
    };

    const shouldShowStop = deployment.status?.toLowerCase() === 'running' || 
                         deployment.status?.toLowerCase() === 'building' ||
                         deployment.status?.toLowerCase() === 'deploying';

    const shouldShowRollback = deployment.status?.toLowerCase() === 'failed';

    return (
        <div className={styles.deploymentItem}>
            <div className={styles.deploymentHeader}>
                <div className={styles.deploymentId}>
                    ID: {deployment._id}
                </div>
                <span className={`${styles.statusIndicator} ${styles[getStatusClass()]}`}>
                    <span className={`${styles.statusDot} ${getStatusDotClass()}`} />
                    {deployment.status}
                </span>
            </div>

            {getDeploymentProgress() > 0 && deployment.status?.toLowerCase() !== 'failed' && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressLabel}>
                        <span>Deployment Progress</span>
                        <span className={styles.progressPercent}>{getDeploymentProgress()}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ '--progress': `${getDeploymentProgress()}%` }}
                        />
                    </div>
                </div>
            )}

            <div className={styles.deploymentMeta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Created</span>
                    <span className={styles.metaValue}>
                        {formatDate(deployment.createdAt)}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Duration</span>
                    <span className={styles.metaValue}>
                        {calculateDuration(deployment.createdAt, deployment.completedAt)}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Version</span>
                    <span className={styles.metaValue}>
                        {deployment.version || 'N/A'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Region</span>
                    <span className={styles.metaValue}>
                        {deployment.region || 'default'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Branch</span>
                    <span className={styles.metaValue}>
                        {deployment.branch || 'main'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Commit</span>
                    <span className={styles.metaValue} title={deployment.commitHash}>
                        {deployment.commitHash?.substring(0, 7) || 'N/A'}
                    </span>
                </div>
            </div>

            {deployment.errorMessage && (
                <div style={{
                    background: 'rgba(239, 83, 80, 0.1)',
                    border: '1px solid #ef5350',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: '#ffcdd2',
                    fontSize: '0.85rem'
                }}>
                    <strong>Error:</strong> {deployment.errorMessage}
                </div>
            )}

            <div className={styles.deploymentActions}>
                <button
                    className={styles.viewLogsBtn}
                    onClick={() => onViewLogs(deployment._id)}
                    disabled={loading}
                    title="View deployment logs"
                >
                    📋 Logs
                </button>

                {shouldShowStop && (
                    <button
                        className={styles.stopBtn}
                        onClick={() => onStop(deployment._id)}
                        disabled={loading}
                        title="Stop this deployment"
                    >
                        ⏹️ Stop
                    </button>
                )}

                {shouldShowRollback && (
                    <button
                        className={styles.rollbackBtn}
                        onClick={() => onRollback(deployment.projectId)}
                        disabled={loading}
                        title="Rollback to previous version"
                    >
                        ↩️ Rollback
                    </button>
                )}
            </div>
        </div>
    );
};

export default DeploymentStatus;
