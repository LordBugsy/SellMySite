import { useEffect, useRef, useState } from 'react';
import styles from './GroupChat.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { updateGroupCreateOptionState } from '../../Redux/store';
import axios from 'axios';

const Create = (props) => {
    // Redux
    const dispatch = useDispatch();
    const { isGroupCreateOptionShown } = useSelector((state) => state.groupChatOption);
    const { localUserId } = useSelector((state) => state.user.user);

    // React
    const containerRef = useRef(null);
    const [selectedUsers, addUser] = useState([]);
    const [mutualFollowers, updateMutualFollowers] = useState([]);

    const closeContainer = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace("fadeIn", "fadeOut");

            setTimeout(() => {
                dispatch(updateGroupCreateOptionState(false));
            }, 300);
        }
    }

    const addUserToGroupChat = (userID) => {
        // Add user to group chat
        if (selectedUsers.includes(userID)) {
            addUser(selectedUsers.filter(user => user !== userID));
            return;
        }

        if (selectedUsers.length === 10) return;

        addUser([...selectedUsers, userID]);
    }

    const createGroupChat = async () => {
        if (selectedUsers.length < 2) return;

        const selectedParticipants = [localUserId];
        selectedUsers.forEach(user => {
            selectedParticipants.push(mutualFollowers[user]._id);
        });

        try {
            const backendResponse = await axios.post('http://localhost:5172/chatlogs/create', {
                participants: selectedParticipants,
                createdBy: localUserId,
                type: "group"

            });

            if (props.onCreate) props.onCreate();
            closeContainer();
        }

        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        updateMutualFollowers(props.mutualFollowersData);
    }, [])

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) {
                closeContainer();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            {isGroupCreateOptionShown && (
                <div ref={containerRef} className={`${styles.createGroupContainer} fadeIn`}>
                    <div className={styles.createGroup}>
                        <div className={styles.createHeader}>
                            <h1 className='title'>Create a group chat!</h1>
                            <p className={styles.information}>You can create a Group Chat with up to 10 people you mutually follow.</p>
                        </div>

                        <div className={styles.createContent}>
                            {mutualFollowers.length === 0 ? (
                                <div className={styles.noMutualFollowers}>
                                    <p className={styles.noMutualFollowersTitle}>You have no mutual followers to create a group chat with.</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.selectedUsers}>
                                        <p className={styles.selectedUsersTitle}>
                                            You selected <span className={selectedUsers.length < 2 ? styles.invalidAmount : styles.correctAmount}>{selectedUsers.length}</span> user{selectedUsers.length < 2 ? '' : 's'}.
                                        </p>
                                    </div>

                                    <div className={styles.mutualChats}>
                                        {mutualFollowers.map((mutual, index) => (
                                            <div onClick={() => addUserToGroupChat(index)} className={`${styles.mutualChat} ${selectedUsers.includes(index) ? styles.selected : ''}`} key={index}>
                                                <img className={styles.profilePicture} src={`/${mutual.profilePicture}.png`} alt="Profile" />
                                                <div className={styles.userInfo}>
                                                    <p className={styles.displayName}>{mutual.displayName}</p>
                                                    <p className={styles.username}>@{mutual.username}</p>
                                                </div>
                                            </div>   
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className={styles.buttonContainer}>
                                {mutualFollowers.length !== 0 && <button onClick={createGroupChat} className={`button ${styles.create}`}>Create</button>}
                                <button className={`button ${styles.cancel}`} onClick={closeContainer}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Create;