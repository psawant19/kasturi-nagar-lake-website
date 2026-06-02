// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar.offsetHeight;
            const offset = navbarHeight; // Navbar height + extra spacing
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ============================================
// PROGRESSIVE IMAGE LOADING SYSTEM
// ============================================

// Track which categories have been loaded
const loadedCategories = new Set();

// Loading progress indicator removed - using per-category preloaders instead

// ============================================
// CATEGORY FILTER FUNCTIONALITY
// ============================================

// CONFIGURATION: Default category to load on page load
// Change this value to set a different default category
// Valid values: 'awareness', 'cleanup', 'infrastructure', 'lake-views', 'tree-plantation', 'wildlife', 'news'
const DEFAULT_CATEGORY = 'awareness';

// Category filter buttons
const categoryFilterButtons = document.querySelectorAll('.category-filter-btn');
const workCategories = document.querySelectorAll('.work-category');

// Track active category
let activeCategory = DEFAULT_CATEGORY;

// Store Masonry instances for each gallery
const masonryInstances = new Map();

// Add click handlers to category filter buttons
categoryFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get selected category
        const selectedCategory = button.getAttribute('data-category');
        activeCategory = selectedCategory;
        
        // Filter categories
        filterCategories(selectedCategory);
        
        // Scroll to the category filters to keep them in viewport
        setTimeout(() => {
            const categoryFilters = document.querySelector('.category-filters');
            if (categoryFilters) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = categoryFilters.offsetTop - navbarHeight - 20; // 20px extra padding
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to ensure display changes are applied
    });
});

// Function to filter and show/hide categories
function filterCategories(category) {
    workCategories.forEach(workCategory => {
        const categoryType = workCategory.getAttribute('data-category');
        
        if (category === 'all') {
            // Show all categories
            workCategory.style.display = 'block';
            
            // Load images if not already loaded
            if (workCategory.getAttribute('data-loaded') === 'false') {
                loadCategoryImages(workCategory);
            } else {
                // Refresh Masonry layout for already loaded categories
                refreshMasonryLayout(workCategory);
            }
        } else if (categoryType === category) {
            // Show matching category
            workCategory.style.display = 'block';
            
            // Load images if not already loaded
            if (workCategory.getAttribute('data-loaded') === 'false') {
                loadCategoryImages(workCategory);
            } else {
                // Refresh Masonry layout for already loaded categories
                refreshMasonryLayout(workCategory);
            }
        } else {
            // Hide non-matching categories
            workCategory.style.display = 'none';
        }
    });
}

// Function to refresh Masonry layout for a category
function refreshMasonryLayout(category) {
    const gallery = category.querySelector('.category-gallery');
    if (!gallery) return;
    
    // Small delay to ensure display changes are applied
    setTimeout(() => {
        const masonryInstance = masonryInstances.get(gallery);
        if (masonryInstance) {
            // Refresh existing Masonry instance
            masonryInstance.layout();
        } else {
            // Initialize Masonry if not already done
            initializeMasonryForGallery(gallery);
        }
    }, 50);
}

