import styles from './SellMySite.module.scss';
import PublishWebsite from '../Website Component/Publish Website/PublishWebsite';
import { useSelector, useDispatch } from 'react-redux';
import { setPublishWebsiteShown, setPublishPostShown } from '../Redux/store';
import { useRef } from 'react';
import NewPost from '../Website Component/New Post Component/NewPost';

const SellMySite = () => {
    // Redux
    const { isPublishWebsiteShown } = useSelector(state => state.publishWebsite);
    const { isPublishPostShown } = useSelector(state => state.publishPost);
    const { localUserId } = useSelector(state => state.user.user);

    const dispatch = useDispatch();

    // React
    const iconRef = useRef();
    const publishOptionsRef = useRef();

    const defaultWebsites = [ 
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png", owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png", owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png", owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png", owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }},
    ];

    const defaultPosts = [
        {text: "Loading content...", 
            attachment: undefined, 
            owner: {
                username: "Loading Username",
                profilePicture: Math.floor(Math.random() *9)
        }},
        {text: "Loading content...",
            attachment: 'https://picsum.photos/id/237/500',
            owner: {
                username: "Loading Username",
                profilePicture: Math.floor(Math.random() *9)
        }},
        {text: "Loading content...",
            attachment: 'https://picsum.photos/id/237/500',
            owner: {
                username: "Loading Username",
                profilePicture: Math.floor(Math.random() *9)
        }},
        {text: "Loading content...",
            attachment: undefined,
            owner: {
                username: "Loading Username",
                profilePicture: Math.floor(Math.random() *9)
        }},
        {text: "Loading content...",
            attachment: 'https://picsum.photos/id/237/500',
            owner: {
                username: "Loading Username",
                profilePicture: Math.floor(Math.random() *9)
            }
        },
        {text: "Loading content...",
            attachment: undefined,
            owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }},
        {  text: "Loading content...",
            attachment: 'https://picsum.photos/id/237/500',
            owner: {
            username: "Loading Username",
            profilePicture: Math.floor(Math.random() *9)
        }}
    ];

    const togglePublishOptions = (event) => {
        if (iconRef.current && event.target === iconRef.current) {
            if (publishOptionsRef.current.classList.contains(styles.hidden)) {
                publishOptionsRef.current.classList.replace(styles.hidden, styles.visible);
                iconRef.current.classList.replace("fa-plus", "fa-times");
            }

            else {
                publishOptionsRef.current.classList.replace(styles.visible, styles.hidden);
                iconRef.current.classList.replace("fa-times", "fa-plus");
            }
        }        
    }

    return (
        <>
            <div className={`${styles.sellMySiteContainer} fadeIn`}>
                <div className={styles.category}>
                    <h1 className='title'>Trending Websites</h1>

                    <div className={styles.websites}>
                        { defaultWebsites.map((website, index) => (
                            <div className={styles.website} key={index}>
                                <img src={website.thumbnailImage} alt={website.name} />

                                <div className={styles.websiteInfo}>
                                    <p className={styles.websiteTitle}>{website.name}</p>

                                    <div className={styles.profileContainer}>
                                        <img className={styles.profilePicture} src={`/${website.owner.profilePicture}.png`} alt="Profile" />
                                        <p className={styles.profileUsername}>@{website.owner.username}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.category}>
                    <h1 className='title'>Trending Posts</h1>

                    <div className={styles.posts}>
                        { defaultPosts.map((post, index) => (
                            <div className={styles.post} key={index}>
                                <div className={styles.postHeader}>
                                    <div className={styles.profileContainer}>
                                        <img className={styles.profilePicture} src={`/${post.owner.profilePicture}.png`} alt="Profile" />
                                        <p className={styles.profileUsername}>@{post.owner.username}</p>
                                    </div>

                                    <div className={styles.postContent}>
                                        <p className={styles.postText}>{post.text}</p>
                                    </div>
                                </div>

                                { post.attachment && <img className={styles.postAttachment} src={post.attachment} alt="Attachment" /> }
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.category}>
                    <h1 className='title'>Ongoing Auctions</h1>

                </div>
            </div>


            {/* Publish a Website / Post */}
            {localUserId && <div className={`${styles.publish} ${styles.iconContainer} fadeIn`}>
                <div ref={publishOptionsRef} className={`${styles.publishOptions} ${styles.hidden}`}>
                    <div onClick={() => dispatch(setPublishWebsiteShown(true))} className={styles.publishGroup}>
                        <i className={`fas fa-globe ${styles.icon}`}></i>
                        <p className={styles.publishText}>Publish a Website</p>
                    </div>

                    <div onClick={() => dispatch(setPublishPostShown(true))} className={styles.publishGroup}>
                        <i className={`fas fa-blog ${styles.icon}`}></i>
                        <p className={styles.publishText}>Publish a Post</p>
                    </div>                    
                </div>

                <i ref={iconRef} onClick={togglePublishOptions} className={`fa-solid fa-plus ${styles.icon} ${styles.static}`}></i>
            </div>}

            { isPublishWebsiteShown && <PublishWebsite /> }
            { isPublishPostShown && <NewPost /> }
        </>
    )
}

export default SellMySite;