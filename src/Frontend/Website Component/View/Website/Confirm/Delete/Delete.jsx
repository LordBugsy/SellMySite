import styles from './Delete.module.scss';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setConfirmDeleteShown } from '../../../../../Redux/store';

const Delete = props => {
    // Redux
    const dispatch = useDispatch();
    const { localUserId } = useSelector(state => state.user.user);
    const { isConfirmDeleteShown } = useSelector(state => state.confirmDelete);

    // React
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const confirmDelete = async () => {
        if (props.type === 'website') {
            try {
                const backendResponse = await axios.post("http://localhost:5172/website/delete", {
                    userID: localUserId,
                    websiteID: props.websiteID
                });

                navigate('/');
            }
            
            catch (error) {
                console.error(error);
            }
        }

        else if (props.type === "post") {
            try {
                const backendResponse = await axios.post("http://localhost:5172/post/delete", {
                    userID: localUserId,
                    postID: props.postID
                });

                navigate('/');
            }

            catch (error) {
                console.error(error);
            }
        }
    }

    const closeContainer = () => {
        containerRef.current && containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setConfirmDeleteShown(false));
        }, 500);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) {
                closeContainer();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            { isConfirmDeleteShown && (
                <div ref={containerRef} className={`${styles.deleteContainer} fadeIn`}>
                    <div className={styles.deleteContent}>
                        <i className={`fas fa-times ${styles.icon}`} onClick={closeContainer}></i>

                        <p className={styles.title}>
                            {props.type === 'website' ? 
                                `Are you sure you want to delete ${props.websiteTitle}? This action cannot be undone.` :
                                `Are you sure you want to delete your post? This action cannot be undone.`
                            }
                        </p>

                        <div className={styles.buttonsContainer}>
                            <button className={`button ${styles.cancel}`} onClick={closeContainer}>Cancel</button>
                            <button className={`button ${styles.delete}`} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Delete;