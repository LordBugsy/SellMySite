import styles from './BuyTokens.module.scss';
import { useEffect, useState } from 'react';

const BuyTokens = () => {
    // React
    useEffect(() => {
        document.title = 'Buy Tokens - SellMySite';
    }, []);

    const [confirmPurchase, updateConfirmPurchase] = useState(false);

    const tokensList = [
        {name: 'Handful of Tokens', price: 4.99, amount: 5},
        {name: 'Bag of Tokens', price: 9.99, amount: 11},
        {name: 'Box of Tokens', price: 14.99, amount: 17},
        {name: 'Chest of Tokens', price: 19.99, amount: 23},
    ];

    const openPurchaseConfirmation = () => {
        updateConfirmPurchase(true);
    }

    return (
        <>
            <div className={`${styles.buyTokensContainer} fadeIn`}>
                <h1 className='title'>Buy Tokens</h1>

                <div className={styles.buyTokens}>
                    {tokensList.map((token, index) => (
                        <div className={styles.card} key={index}>
                            <div className={styles.cardHeader}>
                                <i className={`fas fa-coins ${styles.icon}`}></i>
                            </div>
                            <p className={styles.tokenName}>{token.name}</p>
                            <div className={styles.cardContent}>
                                <p className={styles.tokenAmount}>{token.amount} Tokens</p>
                                <p className={styles.tokenPrice}>${token.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BuyTokens;