import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { menuApi, getFileUrl } from '../services/api'
import MenuCard from '../components/MenuCard'
import './MenuDetailPage.css'

function MenuDetailPage() {
    const { id } = useParams()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [relatedItems, setRelatedItems] = useState([])
    const audioRef = useRef(null)

    useEffect(() => {
        setCurrentImageIndex(0)
        loadMenuItem()
    }, [id])

    useEffect(() => {
        if (item && !loading) {
            const timer = setTimeout(() => {
                playVoice()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [item, loading])

    const loadMenuItem = async () => {
        setLoading(true)
        try {
            const response = await menuApi.getById(id)
            const menuItem = response.data.data
            setItem(menuItem)

            // Fetch related items from same category
            if (menuItem.category_id) {
                const allRes = await menuApi.getAll()
                const all = allRes.data.data || []
                const related = all
                    .filter(i => i.category_id === menuItem.category_id && i.id !== menuItem.id)
                    .slice(0, 3)
                setRelatedItems(related)
            }
        } catch (error) {
            console.error('Error loading menu item:', error)
        } finally {
            setLoading(false)
        }
    }

    const playVoice = () => {
        if (!item) return

        if (item.voice_file) {
            const voiceUrl = getFileUrl(item.voice_file)
            if (audioRef.current) {
                audioRef.current.src = voiceUrl
                audioRef.current.play().catch(err => {
                    console.log('Audio playback failed:', err)
                })
                setIsPlaying(true)
            }
        } else if (item.voice_description) {
            const synth = window.speechSynthesis
            synth.cancel()
            const utterance = new SpeechSynthesisUtterance(item.voice_description)
            utterance.rate = 0.9
            utterance.onend = () => setIsPlaying(false)
            synth.speak(utterance)
            setIsPlaying(true)
        }
    }

    const stopVoice = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        window.speechSynthesis.cancel()
        setIsPlaying(false)
    }

    const toggleVoice = () => {
        if (isPlaying) {
            stopVoice()
        } else {
            playVoice()
        }
    }

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
            }
            window.speechSynthesis.cancel()
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isFullscreen])

    if (loading) {
        return (
            <div className="menu-detail-page">
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        )
    }

    if (!item) {
        return (
            <div className="menu-detail-page">
                <div className="menu-detail-error">
                    <h2>Menu tidak ditemukan</h2>
                    <Link to="/#menu" className="btn btn-primary">Kembali ke Menu</Link>
                </div>
            </div>
        )
    }

    const images = item.images && item.images.length > 0
        ? item.images.map(img => ({
            ...img,
            url: img.image_url.startsWith('http') ? img.image_url : getFileUrl(img.image_url)
        }))
        : item.image_url
            ? [{ url: item.image_url.startsWith('http') ? item.image_url : getFileUrl(item.image_url), is_main: true }]
            : [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop', is_main: true }]

    const currentImage = images[currentImageIndex]

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="menu-detail-page">
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

            {/* Back Navigation */}
            <nav className="detail-nav">
                <Link to="/#menu" className="back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>KEMBALI KE MENU</span>
                </Link>
                <Link to="/" className="logo">
                    <img src="/logo-light.png" alt="Zelan Bakery" className="detail-logo-img" />
                </Link>
            </nav>

            {/* Menu Detail Content */}
            <div className="menu-detail-content">
                {/* Image Section */}
                <div className="menu-detail-image-section">
                    <div className="image-card">
                        <div className="menu-detail-image" onClick={() => setIsFullscreen(true)}>
                            <img src={currentImage.url} alt={item.name} />

                            {item.is_featured && (
                                <div className="detail-featured-badge">
                                    <span>+</span> FAVORIT
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="carousel-nav-container">
                                <button className="carousel-btn carousel-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button className="carousel-btn carousel-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="carousel-thumbnails">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <img src={img.url} alt={`${item.name} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="menu-detail-info">
                    <div className="category-label">
                        <span>{item.category?.name?.toUpperCase() || 'KUE KERING PREMIUM'}</span>
                        <div className="category-line"></div>
                    </div>

                    <h1 className="product-name">{item.name}</h1>

                    <div className="detail-price">
                        <span className="price-amount">{item.price_display || `Rp ${item.price?.toLocaleString('id-ID')}`}</span>
                        {item.unit && <span className="price-unit">/ {item.unit}</span>}
                    </div>

                    <div className="price-divider"></div>

                    <p className="detail-description">
                        <strong>{item.name} dengan tekstur renyah di luar</strong> {item.voice_description || item.description}
                    </p>

                    <div className="detail-cta">
                        {(item.voice_file || item.voice_description) && (
                            <button
                                className={`btn btn-audio ${isPlaying ? 'playing' : ''}`}
                                onClick={toggleVoice}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                                {isPlaying ? 'Berhenti' : 'Putar Deskripsi Audio'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedItems.length > 0 && (
                <section className="related-section">
                    <div className="related-header">
                        <span className="related-badge">PRODUK LAINNYA</span>
                        <h2>Menu Serupa</h2>
                    </div>
                    <div className="related-grid">
                        {relatedItems.map(relItem => (
                            <MenuCard key={relItem.id} item={relItem} />
                        ))}
                    </div>
                </section>
            )}

            {/* Fullscreen Image Modal */}
            {isFullscreen && (
                <div className="fullscreen-modal" onClick={() => setIsFullscreen(false)}>
                    <button className="fullscreen-close" onClick={() => setIsFullscreen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={currentImage.url}
                        alt={item.name}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                className="fullscreen-nav fullscreen-prev"
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button
                                className="fullscreen-nav fullscreen-next"
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default MenuDetailPage
