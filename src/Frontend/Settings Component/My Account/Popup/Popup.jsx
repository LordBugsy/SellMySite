import styles from './Popup.module.scss';
import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccountSettingsShown } from '../../../Redux/store';

const Popup = (props) => {
    // Redux
    const { localUsername, localUserId } = useSelector(state => state.user.user);
    const { isAccountSettingsShown } = useSelector(state => state.accountSettings);
    const dispatch = useDispatch();

    // React
    const [errorDetected, updateErrorState] = useState(false);
    const [backendMessage, updateBackendMessage] = useState('');

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const currentPassword = useRef(null);
    const newPassword = useRef(null);

    const closePopup = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('fadeIn', 'fadeOut');

            setTimeout(() => {
                dispatch(setAccountSettingsShown(false));
            }, 500);
        }
    }

    const changePassword = async () => {
        updateBackendMessage("");
        updateErrorState(false);

        try {
            const backendResponse = await axios.post("http://localhost:5172/user/password", {
                userID: localUserId,
                currentPassword: currentPassword.current.value,
                newPassword: newPassword.current.value
            });

            console.log(backendResponse.data);
            updateBackendMessage(backendResponse.data.message);

        }

        catch (error) {
            console.error(error);
            updateErrorState(true);
            updateBackendMessage("An error occurred. Please try again later.");
        }
    }

    useEffect(() => {
        const handleInput = () => {
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 335)}px`;
            }
        };

        const textArea = inputRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && event.target === containerRef.current) closePopup();
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    return (
        <>
            { isAccountSettingsShown && 
                <div ref={containerRef} className={`${styles.popupContainer} fadeIn`}>
                    <div className={styles.popup}>
                        {props.changingFor != "Delete" && props.changingFor != "Password" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Changing {props.changingFor}</h1>
    
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}> New {props.changingFor} for <span className={styles.username}>{localUsername}</span>:</p>
                                    {props.changingFor !== "Description" && (
                                        <input 
                                            ref={inputRef} 
                                            name='input' 
                                            type='text' 
                                            maxLength='18' 
                                            className={`${styles.input}`} 
                                            placeholder={`Enter your new ${props.changingFor}`} 
                                        />
                                    )}

                                    {props.changingFor === "Description" && (
                                        <textarea 
                                            ref={inputRef} 
                                            name='textArea' 
                                            maxLength='360' 
                                            className={`${styles.textArea}`} 
                                            placeholder={`Enter your new ${props.changingFor}`}
                                        />
                                    )}
                                </div>
    
                                <button 
                                    disabled={props.changingFor === "Username" && props.data.credits < 100} 
                                    className={`${styles.button} ${props.changingFor === "Username" && props.data.credits < 100 ? styles.disabled : styles.save}`}
                                >
                                    {props.changingFor === "Username" ? (
                                        props.data.credits >= 100 ? (
                                            <>
                                                Save <i className={`fa-solid fa-coins ${styles.icon}`}></i>
                                            </>
                                        ) : (
                                            <>
                                                Not enough credits <i className={`fa-solid fa-coins ${styles.icon}`}></i>
                                            </>
                                        )
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                                {errorDetected && <p className={styles.error}>Username is already taken.</p>}
                            </>
                        )}

                        {props.changingFor === "Delete" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Delete Account</h1>
                                <p className={styles.warning}>Are you sure you want to delete your account? This action cannot be undone.</p>
                                <div className={styles.controls}>
                                    <button onClick={() => console.log("Testing")} className={`${styles.button} ${styles.delete}`}>Delete</button>
                                </div>
                            </>
                        )}

                        {props.changingFor === "Password" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Change Password</h1>
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}>Current Password:</p>
                                    <input ref={currentPassword} name='currentPassword' type='password' className={`${styles.input}`} placeholder='Enter your current password' />
                                </div>
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}>New Password:</p>
                                    <input ref={newPassword} name='newPassword' type='password' className={`${styles.input}`} placeholder='Enter your new password' />
                                </div>

                                <p className={styles.warning}>An administrator will never ask to change your password. Keep your account safe and never share your password.</p>
                                <div className={styles.controls}>
                                    <button onClick={closePopup} className={`${styles.button} ${styles.delete}`}>Cancel</button>
                                    <button onClick={() => console.log("testing")} className={`${styles.button} ${styles.save}`}>Save</button>
                                </div>
                                {!errorDetected && backendMessage && <p className={styles.success}>{backendMessage}</p>}
                                {errorDetected && backendMessage && <p className={styles.error}>{backendMessage}</p>}
                                {errorDetected && <p className={styles.error}>The current password is incorrect.</p>}
                            </>
                        )}
                    </div>
                </div>
            }
        </>
    );
};

export default Popup;