import styles from './Display.module.scss'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { setFollowersFollowingShown } from '../../Redux/store';

const Display = (props) => {
    // Redux
    const dispatch = useDispatch();
    const { isFollowersFollowingShown } = useSelector(state => state.followersFollowing);

    // React
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setFollowersFollowingShown(false));
        }, 500);
    }

    useEffect(() => {
        if (!props.displayData || !props.displayType) dispatch(setFollowersFollowingShown(false));
    }, []);

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

    return (
        <>
            { isFollowersFollowingShown && props.displayData && (
                <div className={`${styles.displayContainer} fadeIn`} ref={containerRef}>
                    <p className='title'>{props.username}'s {props.displayType}</p>

                    <div className={styles.displayContent}>
                        {props.displayData.length === 0 ? (
                            <p className={styles.noData}>No data to display</p>
                        ) :
                            props.displayData.map((data, index) => (
                            <div onClick={() => navigate(`/profile/${data.username}`)} key={index} className={styles.displayItem}>
                                <img className={styles.profilePicture} src={`/${data.profilePicture}.png`} alt='Profile' />
                                <div className={styles.accountInfo}>
                                    <p className={styles.displayName}>{data.displayName}</p>
                                    <p className={styles.username}>@{data.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default Display;