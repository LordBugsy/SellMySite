import styles from './Messages.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import Create from './Group Chat/Create';
import ChatLogs from './ChatLogs/ChatLogs';
import axios from 'axios';
import { updateGroupCreateOptionState } from '../Redux/store';

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
    const [mutualFollowers, setMutualFollowers] = useState([]);

    useEffect(() => {
        document.title = "Private Messages - SellMySite";
    }, []);

    const loadChats = async () => {
        if (!localUserId) return;

        try {
            const backendResponse = await axios.get(`http://localhost:5172/chatlogs/${localUserId}`);
            setMutualFollowers(backendResponse.data.mutualFollowers);
            updatePrivateChats(backendResponse.data.joinedChats);
        }

        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadChats();
    }, [localUserId]);

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
          chat.participants?.some(
            (user) => user.username.toLowerCase().includes(query)
          )
        );
        setFilteredChats(filtered);
    };

    const displayChats = searchQuery ? filteredChats : privateChats;

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

                <div className={styles.messageList}>
                    {displayChats.length === 0 ? (
                        <div className={styles.noResultsContainer}>
                            {searchQuery.length === 0 ? (
                                <p className={styles.noResults}>You have no messages.</p>
                            ) : (
                                <p className={styles.noResults}>No results for "<span>{searchQuery}</span>"</p>
                            )}
                        </div>
                    ) : (
                    displayChats.map((chat, index) => {
                        let chatData;
                        if (chat.type === "direct") {
                            chatData = chat.participants[0].username === localUsername ? chat.participants[1] : chat.participants[0];
                        }

                        else {
                            chatData = chat;
                        }

                        return (
                            <div key={index} onClick={() => selectPrivateChat(index)} className={`${styles.message} ${lastChatIndex === index ? styles.selected : ''}`}>
                                <img src={chat.type === "direct" ? 
                                    `/${chatData.profilePicture}.png` : 
                                    `/${chatData.createdBy?.profilePicture}.png`}
                                    alt="Avatar" className={styles.avatar}
                                />

                                <div className={styles.messagePreview}>
                                    <p className={styles.displayName}>{chatData.displayName || `${privateChats[index]?.participants[0].displayName}'s Group Chat`}</p>
                                    {chat.type === "direct" && <p className={styles.username}>@{chatData.username || privateChats[index]?.participants[0].username}</p>}
                                </div>
                            </div>
                        )})
                    )}
                </div>

            </div>

            <div className={styles.rightSide}>
                <i onClick={toggleList} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>
                <ChatLogs 
                    id={privateChats[lastChatIndex]?._id} 
                    username={privateChats[lastChatIndex]?.type === "direct" ? 
                        privateChats[lastChatIndex]?.participants[0].username === localUsername ? privateChats[lastChatIndex]?.participants[1].username : privateChats[lastChatIndex]?.participants[0].username 
                                : "Group Chat"} // This whole line is a mess, but depending on whether or not the last chat is a direct message or a group chat, it will display the correct "username"
                />
            </div>

            {isGroupCreateOptionShown && <Create mutualFollowersData={mutualFollowers} onCreate={loadChats} />}

        </div>
    );
};

export default Messages;