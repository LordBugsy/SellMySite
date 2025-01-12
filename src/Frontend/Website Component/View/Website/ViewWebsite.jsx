import Comments from '../Comments/Comments';
import styles from './ViewWebsite.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown, setEditWebsiteShown, setConfirmBuyShown, setConfirmDeleteShown } from '../../../Redux/store';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../Loading/Loading';
import EditWebsite from './Edit Website/EditWebsite';
import ConfirmBuy from './Confirm/Buy/ConfirmBuy';
import Delete from './Confirm/Delete/Delete';

const ViewWebsite = () => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isEditWebsiteShown } = useSelector(state => state.editWebsite);
    const { isCommentSectionShown } = useSelector(state => state.comments);
    const { isConfirmBuyShown } = useSelector(state => state.confirmBuy);
    const { isConfirmDeleteShown } = useSelector(state => state.confirmDelete);

    const dispatch = useDispatch();

    // React
    const navigate = useNavigate();
    const { username, publicWebsiteID } = useParams();
    
    const [isLoading, updateLoadingState] = useState(true);
    const [websiteData, updateData] = useState([]);
    const [likeStatus, updateLikeStatus] = useState(false);

    const openComments = () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
        }

        dispatch(setCommentSectionShown(true));
    }

    const editWebsite = () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
            // Theorically, this should never happen, but just in case
        }

        dispatch(setEditWebsiteShown(true));
    }

    const goToLink = (link) => {
        link ? navigate(link) : window.open('https://github.com/LordBugsy', '_blank'); 
    }

    const likeWebsite = async () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
        }

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/like`, {
                websiteID: websiteData._id,
                userID: localUserId
            });
            updateLikeStatus(backendResponse.data);
        }

        catch (error) {
            console.error(error);
        }
    }

    const unlikeWebsite = async () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
        }

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/unlike`, {
                websiteID: websiteData._id,
                userID: localUserId
            });
            updateLikeStatus(backendResponse.data);
        }

        catch (error) {
            console.error(error);
        }
    }

    const openBuyWebsite = () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
        }

        dispatch(setConfirmBuyShown(true));
    }

    const openDeleteWebsite = () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true)); // This should never happen, but just in case
            return;
        }

        dispatch(setConfirmDeleteShown(true));
    }

    useEffect(() => {
        if (isCommentSectionShown) dispatch(setCommentSectionShown(false));
        if (isEditWebsiteShown) dispatch(setEditWebsiteShown(false));
        if (isConfirmBuyShown) dispatch(setConfirmBuyShown(false));
        if (isConfirmDeleteShown) dispatch(setConfirmDeleteShown(false));
    }, []);

    useEffect(() => {
        const didUserLikeWebsite = async () => {
            if (websiteData._id && localUserId) {
                try {
                    const backendResponse = await axios.get(`http://localhost:5172/user/likedwebsites/${websiteData._id}`);
                    updateLikeStatus(backendResponse.data);
                }

                catch (error) {
                    console.error(error);
                }
            }
        }
        didUserLikeWebsite();
    }, []);

    useEffect(() => {
        const loadWebsite = async () => {
            updateLoadingState(true);

            try {
                const backendReponse = await axios.get(`http://localhost:5172/website/${username}/${publicWebsiteID}`);
                updateData(backendReponse.data);
            }

            catch (error) {
                navigate('/');
            }

            finally {
                updateLoadingState(false);
            }
            
        }
        loadWebsite();
    }, [isEditWebsiteShown]);

    return (
        <>
            <div className={`${styles.viewWebsiteContainer} fadeIn`}>
                <div className={styles.viewWebsite}>
                    {isLoading ? <Loading /> : (
                        <>
                            <div className={styles.websiteInformations}>
                                <img onClick={() => goToLink(websiteData.link)} src='/thumbnailPlaceholder.png' alt='thumbnail' className={styles.image} />
                                <div className={styles.informations}>
                                    <p className={styles.title}>{websiteData.title}{' '} 
                                        <span className={styles.githubRepo}><i className={`${styles.icon} fab fa-github`}></i></span>
                                    </p>
                                    <p className={styles.description}>
                                        {websiteData.description}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.websiteContent}>
                                <div className={styles.content}>
                                    {websiteData.price !== -1 ? (
                                        <h1 className={styles.price}>${websiteData.price}<span className={`${styles.status} ${styles.onSale}`}> On Sale</span></h1>
                                     ) : (<h1 className={styles.price}><span className={`${styles.status} ${styles.notOnSale}`}>Not on Sale</span></h1>
                                    )}
                                </div>

                                <div className={styles.content}>
                                    <img onClick={() => navigate(`/profile/${websiteData.owner.username}`)} src={`/${websiteData.owner.profilePicture}.png`} alt={`${websiteData.owner.username}'s profile picture`} className={styles.profilePicture} />
                                    <p onClick={() => navigate(`/profile/${websiteData.owner.username}`)} className={styles.username}>@{websiteData.owner.username}</p>
                                </div>

                                <div className={styles.actions}>
                                    <i onClick={likeStatus ? unlikeWebsite : likeWebsite} className={`${likeStatus ? 'fas' : 'far'} fa-heart ${styles.icon}`}></i>
                                    <i onClick={openComments} className={`fas fa-comment ${styles.icon}`}></i>
                                    {localUserId && localUserId === websiteData.owner._id && <i onClick={openDeleteWebsite} className={`fas fa-trash-alt ${styles.icon}`}></i>}
                                    {localUserId && localUserId !== websiteData.owner._id && websiteData.price > 0 && <i onClick={openBuyWebsite} className={`fas fa-shopping-cart ${styles.icon}`}></i>}
                                    {localUserId && localUserId === websiteData.owner._id && <i onClick={editWebsite} className={`fas fa-edit ${styles.icon}`}></i>}
                                    {/* why would someone report himself/herself? */ localUserId !== websiteData.owner._id && <i className={`fas fa-flag ${styles.icon}`}></i>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isCommentSectionShown && <Comments websiteID={websiteData._id} comments={websiteData.comments} targetName={websiteData.title} />}
            {isEditWebsiteShown && <EditWebsite targetName={websiteData.title} targetID={websiteData._id} />}
            {isConfirmBuyShown && <ConfirmBuy websiteID={websiteData._id} websiteTitle={websiteData.title} websitePrice={websiteData.price} />}
            {isConfirmDeleteShown && <Delete type="website" websiteID={websiteData._id} websiteTitle={websiteData.title} />}
        </>
    )
}

export default ViewWebsite;