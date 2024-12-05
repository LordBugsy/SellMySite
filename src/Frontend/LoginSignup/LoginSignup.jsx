import styles from './LoginSignup.module.scss';
import { useRef, useState, useEffect } from 'react';
import { setLoginSignupShown, loginUser } from '../Redux/store';
import { useDispatch, useSelector } from 'react-redux';

const LoginSignup = (props) => {
    // Redux
    const isLoginSignupShown = useSelector(state => state.loginSignup.isLoginSignupShown);
    const dispatch = useDispatch();
    

    // React
    const usernameRef = useRef();
    const displayNameRef = useRef();
    const passwordRef = useRef();
    const componentContainer = useRef();

    const [visiblePassword, setVisiblePassword] = useState(false);
    const [propRequest, setPropRequest] = useState(props.request);

    const login = () => {
        // Login logic here
    }

    const signup = () => {
        dispatch(loginUser({
            localUsername: usernameRef.current.value,
            localUserId: '1',
            displayName: displayNameRef.current.value,
            password: passwordRef.current.value,

            profilePicture: `/${Math.floor(Math.random()*9)}.png`,
            balance: 0,
            role: 'user'
        }));

        closeComponent();
    }

    const closeComponent = () => {
        if (componentContainer.current) componentContainer.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setLoginSignupShown(false));
        }, 500);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (componentContainer.current && event.target === componentContainer.current) closeComponent();            
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {isLoginSignupShown && <div ref={componentContainer} className={`${styles.mainContainer} growIn`}>

                <div className={styles.inputContainer}>
                    <h1 className='logo'>SellMySite</h1>
                    <h1>{propRequest === 'login' ? 'Login' : 'Signup'}</h1>
                    <form className={styles.formContent}>
                        <i className={`${styles.icon} ${styles.close} fa-solid fa-times`} onClick={closeComponent}></i>
                        <div className={styles.inputField}>
                            <input spellCheck='false' type='text' className={styles.input} placeholder='Username' ref={usernameRef} />
                            <i className={`${styles.icon} fa-solid fa-at`}></i>
                        </div>

                        {propRequest !== 'login' && (
                            <div className={styles.inputField}>
                                <input spellCheck='false' type='text' className={styles.input} placeholder='Display Name' ref={displayNameRef} />
                                <i className={`${styles.icon} fa-solid fa-user-group`}></i>
                            </div>
                        )}

                        <div className={styles.inputField}>
                            <input type={visiblePassword ? 'text' : 'password'} className={styles.input} placeholder='Password' ref={passwordRef} />
                            {!visiblePassword ? (
                                <i className={`${styles.icon} ${styles.password} fa-solid fa-eye-slash`} onClick={() => setVisiblePassword(true)}></i>
                            ) : (
                                <i className={`${styles.icon} ${styles.password} fa-solid fa-eye`} onClick={() => setVisiblePassword(false)}></i>
                            )}
                        </div>

                        <button type='button' className={`${styles.submit} ${styles.button}`} onClick={propRequest === 'login' ? login : signup}>
                            {propRequest === 'login' ? 'Login' : 'Signup'}
                        </button>
                    </form>

                    <div className={styles.switchRequest}>
                        {propRequest === 'login' ? (
                            <p onClick={() => setPropRequest('signup')} className={styles.switch}>Don't have an account?</p>
                        ) : (
                            <p onClick={() => setPropRequest('login')} className={styles.switch}>Already have an account?</p>
                        )}
                    </div>
                    
                </div>
            </div>}
        </>
    )
}

export default LoginSignup;