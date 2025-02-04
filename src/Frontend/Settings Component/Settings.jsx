import MyAccount from './My Account/MyAccount';
import TermsOfService from './ToS PrvcyPlcy/TermsOfService.jsx';
import PrivacyPolicy from './ToS PrvcyPlcy/PrivacyPolicy';
import { useDispatch } from 'react-redux';
import { setAnnouncementShown, setHasReadTheAnnouncement } from '../Redux/store';
import styles from './Settings.module.scss';
import { useEffect, useState } from 'react';

const Settings = () => {
    // Redux
    const dispatch = useDispatch();

    // React
    const [settingsTab, setSettingsTab] = useState('My Account'); // The tabs will be 'My Account', 'Delete Account' and 'Terms of Service' for now
    const [areTabsVisible, setTabsVisibility] = useState(false); // Show the settings tabs (mobile only)

    useEffect(() => {
        document.title = "Settings - SellMySite";
    }, []);

    const loadTab = (tab) => {
        setSettingsTab(tab);
        setTabsVisibility(false);
    }

    const openAnnouncement = () => {
        dispatch(setAnnouncementShown(true));
        dispatch(setHasReadTheAnnouncement(false));
    }

    return (
        <div className={`${styles.messagesContainer} fadeIn`}>
            <div className={`${styles.messageRecipient} ${areTabsVisible ? styles.shown : styles.hidden}`}>
                <div className={styles.messageHeader}>
                    <p onClick={() => loadTab("My Account")} className={`${styles.settingsTab} ${settingsTab === "My Account" ? styles.selected : ''}`}>My Account</p>
                    <p onClick={() => loadTab("Terms of Service")} className={`${styles.settingsTab} ${settingsTab === "Terms of Service" ? styles.selected : ''}`}>Terms of Service</p>
                    <p onClick={() => loadTab("Privacy Policy")} className={`${styles.settingsTab} ${settingsTab === "Privacy Policy" ? styles.selected : ''}`}>Privacy Policy</p>
                    <p onClick={openAnnouncement} className={styles.settingsTab}>Read last Announcement</p>
                </div>
            </div>

            <div className={styles.rightSide}>
                <i onClick={() => setTabsVisibility(!areTabsVisible)} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>

                {settingsTab === "My Account" && <MyAccount />}
                {settingsTab === "Terms of Service"  && <TermsOfService />}
                {settingsTab === "Privacy Policy" && <PrivacyPolicy />}
            </div>
        </div>
    );
}

export default Settings;