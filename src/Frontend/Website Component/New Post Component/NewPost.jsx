import styles from './NewPost.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { setPublishPostShown } from '../../Redux/store';

const NewPost = () => {
    // Redux
    const { localUsername, profilePicture } = useSelector(state => state.user.user);
    const isPublishPostShown = useSelector(state => state.publishPost.isPublishPostShown);

    const dispatch = useDispatch();

    // React
    const messageAreaRef = useRef(null);
    const containerRef = useRef();

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

    return (
        <>
            { isPublishPostShown && <div ref={containerRef} className={`${styles.newPostContainer} growIn`}>
                <div className={styles.newPostContent}>
                    <i onClick={closeContainer} className={`fas fa-times ${styles.icon}`}></i>
                    <div className={styles.newPostHeader}>
                        <img src={`/${profilePicture}.png`} alt="Profile" className={styles.profilePicture} />
                        <p className={styles.username}>{localUsername}</p>
                    </div>

                    <div className={styles.textAreaContainer}>
                        <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={`What's on your mind?`}></textarea>
                        
                        <div className={styles.iconBackground}>
                            <i className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
                        </div>
                    </div>  

                    <p className={styles.info}>
                        By posting, you agree to our <span className={styles.terms}>Terms of Service</span> and <span className={styles.terms}>Privacy Policy</span>.
                    </p>
                </div>
            </div>}
        </>
    )
}

export default NewPost;