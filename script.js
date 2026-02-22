// Hamburger menu functionality
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sidebarClose = document.getElementById('sidebarClose');
const menuItems = document.querySelectorAll('.menu-item');

// Open sidebar with hamburger
hamburger?.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
});

// Close sidebar with X button
sidebarClose?.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
});

// Close sidebar when clicking overlay
overlay?.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
});

// Menu item click handlers
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const section = item.getAttribute('data-section');
        const page = item.getAttribute('data-page');

        // Scroll to section (same page)
        if (section) {
            e.preventDefault();
            const element = document.querySelector(`#${section}`);
            if (element) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Navigate to another page
        else if (page) {
            e.preventDefault();
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            window.location.href = page;
        }
    });
});

// Close sidebar with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

// Hero background image change
function updateHeroImage(imageUrl) {
    const heroBg = document.getElementById('heroBg');
    if (heroBg) {
        heroBg.style.backgroundImage = `url('${imageUrl}')`;
    }
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// REMOVED: Intersection Observer for fade-in animations on sections
// (Previously added .fade-in class to sections as they scrolled into view)

// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Active menu item on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.menu-item[data-section]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
        }
    });
});

// Newsletter
const newsletterBtn = document.querySelector('.footer-btn');
newsletterBtn?.addEventListener('click', () => {
    const email = prompt('Enter your email to subscribe:');
    if (email && email.includes('@')) {
        alert('Thank you for subscribing!');
    } else if (email) {
        alert('Invalid email address.');
    }
});

// ============================================
// MEDIA CAROUSEL - YOUTUBE API INTEGRATION
// ============================================

const mediaTrack = document.getElementById('mediaTrack');
const mediaSlides = document.querySelectorAll('.media-slide');
const mediaPrevBtn = document.getElementById('mediaPrev');
const mediaNextBtn = document.getElementById('mediaNext');
const mediaCarouselContainer = document.querySelector('.media-carousel-container');

let currentMediaSlide = 0;
const totalMediaSlides = mediaSlides.length;
let arrowTimeout;
let userInteracting = false;
let player; // YouTube player instance
let isMuted = true;
let isTouchDevice = false;

// Detect if device has touch capability
function detectTouchDevice() {
    isTouchDevice = ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0) || 
                    (navigator.msMaxTouchPoints > 0);
}

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('galleryVideo', {
        height: '100%',
        width: '100%',
        videoId: '_Roq1WPnSDQ',
        playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: '_Roq1WPnSDQ'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Player ready
function onPlayerReady(event) {
    event.target.playVideo();
    updateArrowVisibility();
}

// Player state change
function onPlayerStateChange(event) {
    updateArrowVisibility();
    
    // Handle video ended - restart
    if (event.data === YT.PlayerState.ENDED) {
        player.seekTo(0);
        player.playVideo();
    }
}

// Mute/Unmute toggle
const muteToggle = document.getElementById('muteToggle');
const muteIcon = document.getElementById('muteIcon');
const muteText = document.getElementById('muteText');

muteToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (player) {
        if (isMuted) {
            player.unMute();
            muteText.textContent = 'Mute';
            // Change to unmuted icon (speaker with waves)
            muteIcon.innerHTML = `
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
            isMuted = false;
        } else {
            player.mute();
            muteText.textContent = 'Unmute';
            // Change to muted icon (speaker with X)
            muteIcon.innerHTML = `
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
            isMuted = true;
        }
    }
});

// Pause video function
function pauseVideo() {
    if (player && player.getPlayerState) {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        }
    }
}

// Play video function
function playVideo() {
    if (player && player.playVideo) {
        player.playVideo();
    }
}

// Show arrows temporarily (for touch devices)
function showArrowsTemporarily(duration = 3000) {
    if (!mediaCarouselContainer || !isTouchDevice) return;
    
    userInteracting = true;
    mediaCarouselContainer.classList.add('user-active');
    
    if (arrowTimeout) {
        clearTimeout(arrowTimeout);
    }
    
    arrowTimeout = setTimeout(() => {
        userInteracting = false;
        mediaCarouselContainer.classList.remove('user-active');
    }, duration);
}

