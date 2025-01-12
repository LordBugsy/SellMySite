import { useEffect, useRef, useState } from 'react';
import styles from './EditWebsite.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setEditWebsiteShown } from '../../../../Redux/store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditWebsite = (props) => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isEditWebsiteShown } = useSelector(state => state.editWebsite);
    const dispatch = useDispatch();

    // React
    const navigate = useNavigate();
    const [tab, updateTab] = useState("General"); // General, Sell & Auction, Delete

    const containerRef = useRef(null);

    const newTitleRef = useRef(null);
    const newDescriptionRef = useRef(null);
    const newLinkRef = useRef(null);

    const newPriceRef = useRef(null);
    // const newAuctionRef = useRef(null);

    const editTitle = async () => {
        if (!newTitleRef.current.value) return;

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/edit/title`, {
                websiteID: props.targetID,
                newTitle: newTitleRef.current.value.trim(),
                userID: localUserId
            });
        }

        catch (error) {
            console.error(error);
        }
    }

    const editDescription = async () => {
        if (!newDescriptionRef.current.value) return;

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/edit/description`, {
                websiteID: props.targetID,
                newDescription: newDescriptionRef.current.value.trim(),
                userID: localUserId
            });
        }

        catch (error) {
            console.error(error);
        }
    }

    const editLink = async () => {
        if (!newLinkRef.current.value) return;

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/edit/link`, {
                websiteID: props.targetID,
                newLink: newLinkRef.current.value.trim(),
                userID: localUserId
            });
        }

        catch (error) {
            console.error(error);
        }
    }

    const editChanges = async () => {
        if (!newTitleRef.current.value && !newDescriptionRef.current.value && !newLinkRef.current.value) return;

        editTitle();
        editDescription();
        editLink();
        closeContainer();
    }

    const sellWebsite = async () => {
        if (!newPriceRef.current.value) return;

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/edit/price`, {
                websiteID: props.targetID,
                newPrice: newPriceRef.current.value,
                userID: localUserId
            });
        }

        catch (error) {
            console.error(error);
        }
    }

    const deleteWebsite = async () => {
        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/delete`, {
                websiteID: props.targetID,
                userID: localUserId
            });

            navigate('/');
        }

        catch (error) {
            console.error(error);
        }
    }

    const closeContainer = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace("fadeIn", "fadeOut");
            setTimeout(() => {
                dispatch(setEditWebsiteShown(false));
            }, 500);
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!props.targetName || !props.targetID) closeContainer();
    }, []);

    return (
        <>
            {isEditWebsiteShown && (
                <div className={`${styles.editContainer} fadeIn`} ref={containerRef}>
                    <p className={`title ${styles.displayed}`}>{props.targetName} settings</p>
                    <div className={styles.editWebsite}>
                        <p className={`title ${styles.hidden}`}>{props.targetName} settings</p>
                        <i  className={`fas fa-times ${styles.icon}`} onClick={closeContainer}></i>
                        <div className={styles.tabs}>
                            <div className={`${styles.tab} ${tab === "General" ? styles.active : ""}`} onClick={() => updateTab("General")}>General</div>
                            <div className={`${styles.tab} ${tab === "Sell & Auction" ? styles.active : ""}`} onClick={() => updateTab("Sell & Auction")}>Sell & Auction</div>
                            <div className={`${styles.tab} ${tab === "Delete" ? styles.active : ""}`} onClick={() => updateTab("Delete")}>Delete</div>
                        </div>
                        <div className={styles.tabContent}>
                            { tab === "General" && (
                                <div className={`${styles.tabEdit} fadeIn`}>
                                    <p className='title'>Website Title</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-globe`}></i>
                                        <input ref={newTitleRef} maxLength='20' className={styles.input} type="text" placeholder="New website title.." />
                                    </div>

                                    <p className='title'>Edit Website Description</p>
                                    <div className={styles.textAreaContainer}>
                                        <i className={`${styles.icon} fas fa-info-circle`}></i>
                                        <textarea ref={newDescriptionRef} maxLength='120' className={styles.textArea} placeholder="New website description.."></textarea>
                                    </div>

                                    <p className='title'>Edit Website Link</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-link`}></i>
                                        <input ref={newLinkRef} className={styles.input} type="text" placeholder="New website link.." />
                                    </div>

                                    <div className={styles.buttonContainer}>
                                        <button onClick={editChanges} className={`button ${styles.save}`}>Save</button>
                                    </div>
                                </div>
                            )}

                            { tab === "Sell & Auction" && (
                                <div className={`${styles.tabEdit} fadeIn`}>
                                    <p className='title'>Sell Website</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-dollar-sign`}></i>
                                        <input ref={newPriceRef} className={styles.input} type="number" placeholder="Price.." />
                                    </div>

                                    <div className={styles.buttonContainer}>
                                        <button onClick={sellWebsite} className={`button ${styles.sell}`}>Sell</button>
                                    </div>

                                    <p className='title'>Auction Website</p>
                                    <p className={styles.information}>
                                        WIP. Auctions are not available yet.
                                    </p>
                                </div>
                            )}

                            { tab === "Delete" && (
                                <div className={`${styles.tabEdit} fadeIn`}>
                                    <p className='title'>Delete Website</p>
                                    <p className={styles.information}>
                                        Are you sure you want to delete this website? This action cannot be undone.
                                    </p>

                                    <div className={styles.buttonContainer}>
                                        <button onClick={deleteWebsite} className={`button ${styles.delete}`}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EditWebsite;
