import styles from './NewPost.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, useEffect, useState } from 'react';
import { setPublishPostShown } from '../../Redux/store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewPost = () => {
    // Redux
    const { localUserId, localUsername, profilePicture } = useSelector(state => state.user.user);
    const isPublishPostShown = useSelector(state => state.publishPost.isPublishPostShown);

    const dispatch = useDispatch();

    // React
    const [postError, updatePostError] = useState("");

    const messageAreaRef = useRef(null);
    const containerRef = useRef();

    const navigate = useNavigate();

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setPublishPostShown(false));
        }, 500);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleInput = () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.style.height = 'auto';
                messageAreaRef.current.style.height = `${Math.min(messageAreaRef.current.scrollHeight, 335)}px`;
            }
        };

        const textArea = messageAreaRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (messageAreaRef.current) messageAreaRef.current.focus();
    }, []);

    const postContent = async () => {
        try {
            const backendResponse = await axios.post('http://localhost:5172/post/create', {
                content: messageAreaRef.current.value.trim(),
                attachment: undefined, // No attachment for now
                owner: localUserId
            });
            navigate(`/post/${localUsername}/${backendResponse.data.publicPostID}`);

            closeContainer();
        }

        catch (error) {
            console.error(error);
            updatePostError("An error occurred, please try again later. If the problem persists, please contact support.");
        }
    }

    return (
        <>
            { isPublishPostShown && <div ref={containerRef} className={`${styles.newPostContainer} growIn`}>
                <div className={styles.newPostContent}>
                    <i onClick={closeContainer} className={`fas fa-times ${styles.icon}`}></i>
                    <div className={styles.newPostHeader}>
                        <img src={`/${profilePicture}.png`} alt="Profile" className={styles.profilePicture} />
                        <p className={styles.username}>@{localUsername}</p>
                    </div>

                    <div className={styles.textAreaContainer}>
                        <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={`What's on your mind?`}></textarea>
                        
                        <div onClick={postContent} className={styles.iconBackground}>
                            <i className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
                        </div>
                    </div>  

                    { postError !== "" && <p className={styles.error}>{postError}</p> }

                    <p className={styles.info}>
                        By posting, you agree to our <span className={styles.terms}>Terms of Service</span> and <span className={styles.terms}>Privacy Policy</span>.
                    </p>
                </div>
            </div>}
        </>
    )
}

export default NewPost;