import styles from './SellMySite.module.scss';
import PublishWebsite from '../Website Component/Publish/PublishWebsite';
import { useSelector, useDispatch } from 'react-redux';
import { setPublishWebsiteShown } from '../Redux/store';

const SellMySite = () => {
    // Redux
    const { isPublishWebsiteShown } = useSelector(state => state.publishWebsite);

    const dispatch = useDispatch();

    const openPublishOption = (option, boolean) => {
        dispatch(option(boolean));
    }

    return (
        <>
            <div className={styles.publish}>
                <button onClick={() => openPublishOption(setPublishWebsiteShown, true)}>Publish Website</button>
            </div>

            { isPublishWebsiteShown && <PublishWebsite /> }
        </>
    )
}

export default SellMySite;