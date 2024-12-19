import styles from './SearchResults.module.scss';
import { useParams } from 'react-router-dom';

const SearchResults = () => {
    const searchTarget = useParams().query;

    const placeholderWebsites = [
        {title: 'website1', description: 'description1', owner: { username: 'username1', profilePicture: Math.floor(Math.random() * 9) }},
        {title: 'website2', description: 'description2', owner: { username: 'username2', profilePicture: Math.floor(Math.random() * 9) }},
        {title: 'website3', description: 'description3', owner: { username: 'username3', profilePicture: Math.floor(Math.random() * 9) }},
        {title: 'website4', description: 'description4', owner: { username: 'username4', profilePicture: Math.floor(Math.random() * 9) }},
        {title: 'website5', description: 'description5', owner: { username: 'username5', profilePicture: Math.floor(Math.random() * 9) }},
    ];

    return (
        <>
            <div className={`${styles.searchResultsContainer} fadeIn`}>
                <h1 className='title'>Search Results for <span className={styles.target}>"{searchTarget}"</span></h1>
                <div className={styles.searchResults}>

                    <div className={styles.results}>
                        {placeholderWebsites.map((website, index) => (
                            <div className={styles.website} key={index}>
                                <div className={styles.imageContainer}>
                                    <img src='/thumbnailPlaceholder.png' alt='thumbnail' className={styles.image} />
                                </div>

                                <div className={styles.websiteInformations}>
                                    <p className={styles.websiteTitle}>{website.title}</p>
                                    <div className={styles.ownerInformation}>
                                        <img src={`/${website.owner.profilePicture}.png`} alt={`${website.owner.username}'s profile picture`} className={styles.profilePicture} />
                                        <p className={styles.ownerUsername}>@{website.owner.username}</p>
                                    </div>
                                </div>
                                        
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}

export default SearchResults;