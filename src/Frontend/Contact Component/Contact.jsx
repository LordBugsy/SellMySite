import styles from './Contact.module.scss';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setContactFormShown } from '../Redux/store';

const Contact = () => {
    // Redux
    const { localUsername } = useSelector(state => state.user.user);
    const isContactFormShown = useSelector(state => state.contactForm.isContactFormShown);

    const dispatch = useDispatch();

    // React
    const contactContainerRef = useRef();
    const nameRef = useRef();
    const emailRef = useRef();
    const messageRef = useRef();

    const closeComponent = () => {
        if (contactContainerRef.current) contactContainerRef.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setContactFormShown(false));
        }, 300);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (contactContainerRef.current && event.target === contactContainerRef.current) closeComponent();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {isContactFormShown && <section ref={contactContainerRef} className={`${styles.contactContainer} growIn`}>
                <form className={styles.contactForm}>
                    <h1 className={styles.contactHeader}>Contact Us</h1>
                    <i onClick={closeComponent} className={`fas fa-times ${styles.icon}`}></i>

                    <p className={styles.formLabel}>Name</p>
                    <div className={styles.formGroup}>
                        <input readOnly={localUsername !== ""} defaultValue={localUsername} spellCheck="false" ref={nameRef} type="text" className={`${localUsername !== "" ? styles.readOnly : ""} ${styles.input}`} />
                    </div>

                    <p className={styles.formLabel}>Email</p>
                    <div className={styles.formGroup}>
                        <input placeholder='Enter your email..' spellCheck="false" type="email" className={styles.input} ref={emailRef} />
                    </div>

                    <p className={styles.formLabel}>Message</p>
                    <div className={styles.formGroup}>
                        <textarea placeholder='How can we help you?' className={styles.textArea} ref={messageRef} />
                    </div>

                    <div className={styles.controls}>
                        <button className={`button ${styles.submit}`}>Submit</button>
                    </div>
                </form>
            </section>}
        </>
    );
}

export default Contact;