// Function to load images for a specific category
function loadCategoryImages(category) {
    const categoryHeader = category.querySelector('.category-header h4');
    const categoryName = categoryHeader ? categoryHeader.textContent.trim() : 'Category';
    
    // Skip if already loaded
    if (loadedCategories.has(categoryName)) {
        return;
    }
    
    const preloader = category.querySelector('.category-preloader');
    const gallery = category.querySelector('.category-gallery');
    const images = gallery.querySelectorAll('img');
    
    if (images.length === 0) {
        // No images, mark as loaded
        category.setAttribute('data-loaded', 'true');
        if (preloader) preloader.classList.add('hidden');
        return;
    }
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    // Load each image with staggered timing
    images.forEach((img, index) => {
        // Add loading class to gallery item
        const galleryItem = img.closest('.gallery-item');
        if (galleryItem) {
            galleryItem.classList.add('loading');
        }
        
        // Stagger image loading for smooth effect
        setTimeout(() => {
            // Check if image has data-src attribute (lazy loading)
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc && !img.src) {
                // Set src from data-src to trigger loading
                img.src = dataSrc;
                img.removeAttribute('data-src');
            }
            
            if (img.complete && img.src) {
                // Image already loaded or failed to load (cached)
                if (img.naturalHeight !== 0) {
                    onImageLoad(img);
                } else {
                    // Image failed to load
                    onImageError(img);
                }
            } else if (img.src) {
                // Load image
                img.addEventListener('load', () => onImageLoad(img));
                img.addEventListener('error', () => onImageError(img));
            } else {
                // No src set, count as error
                onImageError(img);
            }
        }, index * 30); // 30ms delay between each image
    });
    
    function onImageLoad(img) {
        img.classList.add('loaded');
        const galleryItem = img.closest('.gallery-item');
        if (galleryItem) {
            galleryItem.classList.remove('loading');
        }
        loadedCount++;
        
        // When all images loaded
        if (loadedCount === totalImages) {
            finishCategoryLoading(category, gallery, categoryName, preloader);
        }
    }
    
    function onImageError(img) {
        console.warn('Failed to load image:', img.src);
        // Still count as loaded to prevent hanging
        img.classList.add('loaded');
        const galleryItem = img.closest('.gallery-item');
        if (galleryItem) {
            galleryItem.classList.remove('loading');
        }
        loadedCount++;
        
        if (loadedCount === totalImages) {
            finishCategoryLoading(category, gallery, categoryName, preloader);
        }
    }
}


// Finish loading a category
function finishCategoryLoading(category, gallery, categoryName, preloader) {
    // Hide preloader
    if (preloader) {
        preloader.classList.add('hidden');
    }
    
    // Mark category as loaded
    category.setAttribute('data-loaded', 'true');
    loadedCategories.add(categoryName);
    
    // Initialize Masonry for this gallery after images are loaded
    setTimeout(() => {
        initializeMasonryForGallery(gallery);
    }, 100);
    
    // Success indicator removed as per user request
}

// Initialize Masonry for a specific gallery
function initializeMasonryForGallery(gallery) {
    if (!gallery) return;
    
    imagesLoaded(gallery, function() {
        const masonryInstance = new Masonry(gallery, {
            itemSelector: '.gallery-item',
            columnWidth: '.gallery-item',
            percentPosition: true,
            gutter: 20,
            transitionDuration: '0.3s'
        });
        
        // Store the Masonry instance for later use
        masonryInstances.set(gallery, masonryInstance);
    });
}

// Load images for the work section on page load
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        // Load the default category
        filterCategories(DEFAULT_CATEGORY);
    }, 100);
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.mission-card, .work-card, .stat-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form validation and submission handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Real-time validation for phone number (optional field)
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    
    if (phoneInput) {
        // Only allow digits
        phoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
            validatePhone();
        });
        
        phoneInput.addEventListener('keypress', function(e) {
            // Only allow digits
            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    }
    
    function validatePhone() {
        const phoneValue = phoneInput.value.trim();
        const phonePattern = /^[6-9]\d{9}$/;
        
        // Phone is optional, so empty is valid
        if (phoneValue === '') {
            phoneError.textContent = '';
            return true;
        }
        
        // If phone is provided, it must be valid (10 digits starting with 6-9)
        if (!phonePattern.test(phoneValue)) {
            if (phoneValue.length < 10) {
                phoneError.textContent = 'Please enter a complete 10-digit mobile number';
            } else if (phoneValue.length > 10) {
                phoneError.textContent = 'Mobile number should be exactly 10 digits';
            } else if (!/^[6-9]/.test(phoneValue)) {
                phoneError.textContent = 'Mobile number must start with 6, 7, 8, or 9';
            } else {
                phoneError.textContent = 'Please enter a valid mobile number';
            }
            return false;
        }
        
        phoneError.textContent = '';
        return true;
    }
    
    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate phone before submission (only if provided)
        if (phoneInput && phoneInput.value.trim() !== '' && !validatePhone()) {
            phoneInput.focus();
            return;
        }
        
        const formStatus = document.getElementById('formStatus');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formStatus.style.display = 'block';
        
        try {
            // Generate unique enquiry ID
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 1000);
            const enquiryId = `ENQ${timestamp}${randomNum}`;
            
            // Set subject with enquiry ID
            const subjectField = document.getElementById('enquirySubject');
            if (subjectField) {
                subjectField.value = `New Enquiry - www.kasturinagarlake.com (Enquiry ID: ${enquiryId})`;
            }
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Add +91 prefix to phone number if provided
            if (phoneInput && phoneInput.value.trim() !== '') {
                formData.set('phone', '+91 ' + phoneInput.value.trim());
            }
            
            // Submit to Netlify - use the current page URL
            const response = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            if (response.ok || response.status === 200) {
                // Show success message
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you for your message! We will get back to you soon.';
                
                // Reset form
                contactForm.reset();
                
                // Clear error messages
                document.querySelectorAll('.error-message').forEach(error => {
                    error.textContent = '';
                });
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error message
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Oops! Something went wrong. Please try again or contact us directly.';
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            
            // Hide status message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        }
    });
}

