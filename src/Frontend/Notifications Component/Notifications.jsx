import styles from './Notifications.module.scss';
import { useSelector } from 'react-redux';

const Notifications = () => {
    // Redux
    const isNotificationShown = useSelector(state => state.notification.isNotificationShown);

    // React
    // we will have to limit notifications by 8
    const placeholderNotifications = [
        { profilePicture: Math.floor(Math.random() * 8), user: "JoeDoe", type: "Comment", target: "Website 1" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JaneDoe", type: "Like", target: "Website 2" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JohnDoe", type: "Comment", target: "Website 3" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JillDoe", type: "Like", target: "Website 4" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JackDoe", type: "Comment", target: "Website 5" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JimDoe", type: "Like", target: "Website 6" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JennyDoe", type: "Comment", target: "Website 7" },
        { profilePicture: Math.floor(Math.random() * 8), user: "JadeDoe", type: "Like", target: "Website 8" },
    ];
        

    return (
        <>
            { isNotificationShown && 
            <div className={styles.notificationsContainer}>
                <div className={styles.notificationsHeader}>
                    <h1 className={styles.title}>Notifications</h1>
                    <i className={`fas fa-cog ${styles.icon}`}></i>
                </div>

                <div className={styles.notifications}>
                    {/* placeholder for notifications */}
                    {placeholderNotifications.map((notification, index) => {
                        return (
                            <div key={index} className={styles.notification}>
                                <img src={`/${notification.profilePicture}.png`} className={styles.profilePicture} alt={`${notification.author}'s profile picture`} />
                                <p className={styles.message}>
                                    <span className={styles.username}>{notification.user}</span> {notification.type.toLowerCase()}d your <span className={styles.target}>{notification.target}</span>
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