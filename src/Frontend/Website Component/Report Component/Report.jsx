import styles from './Report.module.scss';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReportFormShown } from '../../Redux/store';
import axios from 'axios';

const Report = (props) => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // Redux
    const isReportFormShown = useSelector(state => state.reportForm.isReportFormShown);

    const dispatch = useDispatch();

    // React
    const reportContainerRef = useRef(null);
    const messageRef = useRef();

    const closeComponent = () => {
        if (reportContainerRef.current) reportContainerRef.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setReportFormShown(false));
        }, 300);
    }

    const submitReport = async () => {
        const message = messageRef.current.value || "No reason provided";

        try {
            const backendResponse = await axios.post(`${apiURL}/report/create`, {
                reportedTarget: props.reportedTarget,
                reason: message.trim(),
                targetID: props.targetID,
                owner: props.owner,
                publicID: props.publicID
            });

            closeComponent();
        }

        catch (error) {
            // console.error(error);
        }
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
                <div className={styles.reportForm}>
                    <i onClick={closeComponent} className={`fas fa-times ${styles.icon}`}></i>
                    <div className={styles.reportHeader}>
                        <h1 className={styles.header}>Report <span className={styles.reportTarget}>{props.targetName || "Post"}</span></h1>
                        <p className={styles.info}>
                            {props.reportedTarget === "Post" && "Let us know why this post is breaking the rules"}
                            {props.reportedTarget !== "Post" && `Let us know why ${props.targetName} is breaking the rules`}
                        </p>
                    </div>

                    <p className={styles.formLabel}>Message</p>
                    <div className={styles.formGroup}>
                        <textarea ref={messageRef} placeholder={`${props.reportedTarget === "Post" ? "Let us know why this post is breaking the rules... " : `Let us know why ${props.targetName} is breaking the rules..`}`} className={styles.textArea} />
                    </div>

                    <div className={styles.controls}>
                        <button onClick={submitReport} className={`button ${styles.submit}`}>Submit</button>
                    </div>
                </div>
            </div>}
        </>
    );
}

export default Report;