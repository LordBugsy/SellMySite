import { useEffect, useState, useRef } from "react";
import styles from './Header.module.scss';
import { useDispatch, useSelector } from "react-redux";
import { setLoginSignupShown, setSearchQueryShown, setContactFormShown, setNotificationShown } from "../Redux/store";
import LoginSignup from "../LoginSignup/LoginSignup";
import Contact from "../Contact Component/Contact.jsx";
import Search from "../Search Component/Search.jsx";
import Notifications from "../Notifications Component/Notifications.jsx";
import { useNavigate } from "react-router-dom";

const Header = () => {
    // Redux
    const dispatch = useDispatch();

    const isLoginSignupShown = useSelector(state => state.loginSignup.isLoginSignupShown);
    const isContactFormShown = useSelector(state => state.contactForm.isContactFormShown);
    const isSearchQueryShown = useSelector(state => state.search.isSearchQueryShown);
    const isNotificationShown = useSelector(state => state.notification.isNotificationShown);

    const { localUserId, localUsername, profilePicture, role } = useSelector(state => state.user.user);

    // React
    const navigate = useNavigate();
    const asideRef = useRef();
    const headerRef = useRef();

    const [isAsideShown, updateAsideState] = useState(false);

    const toggleAsideState = () => {
        updateAsideState(!isAsideShown);
    }

    const toggleSignup = () => {
        dispatch(setLoginSignupShown(!isLoginSignupShown));
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (asideRef.current && headerRef.current && !asideRef.current.contains(event.target) && !headerRef.current.contains(event.target) && isAsideShown) {
                toggleAsideState();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAsideShown]);

    const navigateToComponent = (targetComp) => {
        navigate(targetComp);
        toggleAsideState();
    }

    return (
        <>
            {/* Header */}
            <header ref={headerRef} className={`${styles.headerContainer} `}>
                <nav className={styles.nav}>
                    
                    <div className={styles.navLinks}>

                        <div className={styles.leftNavLinks}>
                            {localUserId && <i className={`${styles.icon} fa-solid fa-bars`} onClick={toggleAsideState}></i>}
                            <h1 onClick={() => navigate('/')} className={`logo ${styles.interact}`}>SellMySite</h1>

                            <div onClick={() => dispatch(setSearchQueryShown(true))} className={styles.tooltip}>
                                <i className={`${styles.icon} fa-solid fa-search`}></i>
                                <span className={styles.tooltipText}>Search</span>
                            </div>
                        </div>

                        <div className={styles.rightNavLinks}>
                            <div onClick={() => dispatch(setNotificationShown(!isNotificationShown))} className={styles.tooltip}>
                                <i className={`${styles.icon} fa-solid fa-bell`}></i>
                                <span className={styles.tooltipText}>Notifications</span>
                            </div>

                            <div onClick={() => navigate('/messages')} className={styles.tooltip}>
                                <i className={`${styles.icon} fa-solid fa-envelope`}></i>
                                <span className={styles.tooltipText}>Private Messages</span>
                            </div>

                            <div className={styles.tooltip}>
                                <a href="https://github.com/LordBugsy/Projectarium" target="_blank" rel="noreferrer">
                                    <i className={`${styles.icon} fa-brands fa-github`}></i>
                                    <span className={styles.tooltipText}>GitHub Repo</span>
                                </a>
                            </div>

                            <div onClick={() => navigate('/settings')} className={styles.tooltip}>
                                <i className={`${styles.icon} ${styles.settingsIcon} fa-solid fa-cog`}></i>
                                <span className={styles.tooltipText}>Settings</span>
                            </div>

                            {!localUserId && <div className={styles.controls}>                                
                                <div className={styles.tooltip}>
                                    <i onClick={toggleSignup} className={`${styles.icon} fa-solid fa-right-to-bracket`}></i>
                                    <span className={styles.tooltipText}>
                                        {/* logic to show login or signup, for now its only signup */}
                                        Sign Up
                                    </span>
                                </div>
                            </div>}
                        </div>

                    </div>

                </nav>
            </header>

            {/* Login/Signup */}
            {isLoginSignupShown && <LoginSignup />}

            {/* Aside */}
            <aside ref={asideRef} className={`${styles.asideContainer} ${isAsideShown ? styles.showAside : styles.hideAside}`}>
                <div className={styles.asideContent}>
                    <div className={styles.profilePicture}>
                        <img src={`/${profilePicture}.png`} className={styles.profilePicture} alt='Profile Picture' />
                        <i className={`${styles.icon} fa-solid fa-pencil-alt`}></i>
                    </div>

                    <div className={styles.asideRedirects}>
                        <p onClick={() => navigateToComponent(`/profile/${localUsername}`)} className={styles.redirect}>View Profile</p>
                        <p onClick={() => navigateToComponent('/shop')} className={styles.redirect}>SiteTokens</p>
                        <p onClick={() => navigateToComponent('/auctions')} className={styles.redirect}>Auctions</p>
                        <p onClick={() => navigateToComponent('/settings')} className={styles.redirect}>Settings</p>
                        <p onClick={() => navigateToComponent('/redeem')} className={styles.redirect}>Redeem</p>
                        <p onClick={() => dispatch(setContactFormShown(true))} className={styles.redirect}>Contact</p>
                        { role === "admin" && <p className={styles.redirect}>Admin Panel</p> }
                    </div>

                    <div className={styles.asideFooter}>
                        <p className={styles.redirect}>Terms of Service</p>
                        <p className={styles.redirect}>Privacy Policy</p>
                    </div>

                </div>
            </aside>

            {isContactFormShown && <Contact />}
            {isSearchQueryShown && <Search />}
            { isNotificationShown && <Notifications />}
            
        </>
    )
}

export default Header;