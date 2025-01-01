import Comments from '../Comments/Comments';
import styles from './ViewPost.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown } from '../../../Redux/store';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../../../Loading/Loading';
import axios from 'axios';

const ViewPost = () => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isCommentSectionShown } = useSelector(state => state.comments);
    const dispatch = useDispatch();

    // React
    const { username, publicPostID } = useParams();

    const [isLoading, updateIsLoading] = useState(true);
    const [postData, updatePostData] = useState([]);
    const [likeStatus, updateLikeStatus] = useState(false); // true if the user has liked the post
    const [optionState, updateOptionState] = useState(false);
    const [otherPosts, updateOtherPosts] = useState([]);

    const likeButtonRef = useRef(null);
    const shareButtonRef = useRef(null);

    const openComments = () => {
        dispatch(setCommentSectionShown(true));
    };

    const toggleOptionState = () => {
        updateOptionState(!optionState);
    };

    const formatLikes = (num) => {
        if (num < 1000) return num.toString();
    
        const units = ['K', 'M', 'B', 'T'];
        let unitIndex = -1;
    
        while (Math.abs(num) >= 1000 && unitIndex < units.length - 1) {
            num /= 1000;
            unitIndex++;
        }
    
        return `${num.toFixed(num >= 10 || unitIndex === -1 ? 0 : 2)}${units[unitIndex] || ''}`;
    }

    useEffect(() => {
        if (isCommentSectionShown) 
            dispatch(setCommentSectionShown(false));
    }, []);

    useEffect(() => {
        const loadOtherPosts = async () => {
            updateIsLoading(true);

            try {
                const backendResponse = await axios.get(`http://localhost:5172/post/${username}/recent`);
                updateOtherPosts(backendResponse.data);
            }

            catch (error) {
                console.error(error);
            }
        };
    }), [username];

    useEffect(() => {
        const loadPost = async () => {
            updateIsLoading(true);
            try {
                const backendResponse = await axios.get(`http://localhost:5172/post/${username}/${publicPostID}`);
                if (backendResponse.data.likes.includes(localUserId)) updateLikeStatus(true);
                updatePostData(backendResponse.data);
            } 
            
            catch (error) {
                console.error(error);
            } 
            
            finally {
                updateIsLoading(false);
            }
        };

        loadPost();
    }, [username, publicPostID]);

    useEffect(() => {
        const checkIfLiked = () => {
            if (localUserId === "") return;

            if (postData.likes && postData.likes.includes(localUserId)) {
                updateLikeStatus(true);
            }
        }

        checkIfLiked();
    }, [postData, localUserId]);

    const toggleLike = async () => {
        if (localUserId === "") {
            dispatch(setLoginSignupShown(true));
            return;
        }
    
        try {
            if (likeStatus) {
                // Unlike the post
                const backendResponse = await axios.post(`http://localhost:5172/post/unlike`, {
                    postID: postData._id,
                    userID: localUserId,
                });
    
                updatePostData((prev) => ({
                    ...prev,
                    likes: prev.likes.filter((like) => like !== localUserId),
                }));
                updateLikeStatus(false);
            } 
            
            else {
                // Like the post
                const backendResponse = await axios.post(`http://localhost:5172/post/like`, {
                    postID: postData._id,
                    userID: localUserId,
                });
    
                updatePostData((prev) => ({
                    ...prev,
                    likes: [...prev.likes, localUserId],
                }));
                updateLikeStatus(true);
            }
        } 
        
        catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className={`${styles.viewPostContainer} fadeIn`}>
                <div className={styles.viewPost}>
                    { isLoading ? (
                        <Loading />
                        ) : (
                        <div className={styles.postContent}>
                            {postData._id ? (
                                <>
                                    <div className={styles.contentHeader}>
                                        <img src={`/${postData.owner?.profilePicture}.png`} alt={`${postData.owner?.username || "unknown"}'s profile picture`} className={styles.profilePicture} />
                                        <div className={styles.userInfo}>
                                            <p className={styles.displayName}>{postData.owner?.displayName || "Unknown"}</p>
                                            <p className={styles.username}>@{postData.owner?.username || "unknown"}</p>
                                            <p className={styles.date}>
                                                {new Date(postData.createdAt).toLocaleDateString()} 
                                                {/* new Date(postData.createdAt).toLocaleTimeString() */}
                                            </p>
                                        </div>

                                        <i onClick={toggleOptionState} className={`fas fa-ellipsis-h ${styles.icon}`}></i>
                                        <div className={`${styles.optionsContainer} ${optionState ? styles.visible : styles.hidden}`} >
                                            <p className={styles.option}>Edit</p>
                                            <p className={styles.option}>Delete</p>
                                            <p className={styles.option}>Report</p>
                                        </div>
                                    </div>
                            
                                    <div className={styles.content}>
                                        <p className={styles.text}>
                                            {postData.content}
                                        </p>

                                        {/* <div className={styles.imageContainer}>
                                            <img 
                                                src='' 
                                                alt='Post image' 
                                                className={styles.image} 
                                            />
                                        </div> */}

                                        
                                    </div>

                                    <div className={styles.actions}>
                                        <i onClick={toggleLike} ref={likeButtonRef} className={`${likeStatus ? 'fas' : 'far'} fa-heart ${styles.icon}`}>
                                            <span className={styles.likes}> {formatLikes(postData.likes.length)}</span>
                                        </i>
                                        <i className={`fas fa-comment ${styles.icon}`} onClick={openComments}></i>
                                        <i ref={shareButtonRef} className={`fas fa-share ${styles.icon}`}></i>
                                    </div>

                                </>
                            ) : (
                                <p className={styles.error}>An error occured. Please try again later.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* <div className={styles.otherPosts}>
                    <h1 className='title'>Other posts</h1>
                    <div className={styles.posts}>
                        {otherPosts.map((post, index) => (
                            <div className={styles.post} key={index}>
                                <div className={styles.postHeader}>
                                    <img src={`/${post.owner.profilePicture}.png`} alt={`${post.owner.username}'s profile picture`} className={styles.profilePicture} />
                                    <div className={styles.userInfo}>
                                        <p className={styles.displayName}>{post.owner.displayName}</p>
                                        <p className={styles.username}>@{post.owner.username}</p>
                                    </div>
                                </div>

                                <div className={styles.postContent}>
                                    <p className={styles.text}>{post.content}</p>
                                </div>

                                <div className={styles.actions}>
                                    <i className={`fas fa-heart ${styles.icon}`}></i>
                                    <i className={`fas fa-comment ${styles.icon}`}></i>
                                    <i className={`fas fa-share ${styles.icon}`}></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}

            </div>
            {isCommentSectionShown && <Comments postID={postData._id} comments={postData.comments} targetName={postData.owner?.username || "Post"} />}
        </>
    );
};

export default ViewPost;
