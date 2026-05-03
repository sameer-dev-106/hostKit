import React, { useState } from 'react';
import styles from '../style/dashboardLayout.module.scss';

const DashboardLayout = ({
    onCreateProject,
    onSearch,
    children
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch?.(value);
    };

    const handleCreateClick = () => {
        onCreateProject?.();
    };

    const currentHour = new Date().getHours();
    const getGreeting = () => {
        if (currentHour < 12) return '🌅 Good Morning';
        if (currentHour < 18) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    return (
        <div className={styles.layoutContainer}>
            <div className={styles.layoutContent}>
                {/* Breadcrumb Navigation */}
                <div className={styles.breadcrumbNav}>
                    <span className={`${styles.breadcrumbItem} ${styles.active}`}>Dashboard</span>
                </div>

                {/* Welcome Header */}
                <div className={styles.welcomeHeader}>
                    <h1 className={styles.greeting}>
                        <span className={styles.icon}>{getGreeting().split(' ')[0]}</span>
                        {getGreeting().split(' ').slice(1).join(' ')}
                    </h1>
                    <p className={styles.subtitle}>
                        Manage your projects and deployments from here
                    </p>
                </div>

                {/* Quick Actions Bar */}
                <div className={styles.quickActionsBar}>
                    <div className={styles.leftActions}>
                        <div className={styles.searchBox}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <div className={styles.rightActions}>
                        <button
                            className={styles.createBtn}
                            onClick={handleCreateClick}
                        >
                            <span>➕</span>
                            New Project
                        </button>
                    </div>
                </div>

                <div className={styles.separator} />

                {/* Main Content */}
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
