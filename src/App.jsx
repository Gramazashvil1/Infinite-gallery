import {useEffect, useState} from "react";
import "./App.scss";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Masonry from "react-masonry-css";

function App() {

    const [images, setImages] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [query, setQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [scrollButton, setScrollButton] = useState(false);
    const [customAlert, setCustomAlert] = useState(false);
    const accessKey = import.meta.env.VITE_API_KEY;

    async function getPhotos() {
        const apiLink = `https://api.unsplash.com/${
            query
                ? `search/photos?page=${pageIndex}&client_id=${accessKey}&query=${query}`
                : `photos?page=${pageIndex}&client_id=${accessKey}`
        }`;
        try {
            const {data} = await axios.get(apiLink);
            const apiData = query ? data.results : data;
            if (pageIndex === 1) setImages([]);
            setImages(prevImages => [...prevImages, ...apiData]);
            setCustomAlert(apiData.length < 1);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setIsLoading(false), 250);
        }
    }

    useEffect(() => {
        getPhotos();
    }, [query, pageIndex]);

    useEffect(() => {
        const btnVisibility = () => setScrollButton(window.pageYOffset > 300);
        window.addEventListener('scroll', btnVisibility);
        return () => window.removeEventListener('scroll', btnVisibility);
    }, []);

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    function queryPhotos(e) {
        e.preventDefault();
        getPhotos();
        setIsLoading(true);
        setPageIndex(1);
        setQuery(inputValue)
        setInputValue('')
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }
    }

    function handleInputChange(e) {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
        setInputValue(filteredValue);
    }

    const breakpoints = {
        default: 3,
        1024: 2,
        650: 1,
    };

    return (
        <>
            {scrollButton && (<button className="scroll_Top" onClick={scrollToTop}>Top</button>)}
            <div className={`preloader ${isLoading ? '' : 'fade-out'}`}></div>
            <main>
                <header>
                    <h1><span>Infinite</span> Scroll Image Gallery</h1>
                    <form onSubmit={queryPhotos}>
                        <input
                            type="text"
                            name="query"
                            placeholder="Search photo..."
                            value={inputValue}
                            onChange={handleInputChange}
                            required
                            autoComplete="off"
                        />
                        <button type="submit">Search</button>
                    </form>
                </header>
                <InfiniteScroll
                    dataLength={images.length}
                    next={() => setPageIndex((pageIndex) => pageIndex + 1)}
                    hasMore={images.length >= 10}
                    scrollThreshold={images.length < 80 ? 0.4 : undefined}
                    loader={''}
                >
                    <div className={`alert ${customAlert ? '' : 'alert-fade-out'}`}>
                        <p>No images found. Please check your search terms or try different keywords.</p>
                        <div className="not_found">
                            <span>NOT FOUND</span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <Masonry
                        breakpointCols={breakpoints}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {images.map((image, index) => (
                            <div className="grid-item" key={index}>
                                <a href={image.links.html} target="_blank" rel="noopener noreferrer">
                                    <img src={image.urls.small} alt={image.alt_description}/>
                                </a>
                            </div>
                        ))}
                    </Masonry>
                </InfiniteScroll>
            </main>
        </>
    );
}

export default App;