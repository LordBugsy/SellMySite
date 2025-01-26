import styles from './MyAccount.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setAccountSettingsShown } from '../../Redux/store';
import { useEffect, useState } from 'react';
import Popup from './Popup/Popup';

const MyAccount = () => {
    // Redux
    const dispatch = useDispatch();
    const { localUsername, displayName, siteTokens } = useSelector(state => state.user.user);
    const { isAccountSettingsShown } = useSelector(state => state.accountSettings);

    // React
    const [changingFor, updateChangingFor] = useState('');

    useEffect(() => {
        if (isAccountSettingsShown) {
            dispatch(setAccountSettingsShown(false));
        }
    }, []);

    const openSettings = (target) => {
        dispatch(setAccountSettingsShown(true));
        updateChangingFor(target);
    }

    return (
        <div className={`${styles.accountContainer} fadeIn`}>
            <h1 className='title'>My Account</h1>

            <div className={styles.accountEdit}>
                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-user ${styles.icon}`}></i>
                        <p className={styles.label}>Username: <span className={styles.userInfo}>@{localUsername}</span></p>
                    </div>

                    <div className={styles.edit} onClick={() => openSettings('Username')}>
                        <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-user-group ${styles.icon}`}></i>
                        <p className={styles.label}>Display Name: <span className={styles.userInfo}>{displayName}</span></p>
                    </div>

                    <div onClick={() => openSettings('Display Name')} className={styles.edit}>
                        <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-info-circle ${styles.icon}`}></i>
                        <p className={styles.label}>Change profile Description</p>
                    </div>

                    <div onClick={() => openSettings('Description')} className={styles.edit}>
                        <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>
                </div>


                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-lock ${styles.icon}`}></i>
                        <p className={styles.label}>Change Password</p>
                    </div>

                    <div onClick={() => openSettings('Password')} className={`${styles.edit} ${styles.password}`}>
                        <i className={`fa-solid fa-key ${styles.icon}`}></i>
                    </div>
                </div>

                <div className={styles.account}>
                    <div className={styles.category}>
                        <i className={`fas fa-trash ${styles.icon}`}></i>
                        <p className={styles.label}>Delete Account</p>
                    </div>

                    <div onClick={() => openSettings('Delete')} className={`${styles.edit} ${styles.delete}`}>
                        <i className={`fa-solid fa-circle-xmark ${styles.icon}`}></i>
                    </div>
                </div>

            </div>

            {isAccountSettingsShown && <Popup changingFor={changingFor} data={ siteTokens } />}

        </div>
    )
}

export default MyAccount;