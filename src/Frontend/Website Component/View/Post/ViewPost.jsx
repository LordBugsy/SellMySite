import Comments from '../Comments/Comments';
import styles from './ViewPost.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown } from '../../../Redux/store';
import { useEffect, useRef, useState } from 'react';

const ViewPost = (props) => {
    // Redux
    const { localUsername, profilePicture } = useSelector(state => state.user.user);
    const { isCommentSectionShown } = useSelector(state => state.comments);

    const dispatch = useDispatch();

    // React
    const [optionState, updateOptionState] = useState(false);

    const likeButtonRef = useRef(null);
    const shareButtonRef = useRef(null);

    const openComments = () => {
        dispatch(setCommentSectionShown(true));
    }

    const toggleOptionState = () => {
        updateOptionState(!optionState);
    }

    const toggleLikeState = () => {
        if (likeButtonRef.current && likeButtonRef.current.classList.contains('far')) likeButtonRef.current.classList.replace('far', 'fas');
        
        else likeButtonRef.current.classList.replace('fas', 'far');
    }   

    useEffect(() => {
        if (isCommentSectionShown) dispatch(setCommentSectionShown(false));
    }, []);

    return (
        <>
        <div className={`${styles.viewPostContainer} fadeIn`}>
            <div className={styles.viewPost}>
                <div className={styles.postContent}>
                    <div className={styles.contentHeader}>
                        <img src={`/${profilePicture}.png`} alt={`${localUsername}'s profile picture`} className={styles.profilePicture} />
                        <div className={styles.userInfo}>
                            <p className={styles.displayName}>John Doe</p>
                            <p className={styles.username}>@{localUsername}</p>
                        </div>

                        <i onClick={toggleOptionState} className={`fas fa-ellipsis-h ${styles.icon}`}></i>

                        <div className={`${styles.optionsContainer} ${optionState ? styles.visible : styles.hidden}`}>
                            <p className={styles.option}>Edit</p>
                            <p className={styles.option}>Delete</p>
                            <p className={styles.option}>Report</p>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <p className={styles.text}>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Similique delectus cumque iure molestias dicta ullam eligendi molestiae eum fugiat quos consequuntur, expedita libero mollitia at. Eaque eligendi corporis fugiat voluptatum?
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore ipsum inventore maxime, quas numquam, atque nihil voluptatibus minima illum ipsam ea. Totam deleniti provident, corporis possimus fuga cum laboriosam ex.
                        </p>

                        {/* <div className={styles.imageContainer}>
                            <img 
                                src='' 
                                alt='Post image' 
                                className={styles.image} 
                            />
                        </div> */}

                        <div className={styles.dateInformation}>
                            <p className={styles.date}>
                                Posted on 12/12/2021
                            </p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <i onClick={toggleLikeState} ref={likeButtonRef} className={`far fa-heart ${styles.icon}`}></i>
                        <i className={`fas fa-comment ${styles.icon}`} onClick={openComments}></i>
                        <i ref={shareButtonRef} className={`fas fa-share ${styles.icon}`}></i>
                    </div>
                </div>
            </div>

            <div className={styles.recommendedPosts}>
                <h1 className="title">Other posts made by {localUsername}</h1>
                
                <div className={styles.posts}>
                    {/* insert posts here */}
                </div>
            </div>
        </div>

        {isCommentSectionShown && <Comments targetName="testing" />}

        </>
    )
}

export default ViewPost;