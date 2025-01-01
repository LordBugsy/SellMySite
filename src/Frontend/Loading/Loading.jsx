import styles from './Loading.module.scss'; 

const Loading = (props) => {
    return (
        <div className={`${styles.Loading} ${props.componentClass ? '' : styles.fixed}`}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default Loading;