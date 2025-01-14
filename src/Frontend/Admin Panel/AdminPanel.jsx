import { useSelector, useDispatch } from 'react-redux';
import styles from './AdminPanel.module.scss';
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { setAdminPanelShown } from '../Redux/store';

const AdminPanel = () => {
    // Redux
    const dispatch = useDispatch();
    const { localUserId, localUsername } = useSelector(state => state.user.user);
    const { isAdminPanelShown } = useSelector(state => state.adminPanel);
    
    // React
    const [selectedTab, updateSelectedTab] = useState("Reports"); // Reports, Add Codes, Announcement, Support
    const [actionState, updateActionState] = useState(""); // Success, Error
    const [reportsArray, updateReportsArray] = useState([]);
    const [codesArray, updateCodesArray] = useState([]);

    const adminContainerRef = useRef(null);
    const textAreaRef = useRef(null);
    const passwordRef = useRef(null);

    const closeContainer = () => {
        if (adminContainerRef.current) {
            adminContainerRef.current.classList.replace('growIn', 'growOut');

            setTimeout(() => {
                dispatch(setAdminPanelShown(false));
            }, 300);
        }
    }

    const sendAnnouncement = async () => {
        updateActionState("");
        if (textAreaRef.current && textAreaRef.current.value.trim() === "") return;

        if (textAreaRef.current) {
            const announcement = textAreaRef.current.value;

            try {
                const backendResponse = await axios.post("http://localhost:5172/announcement/create", {
                    content: announcement,
                    madeBy: localUserId,
                    password: passwordRef.current.value,
                });

                textAreaRef.current.value = "";
                updateActionState("Success");
            }

            catch (error) {
                console.error(error);
                updateActionState("Error");
            }
        }
    }

    useEffect(() => {
        if (!localUserId) dispatch(setAdminPanelShown(false));
    }, []);

    return (
        <> 
            {isAdminPanelShown && (
                <div ref={adminContainerRef} className={`${styles.adminPanelContainer} growIn`}>
                    <div className={styles.widthTooLow}>
                        <p>Your screen width is too low to display the Admin Panel. Please monitor from a larger screen or from the database.</p>

                        <button onClick={closeContainer} className={`button ${styles.close}`}>Close</button>
                    </div>

                    <div className={styles.adminPanel}>
                        <i onClick={closeContainer} className={`fas fa-times ${styles.icon}`}></i>
                        <div className={styles.header}>
                            <p className={styles.title}>Admin Panel</p>
                            <p className={styles.title}>Logged in as <span className={styles.username}>{localUsername}</span></p>
                        </div>

                        <div className={styles.options}>
                            <div className={styles.tabs}>
                                <p onClick={() => updateSelectedTab("Reports")} className={`${styles.tab} ${selectedTab === "Reports" ? styles.selected : ""}`}>Reports</p>
                                <p onClick={() => updateSelectedTab("Add Codes")} className={`${styles.tab} ${selectedTab === "Add Codes" ? styles.selected : ""}`}>Add Codes</p>
                                <p onClick={() => updateSelectedTab("Announcement")} className={`${styles.tab} ${selectedTab === "Announcement" ? styles.selected : ""}`}>Announcement</p>
                                <p onClick={() => updateSelectedTab("Support")} className={`${styles.tab} ${selectedTab === "Support" ? styles.selected : ""}`}>Support</p>
                            </div>

                            <div className={styles.contentContainer}>
                                <p className='title'>{selectedTab} Panel</p>

                                <div className={styles.content}>
                                    {selectedTab === "Reports" && (
                                        <>
                                            <p className={styles.title}>There are currently <span className={styles.reportsLength}>{reportsArray.length}</span> reports</p>
                                            <div className={styles.selectedTab}>
                                        
                                                <div className={styles.reports}>
                                                    {reportsArray.length === 0 ? 
                                                    ( <p className={styles.noReports}>No reports to show!</p>) 
                                                    : reportsArray.map((report, index) => (
                                                        <div key={index} className={styles.report}>
                                                            <p className={styles.reporter}>{report.reporter}</p>
                                                            <p className={styles.reason}>{report.reason}</p>
                                                            <p className={styles.date}>{report.date}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedTab === "Add Codes" && (
                                        <>
                                            <p className={styles.title}>Add Codes Panel</p>
                                            <div className={styles.selectedTab}>
                                                <p className={styles.noReports}>No codes to show!</p>
                                            </div>
                                        </>
                                    )}

                                    {selectedTab === "Announcement" && (
                                        <>
                                            <p className={styles.title}>Make an announcement here, it will be shown to all users. The usage of Markdown is needed.</p>
                                            <div className={styles.selectedTab}>
                                                <div className={styles.announcement}>
                                                    <textarea ref={textAreaRef} className={styles.textArea} placeholder="Write your announcement here.."></textarea>
                                                    <input ref={passwordRef} type='password' className={styles.input} placeholder="To confirm your identity, please enter your password.." />
                                                    <button onClick={sendAnnouncement} className={`button ${styles.submit}`}>Submit</button>
                                                    {actionState === "Error" && (
                                                        <p className={styles.error}>An error occurred while sending the announcement. Please try again.</p>
                                                    )}
                                                    {actionState === "Success" && (
                                                        <p className={styles.success}>Announcement sent successfully!</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminPanel;