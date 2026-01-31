import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { menuApi, getFileUrl } from '../services/api'
import './MenuDetailPage.css'

function MenuDetailPage() {
    const { id } = useParams()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        loadMenuItem()
    }, [id])

    useEffect(() => {
        // Auto-play voice when item is loaded
        if (item && !loading) {
            const timer = setTimeout(() => {
                playVoice()
            }, 500) // Small delay for better UX
            return () => clearTimeout(timer)
        }
    }, [item, loading])

    const loadMenuItem = async () => {
        try {
            const response = await menuApi.getById(id)
            setItem(response.data.data)
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
            }
            window.speechSynthesis.cancel()
        }
    }, [])

    // Close fullscreen on ESC key
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

    // Get images array or fallback to single image
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
                    Kembali ke Menu
                </Link>
                <Link to="/" className="logo">
                    <img src="/logo-light.png" alt="Zelan Bakery" className="logo-img" />
                </Link>
            </nav>

            {/* Menu Detail Content */}
            <div className="menu-detail-content">
                <div className="menu-detail-image-section">
                    <div className="menu-detail-image" onClick={() => setIsFullscreen(true)}>
                        <img src={currentImage.url} alt={item.name} />

                        {/* Carousel Navigation */}
                        {images.length > 1 && (
                            <>
                                <button className="carousel-btn carousel-prev" onClick={prevImage}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button className="carousel-btn carousel-next" onClick={nextImage}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {item.is_featured && (
                            <div className="detail-featured-badge">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Favorit
                            </div>
                        )}
                        {item.tag && (
                            <div className="detail-tag">{item.tag}</div>
                        )}
                    </div>

                    {/* Thumbnails - Below Image */}
                    {images.length > 1 && (
                        <div className="carousel-thumbnails">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''} ${img.is_main ? 'is-main' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <img src={img.url} alt={`${item.name} ${index + 1}`} />
                                    {img.is_main && <span className="main-badge">Main</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="menu-detail-info">
                    <h1>{item.name}</h1>
                    <div className="detail-price">
                        {item.price_display || `Rp ${item.price?.toLocaleString('id-ID')}`}
                    </div>
                    {/* <p className="detail-description">{item.description}</p> */}
                    <p className="detail-description">{item.voice_description}</p>

                    {/* Voice Control */}
                    {(item.voice_file || item.voice_description) && (
                        <div className="voice-control">
                            <button
                                className={`voice-btn ${isPlaying ? 'playing' : ''}`}
                                onClick={toggleVoice}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                                {isPlaying ? 'Berhenti' : 'Putar Deskripsi'}
                            </button>
                            <span className="voice-hint-text">
                                {isPlaying ? 'Sedang memutar...' : 'Klik untuk mendengar deskripsi produk'}
                            </span>
                        </div>
                    )}

                    {/* Order CTA */}
                    <div className="detail-cta">
                        <a
                            href={`https://wa.me/62895385455669?text=Halo, saya ingin memesan ${item.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Pesan via WhatsApp
                        </a>
                    </div>
                </div>
            </div>

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
