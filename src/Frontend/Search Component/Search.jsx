import styles from './Search.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQueryShown } from '../Redux/store';
import { useEffect, useRef } from 'react';
import SearchResults from './SearchResults/SearchResults';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    // Redux
    const isSearchQueryShown = useSelector(state => state.search.isSearchQueryShown);
    const dispatch = useDispatch();

    // React
    const searchComponent = useRef(null);
    const searchQuery = useRef(null);
    const searchIcon = useRef(null);

    const navigate = useNavigate();

    const searchSuggestions = ["Fun Website", "Discasery", "ReactTalk", "Projectarium", "LordBugsy's Projects"];

    const search = query => {
        if (searchIcon.current.classList.contains(styles.disabled)) return;
        else {
            navigate(`/search/${encodeURIComponent(query)}`);
            closeComponent();
        }
    }

    const updateIconState = () => {
        if (searchQuery.current.value.length > 0) searchIcon.current.classList.replace(styles.disabled, styles.active);
        else searchIcon.current.classList.replace(styles.active, styles.disabled);
    }

    const closeComponent = () => {
        if (searchComponent.current) searchComponent.current.classList.replace('growIn', 'growOut');

        setTimeout(() => {
            dispatch(setSearchQueryShown(false));
        }, 500);
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (searchComponent.current && event.target === searchComponent.current) closeComponent();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyPress = event => {
            if (event.key === 'Enter') search(searchQuery.current.value);
        }

        document.addEventListener('keydown', handleKeyPress);

        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (isSearchQueryShown) {
            searchQuery.current.focus();
        }
    }, []);

    return (
        <>
            {isSearchQueryShown && <div ref={searchComponent} className={`${styles.searchContainer} growIn`}>
                <div className={styles.searchSection}>
                    <i className={`fas fa-times ${styles.icon}`} onClick={closeComponent}></i>

                    <h1 className={styles.title}>What are you looking for?</h1>
                    <div className={styles.searchForm}>
                        <input onChange={updateIconState} ref={searchQuery} type="text" placeholder={searchSuggestions[Math.floor(Math.random() *searchSuggestions.length)]} />
                        <i ref={searchIcon} onClick={() => search(searchQuery.current.value)}className={`fas fa-search ${styles.disabled} ${styles.icon}`}></i>
                    </div>
                </div>
            </div>}
        </>
    );
}

export default Search;