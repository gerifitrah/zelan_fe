import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { menuApi, categoriesApi, statsApi, authApi, faqApi, getFileUrl } from '../services/api'
import './AdminPage.css'

function AdminPage() {
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [featuredFilter, setFeaturedFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        price_display: '',
        description: '',
        voice_description: '',
        image_url: '',
        tag: '',
        is_featured: false
    })
    const [voiceFile, setVoiceFile] = useState(null)
    const [itemImages, setItemImages] = useState([])
    const [newItemImageFiles, setNewItemImageFiles] = useState([]) // For new items - stores files before creation
    const [uploadingImage, setUploadingImage] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [menuRes, categoriesRes, statsRes, faqsRes] = await Promise.all([
                menuApi.getAll({ available: 'all' }),
                categoriesApi.getAll(),
                statsApi.get(),
                faqApi.getAll()
            ])
            setMenuItems(menuRes.data.data || [])
            setCategories(categoriesRes.data.data || [])
            setStats(statsRes.data.data || {})
            setFaqs(faqsRes.data.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
            showToast('Failed to load data', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('authToken')
            localStorage.removeItem('isAuthenticated')
            navigate('/login')
        }
    }

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    const openModal = async (item = null) => {
        if (item) {
            // Fetch full item data including images
            try {
                const response = await menuApi.getById(item.id)
                const fullItem = response.data.data
                setEditingItem(fullItem)
                setFormData({
                    name: fullItem.name,
                    category_id: fullItem.category_id,
                    price: fullItem.price,
                    price_display: fullItem.price_display || '',
                    description: fullItem.description,
                    voice_description: fullItem.voice_description || '',
                    image_url: fullItem.image_url || '',
                    tag: fullItem.tag || '',
                    is_featured: fullItem.is_featured
                })
                setItemImages(fullItem.images || [])
            } catch (error) {
                console.error('Error loading item details:', error)
                showToast('Failed to load item details', 'error')
                return
            }
        } else {
            setEditingItem(null)
            setFormData({
                name: '',
                category_id: categories[0]?.id || '',
                price: '',
                price_display: '',
                description: '',
                voice_description: '',
                image_url: '',
                tag: '',
                is_featured: false
            })
            setItemImages([])
            setNewItemImageFiles([])
        }
        setVoiceFile(null)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingItem(null)
        setVoiceFile(null)
        setItemImages([])
        setNewItemImageFiles([])
    }

    // Image management functions
    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file || !editingItem) return

        if (itemImages.length >= 4) {
            showToast('Maximum 4 images allowed', 'error')
            return
        }

        setUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('image', file)
            await menuApi.uploadImage(editingItem.id, formData)
            showToast('Image uploaded')
            // Reload the item to get updated images
            const response = await menuApi.getById(editingItem.id)
            setItemImages(response.data.data.images || [])
            setEditingItem(response.data.data)
            loadData()
        } catch (error) {
            console.error('Error uploading image:', error)
            showToast('Failed to upload image', 'error')
        } finally {
            setUploadingImage(false)
            e.target.value = ''
        }
    }

    const handleDeleteImage = async (imageId) => {
        if (!editingItem) return
        if (!confirm('Delete this image?')) return

        try {
            await menuApi.deleteImage(editingItem.id, imageId)
            showToast('Image deleted')
            const response = await menuApi.getById(editingItem.id)
            setItemImages(response.data.data.images || [])
            setEditingItem(response.data.data)
            loadData()
        } catch (error) {
            console.error('Error deleting image:', error)
            showToast('Failed to delete image', 'error')
        }
    }

    const handleSetMainImage = async (imageId) => {
        if (!editingItem) return

        try {
            await menuApi.setMainImage(editingItem.id, imageId)
            showToast('Main image updated')
            const response = await menuApi.getById(editingItem.id)
            setItemImages(response.data.data.images || [])
            setEditingItem(response.data.data)
            loadData()
        } catch (error) {
            console.error('Error setting main image:', error)
            showToast('Failed to set main image', 'error')
        }
    }

    // Handle adding images for NEW items (before creation)
    const handleNewItemImageAdd = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (newItemImageFiles.length >= 4) {
            showToast('Maximum 4 images allowed', 'error')
            return
        }

        // Create a preview URL and store the file
        const preview = URL.createObjectURL(file)
        setNewItemImageFiles(prev => [...prev, { file, preview, id: Date.now() }])
        e.target.value = ''
    }

    // Remove a temporarily added image for new items
    const handleNewItemImageRemove = (id) => {
        setNewItemImageFiles(prev => {
            const item = prev.find(img => img.id === id)
            if (item) URL.revokeObjectURL(item.preview)
            return prev.filter(img => img.id !== id)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const data = new FormData()
            Object.keys(formData).forEach(key => {
                // Skip image_url - images are managed separately via Images section
                if (key === 'image_url') return
                if (formData[key] !== '' && formData[key] !== null) {
                    data.append(key, formData[key])
                }
            })

            if (voiceFile) {
                data.append('voice_file', voiceFile)
            }

            if (editingItem) {
                await menuApi.update(editingItem.id, data)
                showToast('Menu item updated successfully')
                closeModal()
                loadData()
            } else {
                // Create the item first
                const response = await menuApi.create(data)
                const newItem = response.data.data

                // Upload all temporary images for the new item
                if (newItem && newItem.id && newItemImageFiles.length > 0) {
                    for (const img of newItemImageFiles) {
                        const imgFormData = new FormData()
                        imgFormData.append('image', img.file)
                        await menuApi.uploadImage(newItem.id, imgFormData)
                        URL.revokeObjectURL(img.preview) // Clean up preview URL
                    }
                }

                showToast('Menu item created successfully')
                closeModal()
                loadData()
            }
        } catch (error) {
            console.error('Error saving menu item:', error)
            showToast('Failed to save menu item', 'error')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            await menuApi.delete(id)
            showToast('Menu item deleted')
            loadData()
        } catch (error) {
            console.error('Error deleting item:', error)
            showToast('Failed to delete item', 'error')
        }
    }

    const previewVoice = () => {
        if (voiceFile) {
            const url = URL.createObjectURL(voiceFile)
            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.play()
            }
        } else if (editingItem?.voice_file) {
            const url = getFileUrl(editingItem.voice_file)
            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.play()
            }
        } else if (formData.voice_description) {
            const synth = window.speechSynthesis
            synth.cancel()
            const utterance = new SpeechSynthesisUtterance(formData.voice_description)
            utterance.rate = 0.9
            synth.speak(utterance)
        }
    }

    const stopVoice = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        window.speechSynthesis.cancel()
    }

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFeatured = featuredFilter === 'all' ||
            (featuredFilter === 'featured' && item.is_featured) ||
            (featuredFilter === 'not_featured' && !item.is_featured)
        const matchesCategory = categoryFilter === 'all' ||
            item.category_id === parseInt(categoryFilter)
        return matchesSearch && matchesFeatured && matchesCategory
    })

    // Category management
    const [newCategory, setNewCategory] = useState('')

    // FAQ management
    const [faqs, setFaqs] = useState([])
    const [showFaqModal, setShowFaqModal] = useState(false)
    const [editingFaq, setEditingFaq] = useState(null)
    const [faqFormData, setFaqFormData] = useState({ question: '', answer: '' })

    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [registerFormData, setRegisterFormData] = useState({ username: '', password: '', name: '' })

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [changePasswordFormData, setChangePasswordFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

    // Admin management
    const [admins, setAdmins] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)

    // Tab navigation
    const [activeTab, setActiveTab] = useState('menu-items')

    // KPI filter state
    const [kpiFilter, setKpiFilter] = useState(null)

    const addCategory = async () => {
        if (!newCategory.trim()) return
        try {
            await categoriesApi.create({ name: newCategory })
            setNewCategory('')
            loadData()
            showToast('Category added')
        } catch (error) {
            showToast('Failed to add category', 'error')
        }
    }

    const deleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return
        try {
            await categoriesApi.delete(id)
            loadData()
            showToast('Category deleted')
        } catch (error) {
            showToast('Cannot delete category with items', 'error')
        }
    }

    // FAQ functions
    const openFaqModal = (faq = null) => {
        if (faq) {
            setEditingFaq(faq)
            setFaqFormData({ question: faq.question, answer: faq.answer })
        } else {
            setEditingFaq(null)
            setFaqFormData({ question: '', answer: '' })
        }
        setShowFaqModal(true)
    }

    const closeFaqModal = () => {
        setShowFaqModal(false)
        setEditingFaq(null)
        setFaqFormData({ question: '', answer: '' })
    }

    const handleFaqSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingFaq) {
                await faqApi.update(editingFaq.id, faqFormData)
                showToast('FAQ updated successfully')
            } else {
                await faqApi.create(faqFormData)
                showToast('FAQ created successfully')
            }
            closeFaqModal()
            loadData()
        } catch (error) {
            console.error('Error saving FAQ:', error)
            showToast('Failed to save FAQ', 'error')
        }
    }

    const deleteFaq = async (id) => {
        if (!confirm('Delete this FAQ?')) return
        try {
            await faqApi.delete(id)
            loadData()
            showToast('FAQ deleted')
        } catch (error) {
            showToast('Failed to delete FAQ', 'error')
        }
    }

    // Register Admin
    const openRegisterModal = () => {
        setRegisterFormData({ username: '', password: '', name: '' })
        setShowRegisterModal(true)
    }

    const closeRegisterModal = () => {
        setShowRegisterModal(false)
        setRegisterFormData({ username: '', password: '', name: '' })
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        try {
            await authApi.register({
                username: registerFormData.username,
                password: registerFormData.password,
                name: registerFormData.name
            })
            showToast('Admin registered successfully')
            closeRegisterModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to register admin'
            showToast(message, 'error')
        }
    }

    // Change Password
    const openChangePasswordModal = () => {
        setChangePasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowChangePasswordModal(true)
    }

    const closeChangePasswordModal = () => {
        setShowChangePasswordModal(false)
        setChangePasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault()
        if (changePasswordFormData.newPassword !== changePasswordFormData.confirmPassword) {
            showToast('New passwords do not match', 'error')
            return
        }
        if (changePasswordFormData.newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error')
            return
        }
        try {
            await authApi.changePassword({
                currentPassword: changePasswordFormData.currentPassword,
                newPassword: changePasswordFormData.newPassword
            })
            showToast('Password changed successfully')
            closeChangePasswordModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password'
            showToast(message, 'error')
        }
    }

    // Load all admins
    const loadAdmins = async () => {
        setLoadingAdmins(true)
        try {
            const response = await authApi.getAllAdmins()
            setAdmins(response.data.data || [])
        } catch (error) {
            console.error('Error loading admins:', error)
            showToast('Failed to load admins', 'error')
        } finally {
            setLoadingAdmins(false)
        }
    }

    return (
        <div className="admin-page">
            <audio ref={audioRef} />

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">Zelan Bakery</div>
                <div className="sidebar-subtitle">Admin Panel</div>

                <nav className="sidebar-nav">
                    <a
                        className={activeTab === 'menu-items' ? 'active' : ''}
                        onClick={() => setActiveTab('menu-items')}
                    >
                        <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
                        Menu & Categories
                    </a>
                    <a
                        className={activeTab === 'faq' ? 'active' : ''}
                        onClick={() => setActiveTab('faq')}
                    >
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        FAQ
                    </a>
                    <a
                        className={activeTab === 'admins' ? 'active' : ''}
                        onClick={() => { setActiveTab('admins'); loadAdmins(); }}
                    >
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Administrators
                    </a>
                    <div className="sidebar-divider"></div>
                    <a href="#" onClick={(e) => { e.preventDefault(); openRegisterModal() }}>
                        <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                        Register Admin
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); openChangePasswordModal() }}>
                        <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Change Password
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" target="_blank">
                        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        View Website
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Logout
                    </button>
                </div>
            </aside>


            {/* Main Content */}
            <main className="main-content">
                <div className="page-header-new">
                    <div>
                        <h1 className="page-title-new">
                            {activeTab === 'menu-items' && 'Menu Management'}
                            {activeTab === 'faq' && 'FAQ Management'}
                            {activeTab === 'admins' && 'Administrator Management'}
                        </h1>
                        <p className="page-subtitle-new">
                            {activeTab === 'menu-items' && 'Create, price, feature, and attach voice (MP3)'}
                            {activeTab === 'faq' && 'Manage frequently asked questions'}
                            {activeTab === 'admins' && 'View and manage administrator accounts'}
                        </p>
                    </div>
                    {activeTab === 'menu-items' && (
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Menu Item
                        </button>
                    )}
                    {activeTab === 'faq' && (
                        <button className="btn btn-primary" onClick={() => openFaqModal()}>
                            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add FAQ
                        </button>
                    )}
                    {activeTab === 'admins' && (
                        <button className="btn btn-primary" onClick={() => openRegisterModal()}>
                            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Register Admin
                        </button>
                    )}
                </div>

                {/* KPI Filter Pills */}
                {activeTab === 'menu-items' && (
                    <div className="kpi-pills">
                        <button
                            className={`kpi-pill ${kpiFilter === null ? 'active' : ''}`}
                            onClick={() => { setKpiFilter(null); setFeaturedFilter('all'); }}
                        >
                            <span className="kpi-value">{stats.totalItems || 0}</span>
                            <span className="kpi-label">Total Items</span>
                        </button>
                        <button
                            className={`kpi-pill ${kpiFilter === 'categories' ? 'active' : ''}`}
                            onClick={() => setKpiFilter('categories')}
                        >
                            <span className="kpi-value">{stats.totalCategories || 0}</span>
                            <span className="kpi-label">Categories</span>
                        </button>
                        <button
                            className={`kpi-pill ${kpiFilter === 'featured' ? 'active' : ''}`}
                            onClick={() => { setKpiFilter('featured'); setFeaturedFilter('featured'); }}
                        >
                            <svg viewBox="0 0 16 16" fill="currentColor"><polygon points="8 2 9.5 6.5 14 7 10.5 10 11.5 14 8 11.5 4.5 14 5.5 10 2 7 6.5 6.5 8 2" /></svg>
                            <span className="kpi-value">{stats.featuredItems || 0}</span>
                            <span className="kpi-label">Favorite</span>
                        </button>
                        <button
                            className={`kpi-pill ${kpiFilter === 'voice' ? 'active' : ''}`}
                            onClick={() => setKpiFilter('voice')}
                        >
                            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v5a2 2 0 0 0 4 0V3a2 2 0 0 0-2-2z" /><path d="M11 7v1a3 3 0 0 1-6 0V7" /><line x1="8" y1="11" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5"/></svg>
                            <span className="kpi-value">{stats.voiceEnabled || 0}</span>
                            <span className="kpi-label">With Voice</span>
                        </button>
                    </div>
                )}

                {/* Menu Items Tab */}
                {activeTab === 'menu-items' && (
                    <div className="tab-panel">

                {/* Categories Section */}
                <div className="categories-section-modern">
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-card">
                                <div className="category-card-content">
                                    <span className="category-card-name">{cat.name}</span>
                                    <span className="category-card-count">
                                        {menuItems.filter(item => item.category_id === cat.id).length} items
                                    </span>
                                </div>
                                <button
                                    className="category-card-delete"
                                    onClick={() => deleteCategory(cat.id)}
                                    title="Delete category"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <polyline points="3,6 5,6 21,6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {/* Add New Category Card */}
                        <div className="category-card category-card-add">
                            <input
                                type="text"
                                className="category-add-input"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="+ Add category"
                                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                            />
                            {newCategory && (
                                <button className="category-add-btn" onClick={addCategory}>
                                    <svg viewBox="0 0 24 24" width="18" height="18">
                                        <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu Items Table */}
                <div id="menu-items" className="table-container" style={{ marginTop: '2rem' }}>
                    <div className="table-header">
                        <h3 className="table-title" style={{ display: 'none' }}>Menu Items</h3>
                        <div className="table-filters">
                            <div className="filter-group">
                                <select
                                    className="filter-select"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${featuredFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFeaturedFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn ${featuredFilter === 'featured' ? 'active' : ''}`}
                                    onClick={() => setFeaturedFilter('featured')}
                                >
                                    <svg viewBox="0 0 24 24" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                    Favorite
                                </button>
                                <button
                                    className={`filter-btn ${featuredFilter === 'not_featured' ? 'active' : ''}`}
                                    onClick={() => setFeaturedFilter('not_featured')}
                                >
                                    Not Favorite
                                </button>
                            </div>
                            <div className="search-box">
                                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="loading-spinner"></div></div>
                    ) : filteredItems.length === 0 ? (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p>No menu items yet</p>
                            <button className="btn btn-primary" onClick={() => openModal()}>Add First Item</button>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Tag</th>
                                    <th>Favorite</th>
                                    <th>Voice</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="menu-item-cell">
                                                <img
                                                    src={item.image_url?.startsWith('http') ? item.image_url : getFileUrl(item.image_url) || 'https://via.placeholder.com/60'}
                                                    alt={item.name}
                                                    className="menu-item-image"
                                                />
                                                <div>
                                                    <h4>{item.name}</h4>
                                                    <span>{item.tag || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="category-badge">{item.category_name}</span></td>
                                        <td className="price-cell">{item.price_display || `${(item.price / 1000).toFixed(0)}K`}</td>
                                        <td>
                                            {item.tag ? (
                                                <span className="tag-badge">{item.tag}</span>
                                            ) : (
                                                <span className="no-tag">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.is_featured ? (
                                                <span className="featured-badge">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span className="not-featured-badge">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.voice_file ? (
                                                <span className="voice-badge has-voice">MP3</span>
                                            ) : item.voice_description ? (
                                                <span className="voice-badge has-text">Text</span>
                                            ) : (
                                                <span className="voice-badge no-voice">None</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn preview" onClick={() => {
                                                    if (item.voice_file) {
                                                        audioRef.current.src = getFileUrl(item.voice_file)
                                                        audioRef.current.play()
                                                    } else if (item.voice_description) {
                                                        const synth = window.speechSynthesis
                                                        synth.cancel()
                                                        synth.speak(new SpeechSynthesisUtterance(item.voice_description))
                                                    }
                                                }}>
                                                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                </button>
                                                <button className="action-btn edit" onClick={() => openModal(item)}>
                                                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                                    <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                    </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                    <div className="tab-panel">
                {/* FAQ Section */}
                <div id="faq" className="faq-admin-section">
                    <div className="faq-admin-list">
                        {faqs.length === 0 ? (
                            <p className="faq-empty">No FAQs yet. Add your first FAQ!</p>
                        ) : (
                            faqs.map(faq => (
                                <div key={faq.id} className="faq-admin-item">
                                    <div className="faq-admin-content">
                                        <h4>{faq.question}</h4>
                                        <p>{faq.answer}</p>
                                    </div>
                                    <div className="faq-admin-actions">
                                        <button className="action-btn edit" onClick={() => openFaqModal(faq)}>
                                            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button className="action-btn delete" onClick={() => deleteFaq(faq.id)}>
                                            <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                    </div>
                )}

                {/* Admins Tab */}
                {activeTab === 'admins' && (
                    <div className="tab-panel">
                {/* All Admins Section */}
                <div id="admins" className="table-container">
                    {loadingAdmins ? (
                        <div className="loading"><div className="loading-spinner"></div></div>
                    ) : admins.length === 0 ? (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <p>No admins loaded yet</p>
                            <button className="btn btn-primary" onClick={loadAdmins}>Load Admins</button>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Last Login</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id}>
                                        <td>{admin.id}</td>
                                        <td><strong>{admin.username}</strong></td>
                                        <td>{admin.name}</td>
                                        <td><span className="category-badge">{admin.role}</span></td>
                                        <td>
                                            {admin.is_active ? (
                                                <span className="status-badge active">Active</span>
                                            ) : (
                                                <span className="status-badge inactive">Inactive</span>
                                            )}
                                        </td>
                                        <td>{admin.created_at ? new Date(admin.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
                                        <td>{admin.last_login ? new Date(admin.last_login).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Item Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Nasi Goreng Special"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price (IDR) *</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="55000"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Display Price</label>
                                        <input
                                            type="text"
                                            value={formData.price_display}
                                            onChange={(e) => setFormData({ ...formData, price_display: e.target.value })}
                                            placeholder="55K"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tag</label>
                                        <input
                                            type="text"
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                            placeholder="Best Seller"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Short description for the menu card..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>🎤 Voice File (MP3) - Your recorded voice</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setVoiceFile(e.target.files[0])}
                                    />
                                    {(voiceFile || editingItem?.voice_file) && (
                                        <div className="voice-preview">
                                            <button type="button" className="btn btn-sm" onClick={previewVoice}>
                                                <svg viewBox="0 0 24 24" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                Play
                                            </button>
                                            <button type="button" className="btn btn-sm" onClick={stopVoice}>
                                                <svg viewBox="0 0 24 24" width="14" height="14"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                                Stop
                                            </button>
                                            {editingItem?.voice_file && <span>Current: {editingItem.voice_file.split('/').pop()}</span>}
                                        </div>
                                    )}
                                    <p className="form-hint">Upload your own voice recording (MP3, WAV, OGG)</p>
                                </div>

                                <div className="form-group">
                                    <label>Voice Description (Text fallback)</label>
                                    <textarea
                                        value={formData.voice_description}
                                        onChange={(e) => setFormData({ ...formData, voice_description: e.target.value })}
                                        placeholder="Fallback text-to-speech if no MP3 uploaded..."
                                    />
                                </div>

                                {/* Image Management Section */}
                                <div className="form-group images-section">
                                    <label>Images ({editingItem ? itemImages.length : newItemImageFiles.length}/4)</label>

                                    <div className="images-grid">
                                        {/* For editing: show existing images */}
                                        {editingItem && itemImages.map((img) => (
                                            <div key={img.id} className={`image-item ${img.is_main ? 'is-main' : ''}`}>
                                                <img
                                                    src={img.image_url?.startsWith('http') ? img.image_url : getFileUrl(img.image_url)}
                                                    alt="Menu"
                                                />
                                                {img.is_main && <span className="main-badge">Main</span>}
                                                <div className="image-actions">
                                                    {!img.is_main && (
                                                        <button
                                                            type="button"
                                                            className="img-action-btn set-main"
                                                            onClick={() => handleSetMainImage(img.id)}
                                                            title="Set as main"
                                                        >
                                                            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="img-action-btn delete"
                                                        onClick={() => handleDeleteImage(img.id)}
                                                        title="Delete"
                                                    >
                                                        <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* For new items: show temporary images */}
                                        {!editingItem && newItemImageFiles.map((img, index) => (
                                            <div key={img.id} className={`image-item ${index === 0 ? 'is-main' : ''}`}>
                                                <img src={img.preview} alt="Preview" />
                                                {index === 0 && <span className="main-badge">Main</span>}
                                                <div className="image-actions">
                                                    <button
                                                        type="button"
                                                        className="img-action-btn delete"
                                                        onClick={() => handleNewItemImageRemove(img.id)}
                                                        title="Remove"
                                                    >
                                                        <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add image button */}
                                        {((editingItem && itemImages.length < 4) || (!editingItem && newItemImageFiles.length < 4)) && (
                                            <label className="image-upload-btn">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={editingItem ? handleImageUpload : handleNewItemImageAdd}
                                                    disabled={uploadingImage}
                                                    style={{ display: 'none' }}
                                                />
                                                {uploadingImage ? (
                                                    <div className="loading-spinner small"></div>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                                        <span>Add Image</span>
                                                    </>
                                                )}
                                            </label>
                                        )}
                                    </div>
                                    <p className="form-hint">First image becomes main.{editingItem && ' Click ⭐ to change main image.'}</p>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        />
                                        <svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        Favorite Item
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {showFaqModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeFaqModal()}>
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <h3>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
                            <button className="modal-close" onClick={closeFaqModal}>
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleFaqSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Question *</label>
                                    <input
                                        type="text"
                                        value={faqFormData.question}
                                        onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                                        required
                                        placeholder="e.g., Bagaimana cara memesan?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Answer *</label>
                                    <textarea
                                        value={faqFormData.answer}
                                        onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                                        required
                                        placeholder="Write the answer here..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeFaqModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save FAQ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Admin Modal */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeRegisterModal()}>
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <h3>Register New Admin</h3>
                            <button className="modal-close" onClick={closeRegisterModal}>
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={registerFormData.name}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                                        required
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input
                                        type="text"
                                        value={registerFormData.username}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, username: e.target.value })}
                                        required
                                        placeholder="Login username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        value={registerFormData.password}
                                        onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                                        required
                                        placeholder="Set a password"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeRegisterModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Register Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeChangePasswordModal()}>
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="modal-close" onClick={closeChangePasswordModal}>
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleChangePasswordSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Current Password *</label>
                                    <input
                                        type="password"
                                        value={changePasswordFormData.currentPassword}
                                        onChange={(e) => setChangePasswordFormData({ ...changePasswordFormData, currentPassword: e.target.value })}
                                        required
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password *</label>
                                    <input
                                        type="password"
                                        value={changePasswordFormData.newPassword}
                                        onChange={(e) => setChangePasswordFormData({ ...changePasswordFormData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password *</label>
                                    <input
                                        type="password"
                                        value={changePasswordFormData.confirmPassword}
                                        onChange={(e) => setChangePasswordFormData({ ...changePasswordFormData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeChangePasswordModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
                <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>
                {toast.message}
            </div>
        </div>
    )
}

export default AdminPage
