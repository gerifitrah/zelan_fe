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
                    <span>KEMBALI KE MENU</span>
                </Link>
                <Link to="/" className="logo">
                    <span className="logo-text">Zelan.</span>
                </Link>
            </nav>

            {/* Menu Detail Content */}
            <div className="menu-detail-content">
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

                        {/* Carousel Navigation - Inside card at bottom */}
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

                    {/* Thumbnails - Below Image */}
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

                <div className="menu-detail-info">
                    {/* Category Label */}
                    <div className="category-label">
                        <span>{item.category?.name?.toUpperCase() || 'KUE KERING PREMIUM'}</span>
                        <div className="category-line"></div>
                    </div>

                    {/* Product Name */}
                    <h1 className="product-name">{item.name}</h1>

                    {/* Price */}
                    <div className="detail-price">
                        <span className="price-amount">{item.price_display || `Rp ${item.price?.toLocaleString('id-ID')}`}</span>
                        {item.unit && <span className="price-unit">/ {item.unit}</span>}
                    </div>

                    {/* Divider */}
                    <div className="price-divider"></div>

                    {/* Description */}
                    <p className="detail-description">
                        <strong>{item.name} dengan tekstur renyah di luar</strong> {item.voice_description || item.description}
                    </p>

                    {/* Info Cards */}
                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                            <div className="info-label">FRESH BAKED</div>
                            <div className="info-value">Setiap Hari</div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                            <div className="info-label">ISI</div>
                            <div className="info-value">{item.quantity || '±50 pcs'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                            </div>
                            <div className="info-label">KUALITAS</div>
                            <div className="info-value">Premium</div>
                        </div>
                    </div>

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

                        {/* Voice Control */}
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
