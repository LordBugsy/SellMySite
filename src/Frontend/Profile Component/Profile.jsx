import { useParams } from 'react-router-dom';
import { useState } from 'react';
import styles from './Profile.module.scss';

const Profile = () => {
    // React
    const username = useParams().username;
    const [testBoolean, updateTestBoolean] = useState(false);

    return (
        <div className={`${styles.profileContainer} fadeIn`}>
            <div className={styles.profileHeader}>
                <img className={styles.profileBanner} src={`/bannerPlaceholder.jpg`} alt={`${username}'s banner`} />
                
                <div className={styles.profileDetails}>
                    <img  className={styles.profileImage} src={`/0.png`} alt={`${username}'s profile`} />
                    <div className={styles.profileInfo}>
                        <div className={styles.actions}>
                            <i className={`fas fa-envelope ${styles.icon}`}></i>
                            { testBoolean ? <i onClick={() => updateTestBoolean(!testBoolean)} className={`fas fa-bell ${styles.icon}`}></i> : <i onClick={() => updateTestBoolean(!testBoolean)} className={`far fa-bell ${styles.icon}`}></i> }
                            <i className={`fa-solid fa-ellipsis ${styles.icon} ${styles.option}`}></i>
                            <button className={`button ${styles.follow}`}>Follow</button>
                        </div>

                        <div className={styles.profileUsername}>
                            <h1 className={styles.displayName}>{username}</h1>
                            <p className={styles.username}>@{username}</p>
                        </div>

                        <div className={styles.profileDescription}>
                            <p className={styles.description}>Some description about the user</p>
                        </div>

                        <div className={styles.profileMisc}>
                            <div className={styles.location}>
                                <i className={`fas fa-map-marker-alt ${styles.icon}`}></i>
                                <p className={styles.locationText}>Random Location</p>
                            </div>

                            <div className={styles.joined}>
                                <i className={`fas fa-calendar ${styles.icon}`}></i>
                                <p className={styles.joinedText}>Joined on some random date</p>
                            </div>
                        </div>

                        <div className={styles.profileStats}>
                            <div className={styles.stat}>
                                <p className={styles.statText}>Followers: </p>
                                <p className={styles.statNumber}>0</p>
                            </div>

                            <div className={styles.stat}>
                                <p className={styles.statText}>Following: </p>
                                <p className={styles.statNumber}>0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.profileContent}>

            </div>
        </div>
    );
}

export default Profile;