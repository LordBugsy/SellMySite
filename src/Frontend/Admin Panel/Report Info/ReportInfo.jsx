import styles from './ReportInfo.module.scss';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Loading from '../../Loading/Loading';
import { useSelector, useDispatch } from 'react-redux';
import { setAdminReportFormShown } from '../../Redux/store';

const ReportInfo = (props) => {
    // Redux
    const { localUserId } = useSelector(state => state.user.user);
    const { isAdminReportFormShown } = useSelector(state => state.adminReportForm);
    const dispatch = useDispatch();
    
    // React
    const [isLoading, updateLoadingState] = useState(true);

    const containerRef = useRef(null);

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setAdminReportFormShown(false));
        }, 300);
    }

    useEffect(() => {
        console.log(props.testProp);
    }, []);

    return (
        <>
            {isAdminReportFormShown && (
                <div className={`${styles.reportInfoContainer} fadeIn`}>
                    <div className={styles.reportInfo}>
                        <i onClick={closeContainer} className={`fas fa-times ${styles.icon}`}></i>

                        <div className={styles.dataActions}>

                        </div>

                        <div className={styles.defendantActions}> 
                            
                        </div>
                        {isLoading && <Loading componentClass />}
                        {!isLoading && (
                            <p>testing</p>   
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default ReportInfo;