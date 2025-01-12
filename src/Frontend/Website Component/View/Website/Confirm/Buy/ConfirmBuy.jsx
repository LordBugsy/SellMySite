import styles from './ConfirmBuy.module.scss';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setConfirmBuyShown } from '../../../../../Redux/store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConfirmBuy = (props) => {
    // Redux
    const dispatch = useDispatch();
    const { siteTokens, localUserId } = useSelector(state => state.user.user);
    const { isConfirmBuyShown } = useSelector(state => state.confirmBuy);

    // React
    const containerRef = useRef(null);

    const navigate = useNavigate();

    const closeContainer = () => {
        if (containerRef.current) containerRef.current.classList.replace('fadeIn', 'fadeOut');

        setTimeout(() => {
            dispatch(setConfirmBuyShown(false));
        }, 500);
    }

    const buyWebsite = async () => {
        if (!localUserId || siteTokens < props.websitePrice) return; // If, FOR SOME RANDOM REASON, the user still ends up here, we prevent the transaction

        try {
            const backendResponse = await axios.post(`http://localhost:5172/website/buy`, {
                websiteID: props.websiteID,
                buyerID: localUserId
            });

            navigate('/');
        }

        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContainer();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);    

    return (
        <>
            { isConfirmBuyShown && (
                <div ref={containerRef} className={`${styles.confirmBuyContainer} fadeIn`}>
                    <div className={styles.confirmBuyContent}>
                        <i className={`fas fa-times ${styles.icon}`} onClick={closeContainer}></i>

                        <p className={styles.title}>
                            Do you really want to buy <span className={styles.websiteTitle}>{props.websiteTitle}</span> for <span className={styles.websitePrice}>{props.websitePrice}</span> site tokens?
                        </p>

                        <p className={styles.information}>
                            {siteTokens < props.websitePrice ? 
                                'You do not have enough site tokens to buy this website.' : 
                                `You will have ${siteTokens - props.websitePrice} site tokens left after your transaction.`
                            }
                        </p>

                        <div className={styles.buttonContainer}>
                            <button className={`button ${styles.close}`} onClick={closeContainer}>Cancel</button>
                            {siteTokens >= props.websitePrice && <button className={`button ${styles.buy}`} onClick={buyWebsite}>Buy</button>}
                        </div>
                    </div>
                </div>
            )}
        </>
        
    );
}

export default ConfirmBuy;