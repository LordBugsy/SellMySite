import styles from './SearchResults.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading/Loading';

const SearchResults = () => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // React
    const searchTarget = useParams().query;

    const navigate = useNavigate();

    const [postsSearchResults, updatePostsSearchResults] = useState([]);
    const [websitesSearchResults, updateWebsitesSearchResults] = useState([]);
    const [filterFor, updateFilterFor] = useState("Posts");
    const [isLoading, updateIsLoading] = useState(true);

    useEffect(() => {
        document.title = `Search Results for "${searchTarget}" - SellMySite`;
    }, []);

    useEffect(() => {
        updateIsLoading(true);

        const fetchSearchResults = async () => {
            try {
                const backendResponse = await axios.get(`${apiURL}/search/${encodeURIComponent(searchTarget)}`);
                if (backendResponse.data.noResultsMessage) {
                    updateIsLoading(false);
                    updatePostsSearchResults([]);
                    updateWebsitesSearchResults([]);
                    return;
                }
                updatePostsSearchResults(backendResponse.data.posts);
                updateWebsitesSearchResults(backendResponse.data.websites);
            }

            catch (error) {
                console.error(error);
            }

            finally {
                updateIsLoading(false);
            }
        }

        fetchSearchResults();
    }, [searchTarget]);    

    return (
        <>
            <div className={`${styles.searchResultsContainer} fadeIn`}>
                <h1 className='title'>Search Results for{' '}
                    <span className={styles.target}>"{searchTarget}"</span>
                    <div className={styles.sectionPicker}>
                        {postsSearchResults.length !== 0 && <p onClick={() => updateFilterFor("Posts")} className={`${styles.sectionTitle} ${filterFor === "Posts" ? styles.selected : ''}`}>Posts</p>}
                        {websitesSearchResults.length !== 0 && <p onClick={() => updateFilterFor("Websites")} className={`${styles.sectionTitle} ${filterFor === "Websites" ? styles.selected : ''}`}>Websites</p>}
                    </div>
                </h1>
                <div className={styles.searchResults}>
                    {isLoading && <Loading />}
                    {!isLoading && postsSearchResults.length === 0 && websitesSearchResults.length === 0 ? <p className={styles.noResults}>No results found.</p> : (
                    <>
                        <div className={styles.results}>
                            {filterFor === "Posts" ? postsSearchResults.map((post, index) => (
                                    <div onClick={() => navigate(`/post/${post.owner.username}/${post.publicPostID}`)} className={styles.post} key={index}>
                                        <div className={styles.postInformations}>
                                            <div className={styles.ownerInformation}>
                                                <img src={`/${post.owner.profilePicture}.png`} alt={`${post.owner.username}'s profile picture`} className={styles.profilePicture} />
                                                <div className={styles.ownerDetails}>
                                                    <p className={styles.ownerDisplayName}>{post.owner.displayName}</p>
                                                    <p className={styles.ownerUsername}>@{post.owner.username}</p>
                                                </div>
                                            </div>

                                            <p className={styles.postContent}>{post.content}</p>
                                            <div className={styles.attachmentContainer}>
                                                {post.attachment && (<img src={post.attachment} alt="attachment" className={`${styles.attachment} ${styles.image}`} />)}
                                            </div>
                                            <div className={styles.postDateContainer}>
                                                <p className={styles.postDate}>
                                                    {new Date(post.createdAt).toDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                : websitesSearchResults.map((website, index) => (
                                    <div onClick={() => navigate(`/website/${website.owner.username}/${website.publicWebsiteID}`)} className={styles.website} key={index}>
                                        <div className={styles.imageContainer}>
                                            <img src="/thumbnailPlaceholder.png" alt="thumbnail" className={styles.image} />
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
                    </>)}
                </div>
            </div>
        </>
    );
}

export default SearchResults;