import Comments from '../Comments/Comments';
import styles from './ViewWebsite.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentSectionShown } from '../../../Redux/store';
import { useEffect } from 'react';

const ViewWebsite = (props) => {
    // Redux
    const { localUsername, profilePicture } = useSelector(state => state.user.user);
    const { isCommentSectionShown } = useSelector(state => state.comments);

    const dispatch = useDispatch();

    // React
    const openComments = () => {
        dispatch(setCommentSectionShown(true));
    }

    useEffect(() => {
        if (isCommentSectionShown) dispatch(setCommentSectionShown(false));
    }, []);

    return (
        <>
        <div className={`${styles.viewWebsiteContainer} fadeIn`}>
            <div className={styles.viewWebsite}>
                <div className={styles.websiteInformations}>
                    <img src='/thumbnailPlaceholder.png' alt='thumbnail' className={styles.image} />
                    <div className={styles.informations}>
                        <p className={styles.title}>Website Title <span className={styles.verified}><i className={`fas fa-check-circle`}></i></span> <span className={styles.githubRepo}><i className={`${styles.icon} fab fa-github`}></i></span></p>
                        <p className={styles.description}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae fuga nemo sequi reprehenderit similique corporis quod quo exercitationem, neque deleniti iure, autem voluptate? Voluptatem nostrum enim delectus adipisci ipsum sint! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex facere minima harum atque, vel nam. Doloribus laborum modi sint accusantium ut sed officia repellat labore non sunt, iusto expedita porro?
                        </p>
                    </div>
                </div>

                <div className={styles.websiteContent}>
                    <div className={styles.content}>
                        <h1 className={styles.price}>$420.69 <span className={`${styles.status} ${styles.onSale}`}>On Sale</span></h1>
                    </div>

                    <div className={styles.content}>
                        <img src={`/${profilePicture}.png`} alt={`${localUsername}'s profile picture`} className={styles.profilePicture} />
                        <p className={styles.username}>@{localUsername}</p>
                    </div>

                    <div className={styles.content}>
                        <p className={styles.contentText}>
                            I'm selling this website because I don't have time to manage it anymore. It's a great opportunity for someone who wants to start a business.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <i className={`fas fa-heart ${styles.icon}`}></i>
                        <i onClick={openComments} className={`fas fa-comment ${styles.icon}`}></i>
                        <i className={`fas fa-share ${styles.icon}`}></i>
                        <i className={`fas fa-shopping-cart ${styles.icon}`}></i>
                        <i className={`fas fa-gavel ${styles.icon}`}></i>
                    </div>
                </div>
            </div>
        </div>

        {isCommentSectionShown && <Comments targetName="testing" />}

        </>
    )
}

export default ViewWebsite;