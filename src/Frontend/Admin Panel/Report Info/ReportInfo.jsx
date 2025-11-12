import styles from './ReportInfo.module.scss';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Loading from '../../Loading/Loading';
import { useSelector, useDispatch } from 'react-redux';
import { setAdminReportFormShown } from '../../Redux/store';
import { useNavigate } from 'react-router-dom';

const ReportInfo = (props) => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isAdminReportFormShown } = useSelector(state => state.adminReportForm);
    const dispatch = useDispatch();
    
    // React
    const navigate = useNavigate();

    const [isLoading, updateLoadingState] = useState(false);
    const [isLoadingWithinComponent, updateLoadingWithinComponent] = useState(false); // I have officially ran out of names for states
    const [banFormShown, updateBanFormShown] = useState(false);
    const [action, updateAction] = useState("Default"); 

    const containerRef = useRef(null);
    const banReasonRef = useRef(null);
    const passwordRef = useRef(null);

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setAdminReportFormShown(false));
        }, 300);
    }

    const closeContainerAfterAction = () => {
        closeContainer();
        navigate('/');
    }

    const deleteTarget = async () => {
        updateLoadingWithinComponent(true);

        if (props.websiteProp) {
            try {
                const backendReponse = await axios.post(`http://localhost:5172/website/delete`, {
                    userID: localUserId,
                    websiteID: props.websiteProp._id
                });
            }
    
            catch (error) {
                // console.error(error);
            }
        }

        else if (props.postProp) {
            try {
                const backendReponse = await axios.post(`http://localhost:5172/post/delete`, {
                    userID: localUserId,
                    postID: props.postProp._id
                });
            }

            catch (error) {
                // console.error(error);
            }
        }

        updateLoadingWithinComponent(false);
        updateAction("Delete");
    }

    const banUser = async () => {
        updateLoadingWithinComponent(true);

        if (props.websiteProp) {
            try {
                const backendResponse = await axios.post(`http://localhost:5172/user/ban`, {
                    userID: props.websiteProp.owner._id,
                    adminID: localUserId,
                    reason: banReasonRef.current.value,
                    password: passwordRef.current.value
                });
            }

            catch (error) {
                // console.error(error);
            }
            
            finally {
                updateLoadingWithinComponent(false);
            }
        }

        else if (props.postProp) {
            try {
                const backendResponse = await axios.post(`http://localhost:5172/user/ban`, {
                    userID: props.postProp.owner._id,
                    adminID: localUserId,
                    reason: banReasonRef.current.value,
                    password: passwordRef.current.value
                });
            }

            catch (error) {
                // console.error(error);
            }

            finally {
                updateLoadingWithinComponent(false);
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);



    return (
        <>
            {isAdminReportFormShown && (
                <div ref={containerRef} className={`${styles.reportInfoContainer} fadeIn`}>
                    <div className={styles.reportInfo}>
                        <i onClick={closeContainer} className={`fas fa-times ${styles.icon} ${styles.right}`}></i>
                        {banFormShown && <i onClick={() => updateBanFormShown(false)} className={`fas fa-arrow-left ${styles.icon} ${styles.left}`}></i>}

                        <div className={styles.defendantActions}>
                            <>
                                {isLoading && <Loading componentClass />}
                                {!isLoading && (
                                    <>
                                        {action === "Default" && (
                                            <>
                                                <p className='title'>Action against {`${props.websiteTitle || `the ${props.defendant}`}`}</p>
                                                <p className={styles.information}>What action should be taken?</p>

                                                <div className={styles.buttonsContainer}>
                                                    <button onClick={deleteTarget} className={`button ${styles.delete}`}>Delete</button>
                                                    <button onClick={closeContainer} className={`button ${styles.dismiss}`}>Dismiss</button>
                                                </div>

                                                <p className={styles.mainInformation}> {/* yeah idk what to call this class */}
                                                    This action will be irreversible. You can decide on the punishment the owner of the {props.defendant.toLowerCase()} will receive if you choose to delete it.
                                                </p>

                                                {isLoadingWithinComponent && <Loading />}
                                            </>
                                        )}

                                        {action === "Delete" && (
                                            <>
                                                {!banFormShown && (
                                                    <>
                                                        <p className={styles.afterInformation}>
                                                            The {props.defendant.toLowerCase()} was successfully deleted. Would you like to take any further action?
                                                        </p>

                                                        <div className={styles.buttonsContainer}>
                                                            <button onClick={() => updateBanFormShown(true)} className={`button ${styles.ban}`}>Ban</button>
                                                            <button onClick={closeContainerAfterAction} className={`button ${styles.dismiss}`}>Dismiss</button>
                                                        </div>
                                                    </>
                                                )}

                                                {banFormShown && (
                                                    <>
                                                        {isLoadingWithinComponent && <Loading />}
                                                        <p className={styles.mainInformation}>What is the reason for banning the user?</p>
                                                        <textarea ref={banReasonRef} className={styles.textArea} placeholder='Reason for banning the user..' />
                                                        <input ref={passwordRef} className={styles.input} type='password' placeholder='To confirm your identity, please enter your password..' />

                                                        <div className={styles.buttonsContainer}>
                                                            <button onClick={banUser} className={`button ${styles.ban}`}>Ban</button>
                                                            <button onClick={closeContainerAfterAction} className={`button ${styles.dismiss}`}>Cancel</button>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ReportInfo;