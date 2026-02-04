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

// Menu item click handlers (FIXED)
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

        // Navigate to another page (FIX HERE)
        else if (page) {
            e.preventDefault();

            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');

            // 🔥 REAL PAGE NAVIGATION
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

// Navbar scroll background
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
});

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

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
});// Media Carousel - ARROWS SHOW ON TOUCH EVEN DURING VIDEO
const mediaTrack = document.getElementById('mediaTrack');
const mediaSlides = document.querySelectorAll('.media-slide');
const mediaPrevBtn = document.getElementById('mediaPrev');
const mediaNextBtn = document.getElementById('mediaNext');
const galleryVideo = document.getElementById('galleryVideo');
const mediaCarouselContainer = document.querySelector('.media-carousel-container');

let currentMediaSlide = 0;
const totalMediaSlides = mediaSlides.length;
let arrowTimeout;
let userInteracting = false;

// Pause video function
function pauseVideo() {
    if (galleryVideo && !galleryVideo.paused) {
        galleryVideo.pause();
    }
}

// Show arrows temporarily
function showArrowsTemporarily(duration = 3000) {
    if (!mediaCarouselContainer) return;
    
    userInteracting = true;
    mediaCarouselContainer.classList.add('user-active');
    
    // Clear existing timeout
    if (arrowTimeout) {
        clearTimeout(arrowTimeout);
    }
    
    // Hide after duration
    arrowTimeout = setTimeout(() => {
        userInteracting = false;
        mediaCarouselContainer.classList.remove('user-active');
    }, duration);
}

// Update arrow visibility based on video state
function updateArrowVisibility() {
    if (!mediaCarouselContainer || !galleryVideo) return;
    
    const currentSlide = mediaSlides[currentMediaSlide];
    const isVideoSlide = currentSlide?.getAttribute('data-type') === 'video';
    
    if (isVideoSlide && !galleryVideo.paused && !userInteracting) {
        // Video is playing and user not interacting - hide arrows
        mediaCarouselContainer.classList.add('video-playing');
    } else {
        // Show arrows if: video paused, on image, or user interacting
        mediaCarouselContainer.classList.remove('video-playing');
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
    if (currentMediaSlide === 0 && galleryVideo) {
        galleryVideo.currentTime = 0;
        galleryVideo.play().catch(err => console.log('Autoplay prevented'));
    }
    
    updateArrowVisibility();
}

// Button click events
mediaNextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide + 1);
});

mediaPrevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide - 1);
});

// Touch events for better mobile response
mediaNextBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide + 1);
}, { passive: false });

mediaPrevBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMediaSlide(currentMediaSlide - 1);
}, { passive: false });

// Video event listeners
galleryVideo?.addEventListener('play', () => {
    updateArrowVisibility();
});

galleryVideo?.addEventListener('pause', () => {
    showArrowsTemporarily();
    updateArrowVisibility();
});

galleryVideo?.addEventListener('ended', () => {
    showArrowsTemporarily();
    updateArrowVisibility();
});

// Touch on video or carousel - show arrows temporarily
const wrapper = document.querySelector('.media-carousel-wrapper');

wrapper?.addEventListener('touchstart', (e) => {
    showArrowsTemporarily(3000);
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
}, { passive: true });

wrapper?.addEventListener('click', (e) => {
    // Show arrows on any click/tap
    showArrowsTemporarily(3000);
});

// Video specific touch - show arrows
galleryVideo?.addEventListener('touchstart', (e) => {
    showArrowsTemporarily(3000);
}, { passive: true });

galleryVideo?.addEventListener('click', () => {
    showArrowsTemporarily(3000);
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
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isSwiping = false;

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
    
    // Horizontal swipe only
    if (yDiff < 100 && Math.abs(xDiff) > 50) {
        if (xDiff > 0) {
            showMediaSlide(currentMediaSlide + 1);
        } else {
            showMediaSlide(currentMediaSlide - 1);
        }
    }
}, { passive: true });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (galleryVideo) {
        galleryVideo.play().catch(() => {});
    }
    updateArrowVisibility();
}); 
// Init
document.addEventListener('DOMContentLoaded', () => {
    console.log('Puraniya Library – Website Loaded Successfully');
});
// Carousel functionality
        let currentSlide = 0;
        const slides = document.querySelectorAll('.media-slide');
        const track = document.getElementById('mediaTrack');
        const prevBtn = document.getElementById('mediaPrev');
        const nextBtn = document.getElementById('mediaNext');
        const totalSlides = slides.length;

        function updateCarousel() {
            const offset = -currentSlide * 100;
            track.style.transform = `translateX(${offset}%)`;
            
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });
        }

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });

        // YouTube IFrame API
        let player;
        let isMuted = true;

        // Load YouTube IFrame API
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Create player when API is ready
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('youtubePlayer', {
                events: {
                    'onReady': onPlayerReady
                }
            });
        }

        function onPlayerReady(event) {
            const unmuteBtn = document.getElementById('unmuteBtn');
            const muteIcon = unmuteBtn.querySelector('.mute-icon');
            const unmuteIcon = unmuteBtn.querySelector('.unmute-icon');
            const unmuteText = unmuteBtn.querySelector('.unmute-text');
            
            unmuteBtn.addEventListener('click', function() {
                if (isMuted) {
                    player.unMute();
                    isMuted = false;
                    unmuteBtn.classList.add('unmuted');
                    muteIcon.style.display = 'none';
                    unmuteIcon.style.display = 'block';
                    unmuteText.textContent = 'Sound On';
                } else {
                    player.mute();
                    isMuted = true;
                    unmuteBtn.classList.remove('unmuted');
                    muteIcon.style.display = 'block';
                    unmuteIcon.style.display = 'none';
                    unmuteText.textContent = 'Tap to Unmute';
                }
            });
        }