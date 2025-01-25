// Since the profile picture and the banner are "matching", changing the profile picture will also change the banner
import styles from './ProfilePicture.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { setEditProfilePictureShown, updateProfilePicture } from "../../../Redux/store";
import axios from 'axios';

const ProfilePicture = () => {
    // Redux
    const dispatch = useDispatch();
    const { localUserId, profilePicture } = useSelector(state => state.user.user);
    const { isEditProfilePictureShown } = useSelector(state => state.editProfilePicture);

    // React
    const [profilePictureID, updateProfilePictureID] = useState(Number(profilePicture));
    const [backendMessage, updateBackendMessage] = useState("");

    const containerRef = useRef();

    const changeProfilePicture = async () => {
        if (profilePictureID === Number(profilePicture)) {
            closeContainer();
            return;
        }
        updateBackendMessage("");
        
        try {
            const backendResponse = await axios.post("http://localhost:5172/user/profilePicture", {
                userID: localUserId,
                profilePictureID
            });
            
            if (backendResponse.data.successMessage) {
                updateBackendMessage(backendResponse.data.successMessage);
                dispatch(updateProfilePicture(profilePictureID));
            }
        }

        catch (error) {
            updateBackendMessage("An error occurred. Please try again later.");
        }
    }

    const selectProfilePicture = (pictureID) => {
        updateProfilePictureID(pictureID);
    }

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setEditProfilePictureShown(false));
        }, 500);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {isEditProfilePictureShown && (
                <div className={`${styles.profilePictureContainer} fadeIn`} ref={containerRef}>
                    <div className={styles.editProfilePicture}>
                        <div className={styles.imageDisplay}>
                            {Array.from({ length: 7 }, (_, i) => (
                                <img
                                    onClick={() => selectProfilePicture(i + 1)}
                                    className={`${styles.profilePicture} ${Number(profilePicture) === i + 1 ? styles.current : ''} ${profilePictureID === i + 1 ? styles.selected : ''}`}
                                    key={i + 1}
                                    src={`/${i + 1}.png`}
                                    alt={`Profile Picture ${i + 1}`}
                                />
                        ))}
                        </div>

                        <p className={styles.backendMessage}>{backendMessage}</p>

                        <div className={styles.buttonContainer}>
                            <button onClick={changeProfilePicture} className={`${styles.update} button`}>Update</button>
                            <button onClick={closeContainer} className={`${styles.cancel} button`}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePicture;