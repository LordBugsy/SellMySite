import { useEffect, useRef, useState } from 'react';
import styles from './GroupChat.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { updateGroupCreateOptionState } from '../../Redux/store';

const Create = () => {
    // Redux
    const dispatch = useDispatch();
    const { isGroupCreateOptionShown } = useSelector((state) => state.groupChatOption);

    // React
    const containerRef = useRef(null);
    const [selectedUsers, addUser] = useState([]);

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

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) {
                closeContainer();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const chatsPlaceholder = [{
        _id: "1",
        groupChat: [{
            username: "Miles Morales",
            displayName: "Miles Morales",
            profileColour: 1,
        }, {
            username: "user2",
            profileColour: 2,
        }],
        state: "unread"
    }, {
        _id: "2",
        groupChat: [{
            username: "Kilometres Morales",
            displayName: "Kilometres Morales",
            profileColour: 3,
        }, {
            username: "user4",
            profileColour: 4,
        }],
        state: "read"
    }, {
        _id: "3",
        groupChat: [{
            username: "Miles Kilometres",
            displayName: "Miles Kilometres",
            profileColour: 5
        }, {
            username: "user6",
            displayName: "user6",
            profileColour: 6
        }],
        state: "read"
    }, {
        _id: "4",
        groupChat: [{
            username: "Miles Kilometres",
            displayName: "Miles Kilometres",
            profileColour: 7
        }, {
            username: "user8",
            displayName: "user8",
            profileColour: 8
        }],
        state: "read"
    }, {
        _id: "5",
        groupChat: [{
            username: "SellMySite Bot",
            displayName: "SellMySite Bot",
            profileColour: 2
        }, {
            username: "user10",
            displayName: "user10",
            profileColour: 8
        }],
        state: "read"
    }];

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
                            <div className={styles.selectedUsers}>
                                <p className={styles.selectedUsersTitle}>
                                    You selected <span className={selectedUsers.length < 2 ? styles.invalidAmount : styles.correctAmount}>{selectedUsers.length}</span> user{selectedUsers.length < 2 ? '' : 's'}.
                                </p>
                            </div>

                            <div className={styles.mutualChats}>
                                {chatsPlaceholder.map((chat, index) => (
                                    <div onClick={() => addUserToGroupChat(index)} className={`${styles.mutualChat} ${selectedUsers.includes(index) ? styles.selected : ''}`} key={index}>
                                        <img className={styles.profilePicture} src={`/${chat.groupChat[0].profileColour}.png`} alt="Profile" />
                                        <div className={styles.userInfo}>
                                            <p className={styles.displayName}>{chat.groupChat[0].displayName}</p>
                                            <p className={styles.username}>@{chat.groupChat[0].username}</p>
                                        </div>
                                    </div>   
                                ))}
                            </div>

                            <div className={styles.buttonContainer}>
                                <button className={`button ${styles.create}`}>Create</button>
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