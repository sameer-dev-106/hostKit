import React from 'react';
import styles from '../style/statsOverview.module.scss';

const StatsOverview = ({ stats, loading }) => {
    const statCards = [
        {
            id: 'projects',
            label: 'Total Projects',
            value: stats.totalProjects,
            icon: '📦',
            type: 'primary',
            description: 'Active projects'
        },
        {
            id: 'deployments',
            label: 'Active Deployments',
            value: stats.activeDeployments,
            icon: '🚀',
            type: 'success',
            description: 'Running deployments'
        },
        {
            id: 'total',
            label: 'Total Deployments',
            value: stats.totalDeployments,
            icon: '📊',
            type: 'primary',
            description: 'All deployments'
        },
        {
            id: 'failed',
            label: 'Failed Deployments',
            value: stats.failedDeployments,
            icon: '⚠️',
            type: 'danger',
            description: 'Needs attention'
        },
    ];

    return (
        <div className={styles.statsContainer}>
            {statCards.map((stat) => (
                loading ? (
                    <div key={stat.id} className={styles.statCardSkeleton}>
                        <div className={styles.skeletonLine} />
                        <div className={`${styles.skeletonLine} ${styles.long}`} />
                        <div className={styles.skeletonLine} />
                    </div>
                ) : (
                    <div key={stat.id} className={`${styles.statCard} ${styles[stat.type]}`}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statIcon}>{stat.icon}</span>
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statDescription}>{stat.description}</div>
                    </div>
                )
            ))}
        </div>
    );
};

export default StatsOverview;
