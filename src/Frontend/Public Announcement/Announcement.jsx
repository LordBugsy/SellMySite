import styles from './Announcement.module.scss';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import { setHasReadTheAnnouncement, setAnnouncementShown } from '../Redux/store';
import { useDispatch, useSelector } from 'react-redux';

const Announcement = () => {
    // Redux
    const dispatch = useDispatch();
    const { hasReadTheAnnouncement, localUserId } = useSelector(state => state.user.user);
    const { isAnnouncementShown } = useSelector(state => state.announcements);
    
    // React
    const [announcementData, updateAnnouncementData] = useState([]);

    const announcementRef = useRef(null);

    const agreeToAnnouncement = () => {
        if (!localUserId) {
            announcementRef.current.classList.replace('fadeIn', 'fadeOut');
            setTimeout(() => {
                dispatch(setHasReadTheAnnouncement(true));
                dispatch(setAnnouncementShown(false));
            }, 500);

            return;
        }

        dispatch(setHasReadTheAnnouncement(true));
        try {
            axios.post("http://localhost:5172/announcement/agree", {
                userID: localUserId
            });

            announcementRef.current.classList.replace('fadeIn', 'fadeOut');
            setTimeout(() => {
                dispatch(setAnnouncementShown(false));
            }, 500);
        }

        catch (error) {
            console.error(error);
        }        
    }

    useEffect(() => {        
        const fetchAnnouncement = async () => {
            try {
                const backendResponse = await axios.get("http://localhost:5172/announcement/latest");
                updateAnnouncementData(backendResponse.data);

                if (announcementData.length === 0) {
                    dispatch(setAnnouncementShown(false));
                    return;
                }

            }

            catch (error) {
                console.error(error);
            }
        }

        fetchAnnouncement();
    }, []);

    return (
        <>
            {(!hasReadTheAnnouncement || isAnnouncementShown) && (
                <div ref={announcementRef} className={`${styles.announcementContainer} fadeIn`}>
                    <div className={styles.announcement}>
                        <ReactMarkdown>
                            {announcementData.content}
                        </ReactMarkdown>

                        <div className={styles.buttonContainer}>
                            <button onClick={agreeToAnnouncement} className={`button ${styles.read}`}>Got it!</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Announcement;