// Update arrow visibility based on video state
function updateArrowVisibility() {
    if (!mediaCarouselContainer || !player) return;
    
    const currentSlide = mediaSlides[currentMediaSlide];
    const isVideoSlide = currentSlide?.getAttribute('data-type') === 'video';
    
    // On touch devices, handle visibility with user-active class
    if (isTouchDevice) {
        if (isVideoSlide && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING && !userInteracting) {
            mediaCarouselContainer.classList.add('video-playing');
        } else {
            mediaCarouselContainer.classList.remove('video-playing');
        }
    } 
    // On desktop, arrows show on hover (handled by CSS)
    else {
        if (isVideoSlide && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
            mediaCarouselContainer.classList.add('video-playing');
        } else {
            mediaCarouselContainer.classList.remove('video-playing');
        }
    }
}

// Show specific slide
function showMediaSlide(index) {
    pauseVideo();
    
    mediaSlides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= totalMediaSlides) {
        currentMediaSlide = 0;
    } else if (index < 0) {
        currentMediaSlide = totalMediaSlides - 1;
    } else {
        currentMediaSlide = index;
    }
    
    mediaSlides[currentMediaSlide].classList.add('active');
    
    // Auto-play video when returning to it
    if (currentMediaSlide === 0 && player) {
        player.seekTo(0);
        playVideo();
    }
    
    updateArrowVisibility();
}

// Button click events
mediaNextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide + 1);
    if (isTouchDevice) {
        showArrowsTemporarily(3000);
    }
});

mediaPrevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide - 1);
    if (isTouchDevice) {
        showArrowsTemporarily(3000);
    }
});

// Touch events for arrow buttons
mediaNextBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide + 1);
    showArrowsTemporarily(3000);
}, { passive: false });

mediaPrevBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide - 1);
    showArrowsTemporarily(3000);
}, { passive: false });

// Touch on carousel - show arrows temporarily
const wrapper = document.querySelector('.media-carousel-wrapper');

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isSwiping = false;

wrapper?.addEventListener('touchstart', (e) => {
    showArrowsTemporarily(3000);
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
}, { passive: true });

// Click on carousel (for touch devices) - show arrows
wrapper?.addEventListener('click', (e) => {
    if (isTouchDevice) {
        showArrowsTemporarily(3000);
    }
});

// Mouse enter on carousel container (desktop hover) - handled by CSS
mediaCarouselContainer?.addEventListener('mouseenter', () => {
    if (!isTouchDevice) {
        updateArrowVisibility();
    }
});

// Mouse leave on carousel container (desktop)
mediaCarouselContainer?.addEventListener('mouseleave', () => {
    if (!isTouchDevice) {
        updateArrowVisibility();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;
    
    const rect = gallerySection.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (isInView) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showMediaSlide(currentMediaSlide - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            showMediaSlide(currentMediaSlide + 1);
        }
    }
});

// Swipe support
wrapper?.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchEndX = e.touches[0].clientX;
}, { passive: true });

wrapper?.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    touchEndX = e.changedTouches[0].clientX;
    isSwiping = false;
    
    const xDiff = touchStartX - touchEndX;
    const yDiff = Math.abs(touchStartY - e.changedTouches[0].clientY);
    
    if (yDiff < 100 && Math.abs(xDiff) > 50) {
        if (xDiff > 0) {
            showMediaSlide(currentMediaSlide + 1);
        } else {
            showMediaSlide(currentMediaSlide - 1);
        }
        showArrowsTemporarily(3000);
    }
}, { passive: true });

// Make onYouTubeIframeAPIReady available globally
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    detectTouchDevice();
    console.log('Puraniya Library – Website Loaded Successfully');
    console.log('Touch Device:', isTouchDevice);
});