import { useSelector, useDispatch } from 'react-redux';
import styles from './PublishWebsite.module.scss';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPublishWebsiteShown } from '../../Redux/store'; 
import axios from 'axios';

const PublishWebsite = () => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // Redux 
    const dispatch = useDispatch();

    const { localUsername, profilePicture, localUserId } = useSelector(state => state.user.user);
    const { isPublishWebsiteShown } = useSelector(state => state.publishWebsite);

    // React
    const navigate = useNavigate();

    const [websiteName, updateWebsiteName] = useState(``);
    const [websiteDescription, updateWebsiteDescription] = useState('');
    const [websiteURL, updateWebsiteURL] = useState('/messages');

    const websiteNameRef = useRef();
    const websiteDescriptionRef = useRef();
    const websiteURLRef = useRef();

    const containerRef = useRef();
    const previewRef = useRef();

    const navigateToWebsite = (link) => {
        navigate(`${link}`);
    }

    const closePublish = (event) => {
        event.preventDefault();
        containerRef.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setPublishWebsiteShown(false));
        }, 500);
    }

    const togglePreview = () => {
        if (previewRef.current && previewRef.current.classList.contains(styles.slideOut)) previewRef.current.classList.replace(styles.slideOut, styles.slideIn);
        else previewRef.current.classList.replace(styles.slideIn, styles.slideOut);
    }

    const publishWebsite = async () => {
        if (!websiteURL) return;

        try {
            const backendResponse = await axios.post(`${apiURL}/website/create`, {
                title: websiteName || `${localUsername}'s website`,
                description: websiteDescription || 'Website Description',
                link: websiteURL,
                owner: localUserId
            });

            dispatch(setPublishWebsiteShown(false));
            navigate(`/website/${localUsername}/${backendResponse.data.publicWebsiteID}`);
        }

        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && event.target === containerRef.current) closePublish(event);
        }

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
        { isPublishWebsiteShown && <div ref={containerRef} className={`${styles.publishContainer} growIn`}>
            <div className={styles.publishContent}>
                <div className={styles.publishForm}>
                    <h1 className={styles.title}>Publish a Website</h1>
                    <i onClick={togglePreview} className={`fas fa-eye ${styles.titleIcon}`}></i>

                    <div className={styles.form}>
                        <p className={styles.info}>Website Name</p>
                        <div className={styles.formGroup}>
                            <i className={`fas fa-globe ${styles.icon}`}></i>
                            <input maxLength='20' ref={websiteNameRef} onChange={() => updateWebsiteName(websiteNameRef.current.value)} className={styles.input} type="text" placeholder="Website Name.." />
                        </div>

                        <p className={styles.info}>Website URL<span className={styles.required}>*</span></p>
                        <div className={styles.formGroup}>
                            <i className={`fas fa-link ${styles.icon}`}></i>
                            <input ref={websiteURLRef} onChange={() => updateWebsiteURL(websiteURLRef.current.value)} className={styles.input} type="text" placeholder="Website URL.." />
                        </div>

                        <p className={styles.info}>Website Description</p>
                        <div className={styles.formGroup}>
                            <textarea maxLength='120' ref={websiteDescriptionRef} onChange={() => updateWebsiteDescription(websiteDescriptionRef.current.value)} className={styles.textArea} placeholder="Website Description.."></textarea>
                        </div>

                        <div className={styles.actions}>
                            <button onClick={publishWebsite} className={`button ${styles.publish}`}>Publish</button>
                            <button onClick={closePublish} className={`button ${styles.discard}`}>Discard</button>
                        </div>
                    </div>
                </div>

                <div ref={previewRef} className={`${styles.publishPreview} ${styles.slideOut}`}>
                    <h1 className={styles.title}>Preview</h1>
                    <i onClick={togglePreview} className={`fas fa-info-circle ${styles.titleIcon}`}></i>

                    <div className={styles.preview}>
                        <div className={styles.previewHeader}>
                            <img onClick={() => navigateToWebsite(websiteURL)} className={styles.image} src="/thumbnailPlaceholder.png" alt="Website Preview" />
                        </div>

                        <div className={styles.previewDetails}>
                            <h1 className={styles.previewTitle}>{websiteName || `${localUsername}'s website`}</h1>
                            <p className={styles.previewDescription}>{websiteDescription || 'Website Description'}</p>

                            <div className={styles.previewOwner}>
                                <img className={styles.profilePicture} src={`${profilePicture}.png`} alt={`${localUsername}'s profile picture`} />
                                <p className={styles.ownerName}>{localUsername}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
        </>
    )
}

export default PublishWebsite;