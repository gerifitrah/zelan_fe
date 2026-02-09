import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { menuApi, categoriesApi, specialsApi, faqApi, getFileUrl } from '../services/api'
import MenuCard from '../components/MenuCard'
import './HomePage.css'

function HomePage() {
    const [categories, setCategories] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [specials, setSpecials] = useState([])
    const [faqs, setFaqs] = useState([])
    const [expandedFaq, setExpandedFaq] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 6
    const [galleryPage, setGalleryPage] = useState(0)
    const galleryPerPage = 9 // 3x3 grid
    const [fullscreenImage, setFullscreenImage] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    // Close fullscreen on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && fullscreenImage !== null) {
                setFullscreenImage(null)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [fullscreenImage])

    const loadData = async () => {
        try {
            const [categoriesRes, menuRes, specialsRes, faqsRes] = await Promise.all([
                categoriesApi.getAll(),
                menuApi.getAll(),
                specialsApi.getAll(),
                faqApi.getAll()
            ])
            setCategories(categoriesRes.data.data || [])
            setMenuItems(menuRes.data.data || [])
            setSpecials(specialsRes.data.data || [])
            setFaqs(faqsRes.data.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = (selectedCategory === 'all'
        ? menuItems.filter(item => item.tag)
        : menuItems.filter(item => item.category_id === parseInt(selectedCategory))
    ).sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const paginatedItems = filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setCurrentPage(0)
    }

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1)
        }
    }

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }

    // Build gallery from menu item images (no duplicate storage needed)
    const galleryFromMenu = menuItems
        .flatMap(item => {
            // If item has multiple images, use those
            if (item.images && item.images.length > 0) {
                return item.images.map(img => ({
                    id: img.id,
                    image_url: img.image_url,
                    caption: item.name
                }))
            }
            // Otherwise use single image_url if available
            if (item.image_url) {
                return [{
                    id: item.id,
                    image_url: item.image_url,
                    caption: item.name
                }]
            }
            return []
        })
        .slice(0, 12) // Limit to 12 images

    // Default gallery images if no menu images
    const defaultGalleryImages = [
        { id: 1, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', caption: 'Fresh Bread' },
        { id: 2, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop', caption: 'Pastries' },
        { id: 3, image_url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop', caption: 'Cakes' },
        { id: 4, image_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&h=600&fit=crop', caption: 'Cupcakes' },
        { id: 5, image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop', caption: 'Birthday Cake' },
        { id: 6, image_url: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800&h=600&fit=crop', caption: 'Bakery' }
    ]

    const displayGalleryImages = galleryFromMenu.length > 0 ? galleryFromMenu : defaultGalleryImages

    // Gallery pagination
    const totalGalleryPages = Math.ceil(displayGalleryImages.length / galleryPerPage)
    const paginatedGalleryImages = displayGalleryImages.slice(
        galleryPage * galleryPerPage,
        (galleryPage + 1) * galleryPerPage
    )

    const nextGalleryPage = () => {
        if (galleryPage < totalGalleryPages - 1) {
            setGalleryPage(galleryPage + 1)
        }
    }

    const prevGalleryPage = () => {
        if (galleryPage > 0) {
            setGalleryPage(galleryPage - 1)
        }
    }

    const openFullscreen = (index) => {
        // Calculate actual index in displayGalleryImages
        const actualIndex = galleryPage * galleryPerPage + index
        setFullscreenImage(actualIndex)
    }

    const nextFullscreenImage = () => {
        if (fullscreenImage < displayGalleryImages.length - 1) {
            setFullscreenImage(fullscreenImage + 1)
        }
    }

    const prevFullscreenImage = () => {
        if (fullscreenImage > 0) {
            setFullscreenImage(fullscreenImage - 1)
        }
    }

    return (
        <div className="home-page">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <div className="top-bar-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {/* <a href='https://www.google.com/maps?sca_esv=ae1e161c6b0f2947&sxsrf=ANbL-n70JN7olu6w6y7qfcc_oUbqV-RbNw:1769719310996&gs_lp=Egxnd3Mtd2l6LXNlcnAiBHplbGEqAggAMgQQIxgnMgUQABiABDIFEAAYgAQyBRAAGIAEMgkQABiABBgKGAsyBxAAGIAEGAoyBRAAGIAEMgUQLhiABDIFEC4YgAQyBRAAGIAESP0JUABYngRwAHgBkAEAmAGnAaABxQSqAQMxLjO4AQPIAQD4AQGYAgSgAtwEwgIREC4YgAQYkQIY0QMYxwEYigXCAgsQABiABBixAxiDAcICCBAuGIAEGLEDwgIOEC4YgAQYsQMY0QMYxwHCAgsQABiABBiRAhiKBcICChAAGIAEGEMYigXCAgoQLhiABBhDGIoFwgILEC4YgAQYxwEYrwHCAggQABiABBixA8ICDRAuGIAEGLEDGEMYigXCAhAQABiABBixAxhDGIMBGIoFwgIQEC4YgAQYsQMYQxiDARiKBZgDAJIHAzAuNKAH9EyyBwMwLjS4B9wEwgcDMi00yAcTgAgA&um=1&ie=UTF-8&fb=1&gl=id&sa=X&geocode=KRe-3kwAP9ItMaPCPYCLRqOf&daddr=20,+Jl.+Bung+Tomo+VII+No.5,+Pemecutan+Kaja,+Kec.+Denpasar+Utara,+Kota+Denpasar,+Bali+80111'target="_blank" rel="noopener noreferrer"> */}
                        <span >Jl. Bung Tomo VII No. 5, Denpasar, Bali</span>
                        {/* </a> */}
                    </div>
                    <div className="top-bar-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                        <span>08:00 - 20:00</span>
                    </div>
                </div>
                <div className="top-bar-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer">0895-3854-55669</a>
                </div>
            </div>

            {/* Navigation */}
            <nav className="main-nav">
                <a href="#" className="logo">
                    <img src="/logo-light.png" alt="Zelan Bakery" className="logo-img" />
                </a>
                <ul className={`nav-links ${selectedCategory === 'mobile-menu' ? 'active' : ''}`}>
                    <li><a href="#home" onClick={() => setSelectedCategory('all')}>Home</a></li>
                    <li><a href="#menu" onClick={() => setSelectedCategory('all')}>Menu</a></li>
                    {/* <li><a href="#specials" onClick={() => setSelectedCategory('all')}>Promo</a></li> */}
                    <li><a href="#about" onClick={() => setSelectedCategory('all')}>About</a></li>
                    <li><a href="#faq" onClick={() => setSelectedCategory('all')}>FAQ</a></li>
                    <li><a href="#gallery" onClick={() => setSelectedCategory('all')}>Gallery</a></li>
                    <li><a href="#contact" onClick={() => setSelectedCategory('all')}>Contact</a></li>
                    <li><a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer" className="nav-cta">Order Now</a></li>
                </ul>
                <button
                    className={`mobile-menu-toggle ${selectedCategory === 'mobile-menu' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === 'mobile-menu' ? 'all' : 'mobile-menu')}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>


            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <div className="hero-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Freshly Baked with Love
                    </div>
                    <h1>Zelan <span>Bakery</span> & Cake</h1>
                    {/* <p>Menghadirkan produk berkualitas yang dapat dinikmati bersama keluarga. Dibuat dengan cinta, resep terbaik, dan bahan pilihan sejak 2023.</p> */}
                    {<p>UMKM bakery Bali yang terus berkembang, menghadirkan roti dan kue lezat untuk kebutuhan harian hingga acara keluarga.</p>}
                    <div className="hero-buttons">
                        <a href="#menu" className="btn btn-primary">
                            Lihat Menu
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        <a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            WhatsApp
                        </a>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=750&fit=crop" alt="Fresh Bakery" className="hero-image-main" />
                    <div className="hero-decoration"></div>
                </div>
            </section>

            {/* Menu Section */}
            <section className="menu-section" id="menu">
                <div className="section-header">
                    <div className="section-badge">Menu Kami</div>
                    <h2>Produk Pilihan</h2>
                    <p>Klik menu untuk melihat detail dan mendengar deskripsi.</p>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="menu-categories">
                            <button
                                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('all')}
                            >
                                Favorit
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(cat.id.toString())}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="menu-grid">
                            {paginatedItems.map((item) => (
                                <MenuCard key={item.id} item={item} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-dots">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`pagination-dot ${i === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i)}
                                    />
                                ))}
                            </div>
                        )}

                        {filteredItems.length === 0 && (
                            <div className="empty-menu">
                                <p>Belum ada menu tersedia.</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* About Section */}
            <section className="about-section" id="about">
                <div className="about-image-single">
                    <img src="/owners.jpg" alt="Founders - Lana & Zen" />
                </div>
                <div className="about-content">
                    <div className="section-badge">Tentang Kami</div>
                    <h2>Zelan Bakery & Cake</h2>
                    <p>Zelan Bakery and Cake lahir dari kecintaan terhadap dunia baking dan keinginan untuk menghadirkan produk berkualitas yang dapat dinikmati bersama keluarga.</p>
                    <p>Didirikan pada <strong>19 Juni 2023</strong> oleh <strong>Lana Aristya dan Zen</strong>, Zelan hadir di Bali dengan komitmen pada rasa, kualitas, dan kehangatan dalam setiap produk.</p>
                    <div className="about-features">
                        <div className="about-feature">
                            <div className="about-feature-number">2023</div>
                            <div className="about-feature-label">Berdiri</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-number">20+</div>
                            <div className="about-feature-label">Produk</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-number">100%</div>
                            <div className="about-feature-label">Fresh</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section" id="faq">
                <div className="section-header">
                    <div className="section-badge">FAQ</div>
                    <h2>Pertanyaan Umum</h2>
                    <p>Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                </div>
                <div className="faq-list">
                    {faqs.map(faq => (
                        <div
                            key={faq.id}
                            className={`faq-item ${expandedFaq === faq.id ? 'expanded' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            >
                                <span>{faq.question}</span>
                                <svg
                                    className="faq-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Gallery Section */}
            <section className="gallery-section" id="gallery">
                <div className="section-header">
                    <div className="section-badge">Galeri</div>
                    <h2>Momen Bersama Zelan</h2>
                    <p>Lihat koleksi foto produk dan momen spesial kami</p>
                </div>

                {displayGalleryImages.length > 0 && (
                    <>
                        <div className="gallery-grid-wrapper">
                            {totalGalleryPages > 1 && (
                                <button
                                    className="gallery-page-arrow gallery-page-prev"
                                    onClick={prevGalleryPage}
                                    disabled={galleryPage === 0}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                            )}

                            <div className="gallery-grid">
                                {paginatedGalleryImages.map((img, index) => (
                                    <div
                                        key={img.id || index}
                                        className="gallery-grid-item"
                                        onClick={() => openFullscreen(index)}
                                    >
                                        <img
                                            src={img.image_url?.startsWith('http') ? img.image_url : getFileUrl(img.image_url)}
                                            alt={img.caption || `Gallery ${index + 1}`}
                                        />
                                        {img.caption && (
                                            <div className="gallery-grid-caption">{img.caption}</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {totalGalleryPages > 1 && (
                                <button
                                    className="gallery-page-arrow gallery-page-next"
                                    onClick={nextGalleryPage}
                                    disabled={galleryPage === totalGalleryPages - 1}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {totalGalleryPages > 1 && (
                            <div className="gallery-page-dots">
                                {Array.from({ length: totalGalleryPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`gallery-page-dot ${i === galleryPage ? 'active' : ''}`}
                                        onClick={() => setGalleryPage(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Maps Section */}
            <section className="maps-section" id="maps">
                <div className="section-header">
                    <div className="section-badge">Lokasi</div>
                    <h2>Temukan Kami</h2>
                    <p>Jl. Bung Tomo VII No. 5, Pemecutan Kaja, Denpasar Utara, Bali</p>
                </div>
                <div className="maps-container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3569.5635178748003!2d115.19842127456789!3d-8.644277187911532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23f004cdebe17%3A0x9fa3468b803dc2a3!2sZelan%20bakery%20n%20cake!5e1!3m2!1sen!2sid!4v1769881031635!5m2!1sen!2sid"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Zelan Bakery Location"
                    ></iframe>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section" id="contact">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h3>Hubungi Kami</h3>
                        <div className="contact-item">
                            <div className="contact-item-icon">
                                <a href="https://www.google.com/maps?sca_esv=ae1e161c6b0f2947&sxsrf=ANbL-n70JN7olu6w6y7qfcc_oUbqV-RbNw:1769719310996&gs_lp=Egxnd3Mtd2l6LXNlcnAiBHplbGEqAggAMgQQIxgnMgUQABiABDIFEAAYgAQyBRAAGIAEMgkQABiABBgKGAsyBxAAGIAEGAoyBRAAGIAEMgUQLhiABDIFEC4YgAQyBRAAGIAESP0JUABYngRwAHgBkAEAmAGnAaABxQSqAQMxLjO4AQPIAQD4AQGYAgSgAtwEwgIREC4YgAQYkQIY0QMYxwEYigXCAgsQABiABBixAxiDAcICCBAuGIAEGLEDwgIOEC4YgAQYsQMY0QMYxwHCAgsQABiABBiRAhiKBcICChAAGIAEGEMYigXCAgoQLhiABBhDGIoFwgILEC4YgAQYxwEYrwHCAggQABiABBixA8ICDRAuGIAEGLEDGEMYigXCAhAQABiABBixAxhDGIMBGIoFwgIQEC4YgAQYsQMYQxiDARiKBZgDAJIHAzAuNKAH9EyyBwMwLjS4B9wEwgcDMi00yAcTgAgA&um=1&ie=UTF-8&fb=1&gl=id&sa=X&geocode=KRe-3kwAP9ItMaPCPYCLRqOf&daddr=20,+Jl.+Bung+Tomo+VII+No.5,+Pemecutan+Kaja,+Kec.+Denpasar+Utara,+Kota+Denpasar,+Bali+80111" target="_blank" rel="noopener noreferrer">
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </a>
                            </div>
                            <div>
                                <h4>Alamat</h4>
                                <p>Jl. Bung Tomo VII No. 5<br />Pemecutan Kaja, Denpasar Utara, Bali</p>
                                
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                            <div>
                                <h4>Jam Buka</h4>
                                <p>Setiap Hari<br />08:00 - 20:00</p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-item-icon wa-icon">
                                <a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                </a>
                            </div>
                            <div>
                                <h4>WhatsApp</h4>
                                <p>0895-3854-55669</p>
                                {/* <p><a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer">0895-3854-55669</a></p> */}
                            </div>
                        </div>

                        <div className="social-links">
                            <a href="https://www.instagram.com/zelanbakeryncake" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                @zelanbakeryncake
                            </a>
                            <a href="https://www.tiktok.com/@zelanbakeryncake" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                                @zelanbakeryncake
                            </a>
                        </div>
                    </div>
                    <div className="contact-cta">
                        <h3>Pesan Sekarang!</h3>
                        <p>Hubungi kami via WhatsApp untuk pemesanan, custom cake, atau informasi lebih lanjut.</p>
                        <a href="https://wa.me/62895385455669" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="/logo-light.png" alt="Zelan Bakery" />
                    </div>
                    <div className="footer-links">
                        <a href="#home">Home</a>
                        <a href="#menu">Menu</a>
                        <a href="#about">About</a>
                        <a href="#gallery">Gallery</a>
                    </div>
                    <p className="footer-copy">© 2023 Zelan Bakery & Cake. All rights reserved.</p>
                </div>
            </footer>

            {/* Voice Hint */}
            {/* <div className="voice-hint">
                <svg viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                Klik menu untuk dengar deskripsi
            </div> */}

            {/* Fullscreen Gallery Modal */}
            {fullscreenImage !== null && (
                <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
                    <button className="fullscreen-close" onClick={() => setFullscreenImage(null)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={displayGalleryImages[fullscreenImage]?.image_url?.startsWith('http')
                            ? displayGalleryImages[fullscreenImage].image_url
                            : getFileUrl(displayGalleryImages[fullscreenImage]?.image_url)}
                        alt={displayGalleryImages[fullscreenImage]?.caption || 'Gallery'}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {displayGalleryImages[fullscreenImage]?.caption && (
                        <div className="fullscreen-caption">
                            {displayGalleryImages[fullscreenImage].caption}
                        </div>
                    )}
                    {displayGalleryImages.length > 1 && (
                        <>
                            <button
                                className="fullscreen-nav fullscreen-prev"
                                onClick={(e) => { e.stopPropagation(); prevFullscreenImage(); }}
                                disabled={fullscreenImage === 0}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button
                                className="fullscreen-nav fullscreen-next"
                                onClick={(e) => { e.stopPropagation(); nextFullscreenImage(); }}
                                disabled={fullscreenImage === displayGalleryImages.length - 1}
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

export default HomePage
