import styles from './Messages.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import Create from './Group Chat/Create';
import axios from 'axios';
import { updateGroupCreateOptionState, updateGroupParticipantsOptionState } from '../Redux/store';

const Messages = () => {
    // Redux
    const dispatch = useDispatch();

    const { localUserId, localUsername } = useSelector((state) => state.user.user);
    const { isGroupCreateOptionShown }  = useSelector((state) => state.groupChatOption);

    // React
    const [isRecipientVisible, setIsRecipientVisible] = useState(true); // Show the recipient list (mobile only)
    const [lastChatIndex, setLastChatIndex] = useState(0); // The last chat that was selected
    const [searchQuery, setSearchQuery] = useState(""); // Search input state
    const [filteredChats, setFilteredChats] = useState([]); // State for filtered chats
    const [privateChats, updatePrivateChats] = useState([]); // State for private chats

    useEffect(() => {
        const loadChats = async () => {
            try {
                const backendResponse = await axios.get(`http://localhost:5172/chatlogs/${localUserId}`);
                updatePrivateChats(backendResponse.data.joinedChats);
                
            }

            catch (error) {
                console.error(error);
            }
        }
        loadChats();
    }, []);

    const chatsList = [{
        _id: "1",
        groupChat: [{
            username: "Miles Morales",
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
            profileColour: 5
        }, {
            username: "user6",
            profileColour: 6
        }],
        state: "read"
    }, {
        _id: "4",
        groupChat: [{
            username: "Miles Kilometres",
            profileColour: 7
        }, {
            username: "user8",
            profileColour: 8
        }],
        state: "read"
    }, {
        _id: "5",
        groupChat: [{
            username: "SellMySite Bot",
            profileColour: 2
        }, {
            username: "user10",
            profileColour: 8
        }],
        state: "read"
    }];

    const toggleList = () => {
        setIsRecipientVisible(!isRecipientVisible);
    };

    const selectPrivateChat = (index) => {
        setLastChatIndex(index);
        toggleList();
    }

    const filterChats = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = privateChats.filter((chat) =>
            chat.groupChat.some((user) => user.username.toLowerCase().includes(query)
            )
        );
        setFilteredChats(filtered);
    };

    const displayChats = searchQuery ? filteredChats : chatsList;

    return (
        <div className={`${styles.messagesContainer} fadeIn`}>
            <div className={`${styles.messageRecipient} ${isRecipientVisible ? styles.shown : styles.hidden}`}>
                <div className={styles.messageHeader}>
                    <div className={styles.section}>
                        <div className={`${styles.messageSearch} ${styles.messageSection}`}>
                            <input maxLength='25' spellCheck="false" className={styles.input} type="text" value={searchQuery} onChange={filterChats}  placeholder="Search for a user..." />
                            <i className={`fa-solid fa-search ${styles.icon}`}></i>
                        </div>
                    </div>
                </div>

                <button onClick={() => dispatch(updateGroupCreateOptionState(true))} className={`${styles.group} button`}>Create Group</button>

                <div onClick={() => console.log(privateChats[0].participants)} className={styles.messageList}>
                    {displayChats.length === 0 ? (
                        <div className={styles.noResultsContainer}>
                            <p className={styles.noResults}>No results for "<span>{searchQuery}</span>"</p>
                        </div>
                    ) : (
                    displayChats.map((chat, index) => {
                        let profileColour = '/0.png'; // Default profile colour

                        if (chat.groupChat) {
                            if (chat.groupChat[0].username === localUsername) profileColour = `/${chat.groupChat[1].profileColour}.png`;
                            else profileColour = `/${chat.groupChat[0].profileColour}.png`;
                        }

                        return (
                            <div key={index} onClick={() => selectPrivateChat(index)} className={`${styles.message} ${lastChatIndex === index ? styles.selected : ''}`}>
                                <img src={profileColour} alt="Avatar" className={styles.avatar}/>
                                <div className={styles.messagePreview}>
                                    <p className={`${styles.username} ${chat.state === 'unread' ? styles.unread : styles.read}`}>
                                        {chat.groupChat && chat.groupChat[0].username === localUsername ? chat.groupChat[1].username : chat.groupChat[0].username}
                                    </p>
                                </div>
                            </div>
                        )})
                    )}
                </div>

            </div>

            <div className={styles.rightSide}>
                <i onClick={toggleList} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>
                {/* <ChatLogs id={privateChats[lastChatIndex]?._id} 
                        username={privateChats[lastChatIndex]?.groupChat[0].username === localUsername ? privateChats[lastChatIndex]?.groupChat[1].username : privateChats[lastChatIndex]?.groupChat[0].username } />  */}
            </div>

            {isGroupCreateOptionShown && <Create />}

        </div>
    );
};

export default Messages;