// Counter animation for statistics
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16); // 60 FPS
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
};

// Observe stat cards for counter animation
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const number = entry.target.querySelector('.stat-number');
            const target = parseInt(number.textContent);
            animateCounter(number, target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
});

// Add active state to navigation based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Image lazy loading fallback for older browsers
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Add hover effect to cards

// Image Modal Functionality
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.querySelector('.modal-close');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalCounter = document.getElementById('modalCounter');

let currentImageIndex = 0;
let currentImageGroup = [];
let currentVideoId = null;

// Get caption for an image
function getImageCaption(img) {
    let caption = '';
    
    // Check for alt text
    if (img.alt) {
        caption = img.alt;
    }
    
    // Check for image-caption sibling
    const captionElement = img.parentElement.querySelector('.image-caption');
    if (captionElement) {
        caption = captionElement.textContent;
    }
    
    // Check for work-card content
    const workCardContent = img.closest('.work-card')?.querySelector('.work-card-content');
    if (workCardContent) {
        const title = workCardContent.querySelector('h4')?.textContent || '';
        const description = workCardContent.querySelector('p')?.textContent || '';
        caption = title ? `${title}\n${description}` : description;
    }
    
    // Check for story text
    const storyText = img.closest('.story-content')?.querySelector('.story-text h3')?.textContent;
    if (storyText) {
        caption = storyText;
    }
    
    return caption;
}

// Show image in modal
function showImage(index) {
    if (index < 0 || index >= currentImageGroup.length) return;
    
    currentImageIndex = index;
    const item = currentImageGroup[index];
    
    // Check if this is a video item
    const galleryItem = item.closest('.gallery-item');
    const youtubeId = galleryItem ? galleryItem.getAttribute('data-youtube-id') : null;
    
    // Get modal content wrapper
    const modalContentWrapper = document.querySelector('.modal-content-wrapper');
    
    // Stop any currently playing video before switching
    if (currentVideoId) {
        const videoContainer = modalContentWrapper.querySelector('.modal-video-container');
        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
        currentVideoId = null;
    }
    
    if (youtubeId) {
        // Show YouTube video
        currentVideoId = youtubeId;
        
        // Hide image, show video container
        modalImage.style.display = 'none';
        
        // Create or update video container
        let videoContainer = modalContentWrapper.querySelector('.modal-video-container');
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.className = 'modal-video-container';
            modalContentWrapper.insertBefore(videoContainer, modalCaption);
        }
        videoContainer.style.display = 'block';
        
        // Embed YouTube video with autoplay
        videoContainer.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
        
        // Update counter
        modalCounter.textContent = `${index + 1} / ${currentImageGroup.length}`;
        
        // Set caption for video
        const captionText = item.alt || 'YouTube Video';
        const captionSpan = document.createElement('span');
        captionSpan.textContent = captionText;
        modalCaption.innerHTML = '';
        modalCaption.appendChild(captionSpan);
        modalCaption.appendChild(modalCounter);
    } else {
        // Show regular image
        currentVideoId = null;
        
        // Hide video container if exists
        const videoContainer = modalContentWrapper.querySelector('.modal-video-container');
        if (videoContainer) {
            videoContainer.style.display = 'none';
        }
        
        // Show image
        modalImage.style.display = 'block';
        modalImage.src = item.src;
        modalImage.alt = item.alt;
        
        // Update counter
        modalCounter.textContent = `${index + 1} / ${currentImageGroup.length}`;
        
        // Get caption text and place counter on the right
        const captionText = getImageCaption(item);
        if (captionText) {
            // Create a span for the caption text
            const captionSpan = document.createElement('span');
            captionSpan.textContent = captionText;
            modalCaption.innerHTML = '';
            modalCaption.appendChild(captionSpan);
            modalCaption.appendChild(modalCounter);
        } else {
            // If no caption, just show counter
            modalCaption.innerHTML = '';
            modalCaption.appendChild(modalCounter);
        }
    }
    
    // Update navigation buttons
    modalPrev.disabled = index === 0;
    modalNext.disabled = index === currentImageGroup.length - 1;
}

