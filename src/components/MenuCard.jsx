import { Link } from 'react-router-dom'
import { getFileUrl } from '../services/api'
import './MenuCard.css'

function MenuCard({ item }) {
    // Get main image from images array, fallback to image_url for backward compatibility
    const getMainImage = () => {
        if (item.images && item.images.length > 0) {
            const mainImage = item.images.find(img => img.is_main) || item.images[0]
            return mainImage.image_url.startsWith('http')
                ? mainImage.image_url
                : getFileUrl(mainImage.image_url)
        }
        if (item.image_url) {
            return item.image_url.startsWith('http')
                ? item.image_url
                : getFileUrl(item.image_url)
        }
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'
    }

    const imageUrl = getMainImage()

    return (
        <Link to={`/menu/${item.id}`} className="menu-card">
            <div className="menu-card-image">
                <img src={imageUrl} alt={item.name} />
                <div className="menu-card-overlay"></div>

                {/* {(item.voice_file || item.voice_description) && (
                    <div className="voice-indicator">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                    </div>
                )} */}

                {item.is_featured && (
                    <div className="menu-card-featured">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                )}

                {item.tag && (
                    <div className="menu-card-tag">{item.tag}</div>
                )}
            </div>

            <div className="menu-card-content">
                <div className="menu-card-header">
                    <h3>{item.name}</h3>
                    <div className="menu-card-price">
                        {item.price_display || `${(item.price / 1000).toFixed(0)}K`}
                    </div>
                </div>
                <p>{item.description}</p>
            </div>
        </Link>
    )
}

export default MenuCard
