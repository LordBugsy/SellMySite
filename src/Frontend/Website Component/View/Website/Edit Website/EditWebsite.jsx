import { useEffect, useRef, useState } from 'react';
import styles from './EditWebsite.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setLoginSignupShown, setEditWebsiteShown } from '../../../../Redux/store';

const EditWebsite = (props) => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isEditWebsiteShown } = useSelector(state => state.editWebsite);
    const dispatch = useDispatch();

    // React
    const [tab, updateTab] = useState("General"); // General, Sell & Auction, Delete

    const containerRef = useRef(null);

    const newTitleRef = useRef(null);
    const newDescriptionRef = useRef(null);
    const newLinkRef = useRef(null);

    const newPriceRef = useRef(null);
    // const newAuctionRef = useRef(null);

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

    return (
        <>
            {isEditWebsiteShown && (
                <div className={`${styles.editContainer} fadeIn`} ref={containerRef}>
                    <p className='title'>{props.targetName} settings</p>
                    <div className={styles.editWebsite}>
                        <i  className={`fas fa-times ${styles.icon}`} onClick={closeContainer}></i>
                        <div className={styles.tabs}>
                            <div className={`${styles.tab} ${tab === "General" ? styles.active : ""}`} onClick={() => updateTab("General")}>General</div>
                            <div className={`${styles.tab} ${tab === "Sell & Auction" ? styles.active : ""}`} onClick={() => updateTab("Sell & Auction")}>Sell & Auction</div>
                            <div className={`${styles.tab} ${tab === "Delete" ? styles.active : ""}`} onClick={() => updateTab("Delete")}>Delete</div>
                        </div>
                        <div className={styles.tabContent}>
                            { tab === "General" && (
                                <div className={styles.tabEdit}>
                                    <p className='title'>Website Title</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-globe`}></i>
                                        <input className={styles.input} type="text" placeholder="New website title.." />
                                    </div>

                                    <p className='title'>Edit Website Description</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-info-circle`}></i>
                                        <textarea className={styles.textArea} placeholder="New website description.."></textarea>
                                    </div>

                                    <p className='title'>Edit Website Link</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-link`}></i>
                                        <input className={styles.input} type="text" placeholder="New website link.." />
                                    </div>

                                    <div className={styles.buttonContainer}>
                                        <button className={`button ${styles.save}`}>Save</button>
                                    </div>
                                </div>
                            )}

                            { tab === "Sell & Auction" && (
                                <div className={styles.tabEdit}>
                                    <p className='title'>Sell Website</p>
                                    <div className={styles.inputContainer}>
                                        <i className={`${styles.icon} fas fa-dollar-sign`}></i>
                                        <input className={styles.input} type="number" placeholder="Price.." />
                                    </div>

                                    <div className={styles.buttonContainer}>
                                        <button className={`button ${styles.sell}`}>Sell</button>
                                    </div>

                                    <p className='title'>Auction Website</p>
                                    <p className={styles.information}>
                                        WIP. Auctions are not available yet.
                                    </p>
                                </div>
                            )}

                            { tab === "Delete" && (
                                <div className={styles.tabEdit}>
                                    <p className='title'>Delete Website</p>
                                    <p className={styles.information}>
                                        Are you sure you want to delete this website? This action cannot be undone.
                                    </p>

                                    <div className={styles.buttonContainer}>
                                        <button className={`button ${styles.delete}`}>Delete</button>
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
