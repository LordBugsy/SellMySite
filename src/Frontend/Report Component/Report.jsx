import styles from './Report.module.scss';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReportFormShown } from '../Redux/store';

const Report = (props) => {
    // Redux
    const isReportFormShown = useSelector(state => state.reportForm.isReportFormShown);

    const dispatch = useDispatch();

    // React
    const reportContainerRef = useRef();
    const messageRef = useRef();

    const closeComponent = () => {
        if (reportContainerRef.current) reportContainerRef.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setReportFormShown(false));
        }, 300);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (reportContainerRef.current && event.target === reportContainerRef.current) closeComponent();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {isReportFormShown && <div ref={reportContainerRef} className={`${styles.reportContainer} growIn`}>
                <form className={styles.reportForm}>
                    <i onClick={closeComponent} className={`fas fa-times ${styles.icon}`}></i>
                    <div className={styles.reportHeader}>
                        <h1 className={styles.header}>Report <span className={styles.reportTarget}>{props.targetName}</span></h1>
                        <p className={styles.info}>Let us know how <span className={styles.reportTarget}>{props.targetName}</span> is breaking the rules</p>
                    </div>

                    <p className={styles.formLabel}>Message</p>
                    <div className={styles.formGroup}>
                        <textarea ref={messageRef} placeholder={`Let us know why ${props.targetName} is breaking the rules..`} className={styles.textArea} />
                    </div>

                    <div className={styles.controls}>
                        <button className={`button ${styles.submit}`}>Submit</button>
                    </div>
                </form>
            </div>}
        </>
    );
}

export default Report;