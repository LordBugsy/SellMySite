import styles from './MyAccount.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setAccountSettingsShown } from '../../Redux/store';
import { useEffect } from 'react';

const MyAccount = () => {
    // Redux
    const dispatch = useDispatch();
    const { localUsername, displayName } = useSelector(state => state.user.user);
    const { isAccountSettingsShown } = useSelector(state => state.accountSettings);

    // React
    useEffect(() => {
        if (isAccountSettingsShown) {
            dispatch(setAccountSettingsShown(false));
        }
    }, []);

    return (
        <div className={`${styles.accountContainer} fadeIn`}>
            <h1 className='title'>My Account</h1>

            <div className={styles.accountEdit}>
                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-user ${styles.icon}`}></i>
                        <p className={styles.label}>Username: <span className={styles.userInfo}>@{localUsername}</span></p>
                    </div>

                    <div className={styles.edit}>
                        <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-user-group ${styles.icon}`}></i>
                        <p className={styles.label}>Display Name: <span className={styles.userInfo}>{displayName}</span></p>
                    </div>

                    <div className={styles.edit}>
                        <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-lock ${styles.icon}`}></i>
                        <p className={styles.label}>Change Password</p>
                    </div>

                    <div className={`${styles.edit} ${styles.password}`}>
                        <i className={`fa-solid fa-key ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-trash ${styles.icon}`}></i>
                        <p className={styles.label}>Delete Account</p>
                    </div>

                    <div className={`${styles.edit} ${styles.delete}`}>
                        <i className={`fa-solid fa-circle-xmark ${styles.icon}`}></i>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default MyAccount;