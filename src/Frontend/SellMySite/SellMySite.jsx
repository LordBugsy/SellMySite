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