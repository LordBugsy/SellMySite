import styles from './SendMessage.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SendMessage = (props) => {
    const apiURL = "https://sellmysite-backend.onrender.com";

    // Redux
    const localUserId = useSelector((state) => state.user.user.localUserId);

    // React
    const messageAreaRef = useRef(null);
    const attachementRef = useRef(null);

    const [attachementOn, updateAttachementOn] = useState(false);

    useEffect(() => {
        const handleInput = () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.style.height = 'auto';
                messageAreaRef.current.style.height = `${Math.min(messageAreaRef.current.scrollHeight, 335)}px`;
            }
        };

        const textArea = messageAreaRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (messageAreaRef.current) messageAreaRef.current.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        };
        
        if (messageAreaRef.current) {
            messageAreaRef.current.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [props.id]);

    const addAttachment = () => {
        updateAttachementOn(bool => !bool);
    }

    const sendMessage = async () => {
        if (!props.id) return;
    
        const imgurRegex = /^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{7}\.(?:jpg|jpeg|png|gif|webp)$/;

        try {
            const response = await axios.post(`${apiURL}/chatlogs/send`, {
                chatID: props.id,
                attachment: imgurRegex.test(attachementRef.current?.value.trim()) && attachementOn ? attachementRef.current.value.trim() : undefined,
                text: messageAreaRef.current.value?.trim(),
                sender: localUserId,
            });
    
            setTimeout(() => {
                if (props.onMessageSent) {
                    props.onMessageSent();
                }
            }, 200);
        }
    
        catch (error) {
            // console.error('An error occurred while sending the message:', error);
        }
    
        finally {
            messageAreaRef.current.style.height = 'auto';
            messageAreaRef.current.value = '';

            if (attachementRef.current) {
                attachementRef.current.value = '';
            }
        }
    };

    return (
        <>
        <div className={styles.textAreaContainer}>
            <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={`Message ${props.username}`}></textarea>
            
            <div onClick={addAttachment} className={styles.iconBackground}>
                <i className={`fas fa-paperclip ${styles.icon} ${styles.attachement}`}></i>
            </div>

            <div onClick={sendMessage} className={styles.iconBackground}>
                <i className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
            </div>
        </div>

        {attachementOn && (
            <div className={styles.attachementContainer}>
                <input type='text' ref={attachementRef} className={styles.input} placeholder="Enter an imgur image's link.." />
            </div>
        )}
        </>
    )
};

export default SendMessage;