// Get images from the same section
function getImageGroup(clickedImg) {
    // Check if image is in a work category
    const workCategory = clickedImg.closest('.work-category');
    if (workCategory) {
        // Only get images from the current visible category
        const categoryGallery = workCategory.querySelector('.category-gallery');
        if (categoryGallery) {
            const images = Array.from(categoryGallery.querySelectorAll('img:not(.modal-image)'));
            return images;
        }
    }
    
    // Find the closest section for other images
    const section = clickedImg.closest('section');
    if (!section) {
        return [clickedImg];
    }
    
    // Get all images in this section (excluding modal images)
    const images = Array.from(section.querySelectorAll('img:not(.modal-image)'));
    return images;
}

// Make all images clickable (except those in the modal itself)
document.querySelectorAll('img:not(.modal-image)').forEach(img => {
    // Add cursor pointer style
    img.style.cursor = 'pointer';
    
    img.addEventListener('click', function() {
        // Get all images in the same section
        currentImageGroup = getImageGroup(this);
        currentImageIndex = currentImageGroup.indexOf(this);
        
        // Show modal
        modal.classList.add('active');
        showImage(currentImageIndex);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    });
});

// Navigation buttons
modalPrev.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        showImage(currentImageIndex - 1);
    }
});

modalNext.addEventListener('click', () => {
    if (currentImageIndex < currentImageGroup.length - 1) {
        showImage(currentImageIndex + 1);
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
        modalPrev.click();
    } else if (e.key === 'ArrowRight') {
        modalNext.click();
    }
});

// Close modal when clicking the X
modalClose.addEventListener('click', closeModal);

// Close modal when clicking outside the image
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Stop YouTube video if playing
    if (currentVideoId) {
        const videoContainer = document.querySelector('.modal-video-container');
        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
        currentVideoId = null;
    }
}
document.querySelectorAll('.mission-card, .work-card, .stat-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Console message
console.log('%c🌊 Kasturi Nagar Lake Rejuvenation Project', 'color: #2c7a7b; font-size: 20px; font-weight: bold;');
console.log('%cJoin us in our mission to restore and preserve our beautiful lake!', 'color: #38b2ac; font-size: 14px;');

// ============================================
// MASONRY INITIALIZATION (Now handled by progressive loading)
// ============================================

// Note: Masonry is now initialized per-gallery after images load
// in the loadTabImages() function above. This prevents layout breaks
// and ensures proper grid calculation.

// The old initMasonry() function has been replaced with
// initializeMasonryForGallery() which is called after each
// category's images finish loading in the progressive loading system.

// This ensures:
// 1. No layout breaks during image loading
// 2. Proper Masonry grid calculation with actual image dimensions
// 3. Smooth loading experience with preloader
// 4. Images only load when their tab is active
// Made with Bob
