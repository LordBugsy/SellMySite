import { useSelector, useDispatch } from 'react-redux';
import styles from './AdminPanel.module.scss';
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { setAdminPanelShown } from '../Redux/store';
import Loading from '../Loading/Loading';

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
    const [isLoading, updateIsLoading] = useState(true);

    const adminContainerRef = useRef(null);
    const passwordRef = useRef(null);

    // Announcements
    const textAreaRef = useRef(null);

    // Add Codes
    const codeRef = useRef(null);
    const maxUsesRef = useRef(null);
    const codeValueRef = useRef(null);

    const closeContainer = () => {
        if (adminContainerRef.current) {
            adminContainerRef.current.classList.replace('growIn', 'growOut');

            setTimeout(() => {
                dispatch(setAdminPanelShown(false));
            }, 300);
        }
    }

    const createCode = async () => {
        updateActionState("");
        if (!/^[A-Z]{3}[0-9]{2}-[A-Z]{3}[0-9]{3}-[A-Z]{3}$/.test(codeRef.current.value)) {
            updateActionState("ErrorCode");
            return;
        }

        try {
            const backendResponse = await axios.post("http://localhost:5172/code/create", {
                code: codeRef.current.value,
                maxUses: Number(maxUsesRef.current.value) || 999999,
                value: Number(codeValueRef.current.value),
                userID: localUserId,
                password: passwordRef.current.value,
            });

            codeRef.current.value = "";
            maxUsesRef.current.value = "";
            codeValueRef.current.value = "";
            updateActionState("SuccessCode");
        }

        catch (error) {
            console.error(error);
            updateActionState("Error");
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

    const resolveReport = async (reportID) => {
        updateActionState("");

        try {
            // Resolving a report doesn't mean that the user has been punished. It just means that the report has been resolved and no further action is needed.
            const backendResponse = await axios.post(`http://localhost:5172/report/resolve`, {
                id: reportID,
                resolvedBy: localUserId,
            });
        }

        catch (error) {
            console.error(error);
            updateActionState("Error");
        }

        finally {
            fetchReports();
        }
    }

    const fetchReports = async () => {
        updateActionState("");
        updateReportsArray([]);
        updateIsLoading(true);

        if (!localUserId) {
            updateIsLoading(false);
            dispatch(setAdminPanelShown(false));
            return;
        }

        try {
            const backendResponse = await axios.get("http://localhost:5172/report/pending");
            updateReportsArray(backendResponse.data);
        }

        catch (error) {
            console.error(error);
            updateActionState("Error");
        }

        finally {
            updateIsLoading(false);
        }
    }

    const viewReport = (type, username, publicID) => {
        if (type === "Post") window.open(`/post/${username}/${publicID}`, '_blank', 'noopener,noreferrer');
        else if (type === "Website") window.open(`/website/${username}/${publicID}`, '_blank', 'noopener,noreferrer');
        else if (type === "User") window.open(`/profile/${username}`, '_blank', 'noopener,noreferrer');
    }
    
    useEffect(() => {
        fetchReports();
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
                                            <p className={styles.title}>{ reportsArray.length > 1 ? (
                                                <>There are currently <span className={styles.reportsLength}>{reportsArray.length}</span> unresolved reports</>
                                            ) : (
                                                <>There is currently <span className={styles.reportsLength}>{reportsArray.length}</span> unresolved report</>
                                            )}</p>
                                            <div className={styles.selectedTab}>
                                        
                                                <div className={styles.reports}>
                                                    {isLoading && <Loading componentClass />}
                                                    {!isLoading && reportsArray.length === 0 ? 
                                                    ( <p className={styles.noReports}>No reports to show!</p>) 
                                                    : reportsArray.map((report, index) => (
                                                        <div key={index} className={styles.report}>
                                                            <div className={styles.reportHeader}>
                                                                <p className={styles.reportTitle}>Report #{index + 1}</p>
                                                            </div>

                                                            <div className={styles.reportInformation}>
                                                                <p className={styles.reportType}>
                                                                    Type: "{report.reportedTarget}" <br /> 
                                                                    Mongo ID: {report.targetID} <br />
                                                                    {report.reportedTarget} owner: {report.owner} <br />
                                                                    PublicID: {report.publicID}
                                                                </p>
                                                            </div>
                                                            <p className={styles.reportReason}>Reason: {report.reason}</p>

                                                            <div className={styles.reportActions}>
                                                                <i className={`fas fa-check ${styles.icon}`} onClick={() => resolveReport(report._id)} title="Resolve"></i>
                                                                <i className={`fas fa-eye ${styles.icon}`} onClick={() => viewReport(report.reportedTarget, report.owner, report.publicID)} title="View"></i>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedTab === "Add Codes" && (
                                        <>
                                            <p className={styles.title}>Add codes here, they will be used by all users.</p>
                                            <div className={styles.selectedTab}>
                                                <div className={styles.textInputContainer}>
                                                    <div className={styles.inputGroup}>
                                                        <p className={styles.title}>Enter your code here:</p>
                                                        <input ref={codeRef} type='text' className={styles.input} placeholder="Enter your code here.." />
                                                    </div>
                                                    
                                                    <div className={styles.inputGroup}>
                                                        <p className={styles.title}>Max uses of the code: (By default, infinite)</p>
                                                        <input ref={maxUsesRef} type='number' className={styles.input} placeholder="Max uses of the code.." />
                                                    </div>

                                                    <div className={styles.inputGroup}>
                                                        <p className={styles.title}>Value of the code:</p>
                                                        <input ref={codeValueRef} type='number' className={styles.input} placeholder="Value of the code.." />
                                                    </div>

                                                    <div className={styles.inputGroup}>
                                                        <p className={styles.title}>To confirm your identity, please enter your password:</p>
                                                        <input ref={passwordRef} type='password' className={styles.input} placeholder="Password..." />
                                                    </div>

                                                    <button onClick={createCode} className={`button ${styles.submit}`}>Submit</button>

                                                    {actionState === "ErrorCode" && <p className={styles.title}>Your code must follow the format: <span className={styles.codeFormat}>ABC12-DEF345-XYZ</span></p>}
                                                    {actionState === "Error" && <p className={styles.error}>An error occurred while adding the code. Open the console for more info.</p>}
                                                    {actionState === "SuccessCode" && <p className={styles.success}>Code added successfully!</p>}
                                                </div>
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
                                                        <p className={styles.error}>An error occurred while sending the announcement. Open the console for more info.</p>
                                                    )}
                                                    {actionState === "Success" && (
                                                        <p className={styles.success}>Announcement sent successfully!</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedTab === "Support" && (
                                        <>
                                            <p className={styles.title}>Here are the support messages sent by users.</p>
                                            <div className={styles.selectedTab}>
                                                <p className={styles.title}>
                                                    There are currently 0 support messages.
                                                    {/* While programming this part, I realised that messages should be sent via mail, not through the website. */}
                                                </p>
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