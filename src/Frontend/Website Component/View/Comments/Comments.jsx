import styles from './Comments.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown } from '../../../Redux/store';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Comments = (props) => {
    // Redux
    const { isCommentSectionShown } = useSelector(state => state.comments);
    const { localUserId } = useSelector(state => state.user.user);
    const dispatch = useDispatch();

    // React
    const containerRef = useRef();
    const messageAreaRef = useRef();

    const [commentsList, setComments] = useState([]);

    const closeCommentSection = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('growIn', 'growOut');
            setTimeout(() => dispatch(setCommentSectionShown(false)), 500);
        }
    }

    useEffect(() => {
        loadComments();
    }, []);

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

    const loadComments = async () => {
        try {
            const backendResponse = await axios.get(`http://localhost:5172/post/comments/${props.postID}`);
            setComments(backendResponse.data);
        }

        catch (error) {
            console.error(error);
        }
    }

    const toggleLikeComment = async (commentID) => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            closeCommentSection();
            return;
        }
    
        try {
            const targetComment = commentsList.find((comment) => comment._id === commentID);
            if (!targetComment) {
                console.error("Comment not found in commentsList.");
                return;
            }
    
            const userHasLiked = targetComment.likes.some((like) => like.toString() === localUserId);
            const endpoint = userHasLiked ? 'http://localhost:5172/post/comment/unlike' : 'http://localhost:5172/post/comment/like';
    
            setComments((prev) =>
                prev.map((comment) =>
                    comment._id === commentID ? {...comment, likes: userHasLiked ? comment.likes.filter((like) => like.toString() !== localUserId) : [...comment.likes, localUserId] } : comment
                )
            );
    
            const response = await axios.post(endpoint, {
                postID: props.postID,
                commentID,
                userID: localUserId,
            });
        } 
        
        catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const deleteComment = async (commentID) => {
        try {
            const backendResponse = await axios.post('http://localhost:5172/post/comment/delete', {
                postID: props.postID,
                commentID,
                userID: localUserId,
            });
            
            setComments((prev) => prev.filter((comment) => comment._id !== commentID));
        }

        catch (error) {
            console.error(error);
        }
    }

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

            loadComments();
            messageAreaRef.current.value = '';
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
                        {commentsList.length === 0 ? (
                        <p className={styles.noComments}>No comments yet, be the first one to comment!</p>
                    ) : (
                        commentsList.map((comment, index) => (
                            <div className={styles.comment} key={index}>
                                <div className={styles.commentHeader}>
                                    <img src={`/${comment.commenter.profilePicture}.png`} alt="profile picture" className={styles.profilePicture}/>
                                    <p className={styles.displayName}>
                                        {comment.commenter.displayName}{' '}
                                        <span className={styles.username}>@{comment.commenter.username}</span>
                                    </p>
                                </div>

                                <div className={styles.commentContent}>
                                    <p className={styles.commentText}>{comment.content}</p>
                                </div>

                                <div className={styles.actions}>
                                    <i className={`${comment.likes.includes(localUserId) ? 'fas' : 'far'} fa-heart ${styles.icon}`} onClick={() => toggleLikeComment(comment._id)} />
                                    {comment.commenter._id === localUserId && <i onClick={() => deleteComment(comment._id)} className={`fas fa-trash-alt ${styles.icon}`}></i>}
                                </div>
                            </div>
                        ))
                    )}
                    </div>

                    {localUserId && (
                        <>
                            <div className={styles.commentActions}>
                                {/*  */}
                            </div>

                            <div className={styles.textAreaContainer}>
                                <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={props.targetName === "Post" ? "Comment your thoughts on this post!" : `Comment your thoughts on ${props.targetName}'s post!`}></textarea>
                                
                                <div className={styles.iconBackground}>
                                    <i onClick={sendMessage} className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>} 
        </>
    ) 
};

export default Comments;
