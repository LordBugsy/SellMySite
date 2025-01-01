import styles from './Comments.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown } from '../../../Redux/store';
import { useEffect, useRef } from 'react';
import axios from 'axios';

const Comments = (props) => {
    // Redux
    const { isCommentSectionShown } = useSelector(state => state.comments);
    const { localUserId } = useSelector(state => state.user.user);
    const dispatch = useDispatch();

    // React
    const containerRef = useRef();
    const messageAreaRef = useRef();

    const closeCommentSection = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('growIn', 'growOut');
            setTimeout(() => dispatch(setCommentSectionShown(false)), 500);
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeCommentSection();
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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        };
        
        if (messageAreaRef.current) {
            messageAreaRef.current.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    const sendMessage = async () => {
        const message = messageAreaRef.current.value.trim();
        if (message === '') return;

        if (localUserId === '') {
            dispatch(setLoginSignupShown(true));
            closeCommentSection();
            return;
        }

        try {
            const backendResponse = await axios.post('http://localhost:5172/post/comment/publish', {
                postID: props.postID,
                commenter: localUserId,
                content: message,
            });

            console.log(backendResponse.data);
        }

        catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            {isCommentSectionShown && <div ref={containerRef} className={`${styles.commentsContainer} growIn`}>
                <div className={styles.comments}>
                    <div className={styles.commentsHeader}>
                        <p className={styles.title}>{props.targetName}'s comments</p>
                        <i className={`fas fa-times ${styles.icon}`} onClick={closeCommentSection}></i>
                    </div>
                    
                    <div className={styles.commentsContent}>
                        {props.comments.length === 0 ? (
                        <p className={styles.noComments}>No comments yet, be the first one to comment!</p>
                    ) : (
                        props.comments.map((comment, index) => (
                            <div className={styles.comment} key={index}>
                                <div className={styles.commentHeader}>
                                    <img src={comment.owner.profilePicture || `/${Math.floor(Math.random() * 9)}.png`} alt="profile picture" className={styles.profilePicture}/>
                                    <p className={styles.displayName}>
                                        {comment.owner.displayName}{' '}
                                        <span className={styles.username}>@{comment.owner.username}</span>
                                    </p>
                                </div>

                                <div className={styles.commentContent}>
                                    <p className={styles.commentText}>{comment.content}</p>
                                </div>

                                <div className={styles.actions}>
                                    <i className={`fas fa-heart ${styles.icon}`}></i>
                                    <i className={`fas fa-comment ${styles.icon}`}></i>
                                    <i className={`fas fa-share ${styles.icon}`}></i>
                                </div>
                            </div>
                        ))
                    )}
                    </div>

                    <div className={styles.commentActions}>
                        {/* */}
                    </div>

                    <div className={styles.textAreaContainer}>
                        <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={props.targetName === "Post" ? "Comment your thoughts on this post!" : `Comment your thoughts on ${props.targetName}'s post!`}></textarea>
                        
                        <div className={styles.iconBackground}>
                            <i onClick={sendMessage} className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
                        </div>
                    </div>  
                </div>
            </div>}
        </>
    )
};

export default Comments;
