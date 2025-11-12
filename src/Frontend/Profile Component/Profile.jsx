import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Profile.module.scss';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import Display from './Display Information/Display';
import Report from '../Website Component/Report Component/Report';
import { setFollowersFollowingShown, setReportFormShown } from '../Redux/store';

const Profile = () => {
    // Redux
    const dispatch = useDispatch();
    const { localUserId, role, profilePicture } = useSelector(state => state.user.user);
    const { isFollowersFollowingShown } = useSelector(state => state.followersFollowing);
    const isReportFormShown = useSelector(state => state.reportForm.isReportFormShown);

    // React
    const navigate = useNavigate();
    const username = encodeURIComponent(useParams().username);

    const [followStatus, updateFollowStatus] = useState(false);
    const [filterStyle, updateFilterStyle] = useState('Posts'); // Posts or Websites
    const [profileData, updateProfileData] = useState([]);
    const [displayType, updateDisplayType] = useState("Followers");
    const [unknownUser, updateUnknownUser] = useState(false);

    useEffect(() => {
        document.title = `${username}'s Profile - SellMySite`;
    }, [username]);

    useEffect(() => {
        updateUnknownUser(false);
        const loadProfile = async () => {
            try {
                const backendResponse = await axios.get(`http://localhost:5172/user/username/${username}`);
                updateProfileData(backendResponse.data);

                if (backendResponse.data.followers.includes(localUserId) || backendResponse.data.mutualFollowers?.includes(localUserId)) updateFollowStatus(true); // In the future, this will be done server-side because it can take a lot of time to load
            }

            catch (error) {
                updateUnknownUser(true);
            }
        }

        loadProfile();
    }, [username, followStatus, localUserId, profilePicture]);

    useEffect(() => {
        if (isFollowersFollowingShown) dispatch(setFollowersFollowingShown(false));
        if (isReportFormShown) dispatch(setReportFormShown(false));
    }, [username])

    const setDisplayType = (type) => {
        updateDisplayType(type);
        dispatch(setFollowersFollowingShown(true));
    }

    const followCondition = () => {
        if (followStatus) unfollowUser();
        else followUser();
    }

    const followUser = async () => {
        try {
            const backendResponse = await axios.post("http://localhost:5172/user/follow", {
                userID: localUserId,
                targetID: profileData._id
            });

            updateFollowStatus(true);
        }

        catch (error) {
            // console.error(error);
        }
    }

    const unfollowUser = async () => {
        try {
            const backendResponse = await axios.post("http://localhost:5172/user/unfollow", {
                userID: localUserId,
                targetID: profileData._id
            });

            updateFollowStatus(false);
        }

        catch (error) {
            // console.error(error);
        }
    }

    const createChatLog = async () => {
        if (profileData.privateChatsWith?.includes(localUserId)) {
            navigate('/messages');
            return;
        }

        try {
            const backendResponse = await axios.post("http://localhost:5172/chatlogs/create", {
                participants: [localUserId, profileData._id],
                type: "direct"
            });

            navigate('/messages');
        }

        catch (error) {
            // console.error(error);
        }
    }

    return (
        <div className={`${styles.profileContainer} fadeIn`}>
            <div className={styles.profileHeader}>
                <img className={styles.profileBanner} src={`${unknownUser ? '/errorb.png' : `/${profileData.bannerColour}.png`}`} alt={`${unknownUser ? "Unknown User" : `${username}'s banner`}`} />
                
                <div className={styles.profileDetails}>
                    <img  className={styles.profileImage} src={`${unknownUser ? '/error.png' : `/${profileData.profilePicture}.png`}`} alt={`${unknownUser ? "Unknown User" : `${username}'s profile picture`}`} />
                    <div className={styles.profileInfo}>
                        {profileData.accountStatus && profileData.accountStatus === 'banned' && (
                            <div className={styles.banned}>
                                <p className={styles.bannedText}>This account has been banned</p>
                                <p className={styles.bannedReason}>{profileData.banReason}</p>
                            </div>
                        )}

                        {localUserId !== profileData._id && (
                        <div className={styles.actions}>
                            {localUserId !== profileData._id && <i onClick={() => dispatch(setReportFormShown(true))} className={`fas fa-flag ${styles.icon}`}></i>}
                            {((localUserId && profileData.mutualFollowers && profileData.mutualFollowers.includes(localUserId)) || role === "admin") && <i onClick={createChatLog} className={`fas fa-envelope ${styles.icon}`}></i>}
                            {localUserId && <button onClick={followCondition} className={`button ${followStatus ? styles.unfollow : styles.follow}`}>
                                {followStatus ? 'Unfollow' : 'Follow'}
                            </button>  }                 
                        </div>
                        )}

                        <div className={`${styles.profileUsername} ${localUserId === "" || localUserId === profileData._id ? styles.margin : ''}`}> {/* hahahaha, yeah I know the styles.margin is cheating but hey, I've been trying to fix this bug for hours leave me alone */}
                            <h1 className={styles.displayName}>{unknownUser ? "Unknown User" : profileData.displayName}</h1>
                            <p className={styles.username}>@{unknownUser ? "UnknownUser" : profileData.username}{' '}
                                {profileData.isVerified && (<i className={`fas fa-check-circle ${styles.verified}`}></i>)}
                                {profileData.role && profileData.role === 'admin' && (<i className={`fa-solid fa-screwdriver-wrench ${styles.admin}`}></i>)}
                            </p>
                        </div>

                        <div className={styles.profileDescription}>
                            <p className={styles.description}>{unknownUser ? "Unknown User" : profileData.description}</p>
                        </div>

                        <div className={styles.profileStats}>
                            <div onClick={() => setDisplayType("followers")} className={styles.stat}>
                                <p className={styles.statText}>Followers: </p>
                                <p className={styles.statNumber}>{profileData.followers?.length || 0}</p>
                            </div>

                            <div onClick={() => setDisplayType("followings")} className={styles.stat}>
                                <p className={styles.statText}>Following: </p>
                                <p className={styles.statNumber}>{profileData.following?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!unknownUser ? (
                <div className={`${styles.profileContent} background_${profileData.profilePicture}`}>
                    <div className={styles.profileFilter}>
                        <p onClick={() => updateFilterStyle('Posts')} className={`${styles.filter} selected_${profileData.profilePicture} ${filterStyle === 'Posts' ? styles.selected : ''}`}>Posts</p>
                        <p onClick={() => updateFilterStyle('Websites')} className={`${styles.filter} selected_${profileData.profilePicture} ${filterStyle === 'Websites' ? styles.selected : ''}`}>Websites</p>
                    </div>

                    <div className={styles.profileDiv}>
                        {filterStyle === 'Posts' ? (
                            <div className={styles.posts}>
                                {profileData.postsPublished?.length === 0 ? (
                                    <p className={styles.noPostsText}>This user hasn't published any posts yet.</p>
                                ) : (profileData.postsPublished?.map((post, index) => (
                                    <div onClick={() => navigate(`/post/${profileData.username}/${post.publicPostID}`)} key={index} className={`${styles.post} creationStyle_${profileData.profilePicture}`}>
                                        <div className={styles.postHeader}>
                                            <img src={`/${profileData.profilePicture}.png`} alt="Avatar" className={styles.profilePicture} />
                                            <div className={styles.postAuthor}>
                                                <p className={styles.displayName}>{profileData.displayName}</p>
                                                <p className={styles.username}>@{profileData.username}</p>
                                            </div>
                                        </div>

                                        <div className={styles.postInfo}>
                                            <p className={styles.postContent}>{post.content}</p>
                                            {post.attachment && <img className={styles.postImage} src={post.attachment} alt="Post Attachment" />}
                                        </div>
                                    </div>
                                )))}
                            </div>
                        ) : (
                            <div className={styles.websites}>
                                {profileData.websitesPublished?.length === 0 ? (
                                    <p className={styles.noWebsitesText}>This user hasn't published any websites yet.</p>
                                ) : (profileData.websitesPublished?.map((website, index) => (
                                    <div onClick={() => navigate(`/website/${profileData.username}/${website.publicWebsiteID}`)} key={index} className={`${styles.website} creationStyle_${profileData.profilePicture}`}>
                                        <img src='/thumbnailPlaceholder.png' alt="Website Thumbnail" className={styles.websiteThumbnail} />

                                        <div className={styles.websiteInfo}>
                                            <p className={styles.websiteTitle}>
                                                {website.title} {website.onSale ? <i className={`fas fa-tag ${styles.onSale}`}></i> : <i className={`fas fa-tag ${styles.notOnSale}`}></i>}
                                            </p>
                                        </div>
                                    </div>
                                )))}
                            </div>
                        )}
                    </div>
                </div>
                ) : (
                    <div className={styles.error}>
                        <p className={styles.errorMessage}>
                            Seems like you either have a time machine, or you're trying to access a user that doesn't exist.
                        </p>
                        <p className={styles.errorMessage}>
                            If you're a time traveler, please let me know how you did it. If you're not, please try again.
                        </p>
                    </div>
                )}

            {isFollowersFollowingShown && <Display displayType={displayType} username={username} displayData={displayType === "followers" ? profileData.followers : profileData.following} />}
            {isReportFormShown && <Report reportedTarget="User" targetID={profileData._id} owner={profileData.username} targetName={profileData.username} />}

        </div>
    );
}

export default Profile;