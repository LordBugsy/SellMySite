import styles from './Notifications.module.scss';
import { useSelector } from 'react-redux';

const Notifications = (props) => {
    // Redux
    const isNotificationShown = useSelector(state => state.notification.isNotificationShown);

    // React
    const formatDate = date => {
        const newDateFormat = new Date(date);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = newDateFormat.getDate();
        const daySuffix = 
            day % 10 === 1 && day !== 11 ? "st" : 
            day % 10 === 2 && day !== 12 ? "nd" : 
            day % 10 === 3 && day !== 13 ? "rd" : "th";
        return `${months[newDateFormat.getMonth()]} ${day}${daySuffix} ${newDateFormat.getFullYear()}`;
    }

    return (
        <>
            { isNotificationShown && 
            <div className={styles.notificationsContainer}>
                <div className={styles.notificationsHeader}>
                    <h1 className={styles.title}>Notifications</h1>
                    <i className={`fas fa-cog ${styles.icon}`}></i>
                </div>

                <div className={styles.notifications}>
                    {props.data.length === 0 ? (
                        <p className={styles.noNotifications}>No notifications to display</p>
                    ) : props.data.map((notification, index) => {
                        return (
                            <div key={index} className={styles.notification}>
                                <i className={`${styles.icon} fa-solid fa-award`} />
                                <p className={styles.message}>
                                    You hit <span className={styles.followerCount}>{notification.milestone}</span> followers on {formatDate(notification.date)}! Congratulations!
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
            }
        </>
    );
}

export default Notifications;