import Comments from '../Comments/Comments';
import styles from './ViewWebsite.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown, setLoginSignupShown } from '../../../Redux/store';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../Loading/Loading';
import EditWebsite from './Edit Website/EditWebsite';

const ViewWebsite = () => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isEditWebsiteShown } = useSelector(state => state.editWebsite);
    const { isCommentSectionShown } = useSelector(state => state.comments);

    const dispatch = useDispatch();

    // React
    const navigate = useNavigate();
    const { username, publicWebsiteID } = useParams();
    
    const [isLoading, updateLoadingState] = useState(true);
    const [websiteData, updateData] = useState([]);

    const openComments = () => {
        if (!localUserId) {
            dispatch(setLoginSignupShown(true));
            return;
        }

        dispatch(setCommentSectionShown(true));
    }

    const goToLink = (link) => {
        link ? navigate(link) : window.open('https://github.com/LordBugsy', '_blank');
    }

    useEffect(() => {
        if (isCommentSectionShown) dispatch(setCommentSectionShown(false));
    }, []);

    useEffect(() => {
        const loadWebsite = async () => {
            updateLoadingState(true);

            try {
                const backendReponse = await axios.get(`http://localhost:5172/website/${username}/${publicWebsiteID}`);
                updateData(backendReponse.data);
            }

            catch (error) {
                console.error(error);
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
                                        <h1 className={styles.price}>${websiteData.price}<span className={`${styles.status} ${styles.onSale}`}>On Sale</span></h1>
                                     ) : (<h1 className={styles.price}><span className={`${styles.status} ${styles.notOnSale}`}>Not on Sale</span></h1>
                                    )}
                                </div>

                                <div className={styles.content}>
                                    <img onClick={() => navigate(`/profile/${websiteData.owner.username}`)} src={`/${websiteData.owner.profilePicture}.png`} alt={`${websiteData.owner.username}'s profile picture`} className={styles.profilePicture} />
                                    <p onClick={() => navigate(`/profile/${websiteData.owner.username}`)} className={styles.username}>@{websiteData.owner.username}</p>
                                </div>

                                <div className={styles.actions}>
                                    <i className={`fas fa-heart ${styles.icon}`}></i>
                                    <i onClick={openComments} className={`fas fa-comment ${styles.icon}`}></i>
                                    <i className={`fas fa-share ${styles.icon}`}></i>
                                    {websiteData.price > 0 && <i className={`fas fa-shopping-cart ${styles.icon}`}></i>}
                                    {localUserId === websiteData.owner._id && <i className={`fas fa-edit ${styles.icon}`}></i>}
                                    {localUserId !== websiteData.owner._id && <i className={`fas fa-flag ${styles.icon}`}></i>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isCommentSectionShown && <Comments targetName={websiteData.owner.username} targetID={websiteData._id} />}
            {isEditWebsiteShown && <EditWebsite targetName={websiteData.title}/>}
        </>
    )
}

export default ViewWebsite;