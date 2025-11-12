import styles from './Redeem.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loading from '../Loading/Loading';

const Redeem = () => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // Redux
    const { localUserId } = useSelector(state => state.user.user);

    // React
    const inputRef = useRef();
    const navigate = useNavigate();
    
    const [invalidCode, updateInvalidCode] = useState(false);
    const [backendData, updateBackendResponse] = useState("");
    const [isLoading, updateIsLoading] = useState(false);

    useEffect(() => {
        document.title = "Redeem Code - SellMySite";
    }, []);

    const redeemCode = async () => {
        updateIsLoading(true);
        updateBackendResponse("");
        if (!/^[A-Z]{3}[0-9]{2}-[A-Z]{3}[0-9]{3}-[A-Z]{3}$/.test(inputRef.current.value)) {
            updateInvalidCode(true);
            updateIsLoading(false);
            return;
        }

        let message = "";
        updateInvalidCode(false);
        try {
            const backendResponse = await axios.get(`${apiURL}/code/redeem/${encodeURIComponent(inputRef.current.value)}?userID=${localUserId}`);
            message = backendResponse.data.message;
        }

        catch (error) {
            console.error(error);
            message = "An error occurred while redeeming your code. Please try again later.";
        }

        finally {
            updateBackendResponse(message);
            updateIsLoading(false);
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handleEnterKey = event => {
            if (event.key === "Enter") redeemCode();
        }

        document.addEventListener('keydown', handleEnterKey);
        return () => document.removeEventListener('keydown', handleEnterKey);
    }, [inputRef.current]);

    return (
        <div className={`${styles.redeemContainer} fadeIn`}>
            <h1 className='title'>Redeem a code</h1>
            <p className={styles.warning}>
                Your code is a one-time use and should not be shared, an administrator or moderator will never ask for your code.
            </p>

            <div className={styles.mainContainer}>
                <p className={styles.main}>
                    Enter redeemables codes below. Be sure to follow @mylordbugsy on Twitter to get the latest news and codes for SellMySite!
                </p>
            </div>
            

            <div className={styles.redeemBox}>
                <div className={styles.inputContainer}>
                    <i className={`fas fa-gift ${styles.icon}`}></i>
                    <input spellCheck="false" ref={inputRef} className={styles.input} type="text" placeholder="ABC12-DEF345-XYZ" />
                </div>
                

                <button onClick={redeemCode} className={`button ${styles.redeem}`}>Redeem</button>
                {isLoading && <Loading componentClass />}
                {invalidCode && <p className={styles.invalidCode}>Your code must follow the format <span className={styles.codeFormat}>ABC12-DEF345-XYZ</span>.</p>}
                {backendData && <p className={styles.backendData}>{backendData}</p>}
            </div>

            <p className={styles.redeemInfo}>
                By redeeming a code, you agree to our <span className={styles.terms}>Terms of Service</span> and <span className={styles.terms}>Privacy Policy</span>.
            </p>

            <h1 onClick={() => navigate('/')} className={`logo ${styles.interact}`}>SellMySite</h1>
        </div>
    );
}

export default Redeem;