import styles from './Redeem.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Redeem = () => {
    const inputRef = useRef();
    const navigate = useNavigate();
    
    const [invalidCode, updateInvalidCode] = useState(false);

    const redeemCode = () => {
        if (!/^[A-Z]{3}[0-9]{2}-[A-Z]{3}[0-9]{3}-[A-Z]{3}$/.test(inputRef.current.value)) {
            updateInvalidCode(true);
            console.log("Invalid code");
            return;
        }

        // Redeem code logic here
        console.log("do something here");
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

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
            </div>

            <p className={styles.redeemInfo}>
                By redeeming a code, you agree to our <span className={styles.terms}>Terms of Service</span> and <span className={styles.terms}>Privacy Policy</span>.
            </p>

            <h1 onClick={() => navigate('/')} className={`logo ${styles.interact}`}>SellMySite</h1>
        </div>
    );
}

export default Redeem;