import styles from './SellMySite.module.scss';
import PublishWebsite from '../Website Component/Publish Website/PublishWebsite';
import { useSelector, useDispatch } from 'react-redux';
import { setPublishWebsiteShown, setPublishPostShown } from '../Redux/store';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import NewPost from '../Website Component/New Post Component/NewPost';
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import Announcement from '../Public Announcement/Announcement';

const SellMySite = () => {
    // Redux
    const { isPublishWebsiteShown } = useSelector(state => state.publishWebsite);
    const { isPublishPostShown } = useSelector(state => state.publishPost);
    const { localUserId } = useSelector(state => state.user.user);
    const { isAnnouncementShown } = useSelector(state => state.announcements);

    const dispatch = useDispatch();

    // React
    const iconRef = useRef();
    const publishOptionsRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Home - SellMySite";
    }, []);

    const [dataState, setDataState] = useState({
        loadedPosts: [],
        loadedWebsites: [],
        isLoading: true,
        consoleError: "",
    });

    const togglePublishOptions = (event) => {
        if (iconRef.current && event.target === iconRef.current) {
            if (publishOptionsRef.current.classList.contains(styles.hidden)) {
                publishOptionsRef.current.classList.replace(styles.hidden, styles.visible);
                iconRef.current.classList.replace("fa-plus", "fa-times");
            } else {
                publishOptionsRef.current.classList.replace(styles.visible, styles.hidden);
                iconRef.current.classList.replace("fa-times", "fa-plus");
            }
        }
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

    const goToPost = (username, publicPostID) => {
        navigate(`/post/${username}/${publicPostID}`);
    };

    const goToWebsite = (username, websiteID) => {
        navigate(`/website/${username}/${websiteID}`);
    };

    useEffect(() => {
        setDataState((prev) => ({ ...prev, isLoading: true }));

        const loadTrendingWebsites = async () => {
            try {
                const backendResponse = await axios.get('http://localhost:5172/website/popular');
                setDataState((prev) => ({
                    ...prev,
                    loadedWebsites: backendResponse.data,
                    isLoading: false,
                }));
            }

            catch (error) {
                console.error(error);
                setDataState((prev) => ({
                    ...prev,
                    consoleError: "An error occurred, please try again later.",
                    isLoading: false,
                }));
            }
        };

        const loadTrendingPosts = async () => {
            try {
                const backendResponse = await axios.get('http://localhost:5172/post/popular');
                setDataState((prev) => ({
                    ...prev,
                    loadedPosts: backendResponse.data,
                    isLoading: false,
                }));
            } 
            
            catch (error) {
                console.error(error);
                setDataState((prev) => ({
                    ...prev,
                    consoleError: "An error occurred, please try again later.",
                    isLoading: false,
                }));
            }
        };

        loadTrendingWebsites();
        loadTrendingPosts();
    }, []);

    return (
        <>
            <div className={`${styles.sellMySiteContainer} fadeIn`}>
                <div className={styles.category}>
                    <h1 className="title">Trending Websites</h1>
    
                    <div className={styles.websites}>
                        {dataState.consoleError ? (
                            <div className={styles.errorContainer}>
                                <p className={styles.error}>{dataState.consoleError}</p>
                            </div>
                        ) : dataState.isLoading ? (
                            <div className={styles.loadingContainer}>
                                <Loading componentClass />
                            </div>
                        ) : dataState.loadedWebsites.length === 0 ? (
                            // This message should, in theory, never be displayed because the Bot posts at least 3 websites upon being started
                            <p className={styles.noWebsites}>
                                Seems like no one has published a website yet, become the first one to publish!
                            </p>
                        ) : (
                            Array.isArray(dataState.loadedWebsites) &&
                            dataState.loadedWebsites.map((website, index) => (
                                <div onClick={() => goToWebsite(website.owner.username, website.publicWebsiteID)} className={styles.website} key={index}>
                                    <img src={website.thumbnailImage || '/thumbnailPlaceholder.png'} alt={`${website.title}'s thumbnail`} />

                                    <div className={styles.websiteInfo}>
                                        <p className={styles.websiteTitle}>{website.title}</p>

                                        <div className={styles.profileContainer}>
                                            <img className={styles.profilePicture} src={`/${website.owner.profilePicture}.png`} alt="Profile" />
                                            <p className={styles.profileUsername}>
                                                @{website.owner.username}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
    
                <div className={styles.category}>
                    <h1 className="title">Trending Posts</h1>
    
                    <div className={styles.posts}>
                        { dataState.consoleError ? (
                            <div className={styles.errorContainer}>
                                <p className={styles.error}>{dataState.consoleError}</p>
                            </div>
                        ) : dataState.isLoading ? (
                            <div className={styles.loadingContainer}>
                                <Loading componentClass />
                            </div>
                        ) : dataState.loadedPosts.length === 0 ? (
                            <p className={styles.noPosts}>
                                Seems like no one has posted anything, become the first one to post!
                            </p>
                        ) : (
                            Array.isArray(dataState.loadedPosts) &&
                            dataState.loadedPosts.map((post, index) => (
                                <div onClick={() => goToPost(post.owner.username, post.publicPostID)} className={styles.post} key={index}>
                                    <div className={styles.postHeader}>
                                        <div className={styles.profileContainer}>
                                            <img className={styles.profilePicture} src={`/${post.owner.profilePicture}.png`} alt="Profile" />
                                            <p className={styles.profileUsername}>
                                                @{post.owner.username}
                                            </p>
                                        </div>
                                        <div className={styles.postContent}>
                                            <p className={styles.postText}>{post.content}</p>
                                        </div>
                                    </div>
                                    {post.attachment && <img className={styles.postAttachment} src={post.attachment} alt="Attachment" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
    
                {/* <div className={styles.category}>
                    <h1 className="title">Ongoing Auctions</h1>
                </div> */}
            </div>
    
            {/* Publish a Website / Post */}
            {localUserId && (
                <div className={`${styles.publish} ${styles.iconContainer} fadeIn`}>
                    <div ref={publishOptionsRef} className={`${styles.publishOptions} ${styles.hidden}`}>
                        <div onClick={() => dispatch(setPublishWebsiteShown(true))} className={styles.publishGroup}>
                            <i className={`fas fa-globe ${styles.icon}`}></i>
                            <p className={styles.publishText}>
                                Publish a Website
                            </p>
                        </div>
    
                        <div onClick={() => dispatch(setPublishPostShown(true))} className={styles.publishGroup}>
                            <i className={`fas fa-blog ${styles.icon}`}></i>
                            <p className={styles.publishText}>Publish a Post</p>
                        </div>
                    </div>
    
                    <i ref={iconRef} onClick={togglePublishOptions} className={`fa-solid fa-plus ${styles.icon} ${styles.static}`}></i>
                </div>
            )}

            <a className={styles.buyMeACoffeeContainer} href="https://ko-fi.com/lordbugsy" target="_blank" rel="noreferrer">
                <div className={styles.buyMeACoffee}>
                    <i className={`fas fa-coffee ${styles.icon}`}></i>
                </div>
            </a>
    
            {isPublishWebsiteShown && <PublishWebsite />}
            {isPublishPostShown && <NewPost />}
            {isAnnouncementShown && <Announcement />}
        </>
    )
}

export default SellMySite;