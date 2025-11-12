import styles from './Comments.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown } from '../../../Redux/store';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

const Comments = (props) => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // Redux
    const { isCommentSectionShown } = useSelector(state => state.comments);
    const { localUserId } = useSelector(state => state.user.user);
    const dispatch = useDispatch();

    // React
    const containerRef = useRef();
    const messageAreaRef = useRef();
    const observer = useRef();

    const [commentsList, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const closeCommentSection = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('growIn', 'growOut');
            setTimeout(() => dispatch(setCommentSectionShown(false)), 500);
        }
    };

    const loadComments = useCallback(async (reset = false) => {
        if (!props.postID && !props.websiteID) {
            // console.error("Unable to load comments: No postID or websiteID provided.");
            return;
        }
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const url = props.postID 
                ? `${apiURL}/post/comments/${props.postID}?page=${reset ? 1 : page}&limit=10`
                : `${apiURL}/website/comments/${props.websiteID}?page=${reset ? 1 : page}&limit=10`;

            const response = await axios.get(url);
            const { comments, hasMore: more } = response.data;

            setComments(prev => reset ? comments : [...prev, ...comments]);
            setHasMore(more);
            setPage(prev => reset ? 2 : prev + 1);
        } 
        
        catch (error) {
            // console.error("Error loading comments:", error);
        }
        setLoading(false);
    }, [page, hasMore, loading, props.postID, props.websiteID]);

    useEffect(() => {
        loadComments(true);
    }, [props.postID, props.websiteID]);

    // IntersectionObserver for Infinite Scroll
    const lastCommentRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadComments();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadComments]
    );

    const toggleLikeComment = async (commentID) => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            closeCommentSection();
            return;
        }

        try {
            const targetComment = commentsList.find((comment) => comment._id === commentID);
            if (!targetComment) return;

            const userHasLiked = targetComment.likes.includes(localUserId);
            const endpoint = userHasLiked 
                ? `${apiURL}/${props.postID ? 'post' : 'website'}/comment/unlike` 
                : `${apiURL}/${props.postID ? 'post' : 'website'}/comment/like`;

            setComments(prev => prev.map(comment =>
                comment._id === commentID
                    ? { ...comment, likes: userHasLiked ? comment.likes.filter(like => like !== localUserId) : [...comment.likes, localUserId] }
                    : comment
            ));

            await axios.post(endpoint, {
                [props.postID ? "postID" : "websiteID"]: props.postID || props.websiteID,
                commentID,
                userID: localUserId,
            });

        } 
        
        catch (error) {
            // console.error("Error toggling like:", error);
        }
    };

    const deleteComment = async (commentID) => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            closeCommentSection();
            return;
        }

        try {
            await axios.post(`${apiURL}/${props.postID ? 'post' : 'website'}/comment/delete`, {
                [props.postID ? "postID" : "websiteID"]: props.postID || props.websiteID,
                commentID,
                userID: localUserId,
            });

            setComments(prev => prev.filter(comment => comment._id !== commentID));

        } 
        
        catch (error) {
            // console.error("Error deleting comment:", error);
        }
    };

    const sendMessage = async () => {
        const message = messageAreaRef.current.value.trim();
        if (!message) return;

        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            closeCommentSection();
            return;
        }

        try {
            await axios.post(`${apiURL}/${props.postID ? 'post' : 'website'}/comment/publish`, {
                [props.postID ? "postID" : "websiteID"]: props.postID || props.websiteID,
                [props.postID ? "commenter" : "commenterID"]: localUserId,
                content: message,
            });

            messageAreaRef.current.value = '';
            loadComments(true);

        } 
        
        catch (error) {
            // console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeCommentSection();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = event => {
            if (event.key === 'Escape') closeCommentSection();
            else if (event.key === 'Enter') sendMessage();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [messageAreaRef]);

    return (
        <>
            {isCommentSectionShown && (
                <div ref={containerRef} className={`${styles.commentsContainer} growIn`}>
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
                                    <div ref={index === commentsList.length - 1 ? lastCommentRef : null} className={styles.comment} key={comment._id}>
                                        <div className={styles.commentHeader}>
                                            {comment.commenter ? (
                                                <>
                                                    <img src={`/${comment.commenter.profilePicture || 'default'}.png`} alt="profile" className={styles.profilePicture} />
                                                    <p className={styles.displayName}>
                                                        {comment.commenter.displayName || 'Unknown'}{' '}
                                                        <span className={styles.username}>@{comment.commenter.username || 'unknown'}</span>
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={styles.displayName}>Unknown User</p>
                                            )}
                                        </div>
    
                                        <div className={styles.commentContent}>
                                            <p className={styles.commentText}>{comment.content}</p>
                                        </div>
    
                                        <div className={styles.actions}>
                                            <i className={`${comment.likes?.includes(localUserId) ? 'fas' : 'far'} fa-heart ${styles.icon}`} onClick={() => toggleLikeComment(comment._id)} />
                                            {comment.commenter?._id === localUserId && (
                                                <i onClick={() => deleteComment(comment._id)} className={`fas fa-trash-alt ${styles.icon}`}></i>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className={styles.commentsFooter}></div>
    
                        {loading && <p className={styles.loading}>Loading more comments...</p>}
    
                        {localUserId && (
                            <div className={styles.textAreaContainer}>
                                <textarea ref={messageAreaRef} className={styles.textArea} placeholder="Write a comment..."></textarea>
                                <div className={styles.iconBackground}>
                                    <i onClick={sendMessage} className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Comments;