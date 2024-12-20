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

    const dispatch = useDispatch();

    // React
    const iconRef = useRef();
    const publishOptionsRef = useRef();

    const defaultWebsites = [ 
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
    ];

    const defaultPosts = [
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
        {name: "Loading Title", thumbnailImage: "/thumbnailPlaceholder.png"},
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
                                <p className={styles.websiteTitle}>{website.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.category}>
                    <h1 className='title'>Trending Posts</h1>

                    <div className={styles.posts}>
                        { defaultPosts.map((post, index) => (
                            <div className={styles.post} key={index}>
                                <img src={post.thumbnailImage} alt={post.name} />
                                <p className={styles.postTitle}>{post.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Publish a Website / Post */}
            <div className={`${styles.publish} ${styles.iconContainer} fadeIn`}>
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
            </div>

            { isPublishWebsiteShown && <PublishWebsite /> }
            { isPublishPostShown && <NewPost /> }
        </>
    )
}

export default SellMySite;