// Carousel Logic
history.scrollRestoration = 'manual';
const scroller = document.getElementById('work-carousel');
let cards = [];
if (scroller) {
    cards = Array.from(scroller.querySelectorAll('article'));
}

function centerSlide(container, slide, behavior = 'auto') {
    if (!container || !slide) return;
    const x = slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2;
    container.scrollTo({ left: x, behavior });
}

function setActiveCard() {
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = { el: null, dist: Infinity, idx: -1 };
    cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const viewportCenter = window.innerWidth / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        if (dist < closest.dist) closest = { el: card, dist, idx };
    });
    cards.forEach((card, idx) => {
        const isActive = card === closest.el;
        card.style.transform = isActive ? 'scale(1)' : 'scale(0.94)';
        card.style.transition = 'transform 400ms cubic-bezier(.2,.8,.2,1), opacity 400ms';
        card.style.opacity = isActive ? '1' : '0.55';
        card.classList.toggle('shadow-[0_25px_100px_-20px_rgba(0,0,0,0.7)]', isActive);
        card.classList.toggle('ring-white/20', isActive);
        card.classList.toggle('ring-white/10', !isActive);

        // Play/Pause video based on active state
        const video = card.querySelector('video');
        if (video) {
            if (isActive) video.play().catch(() => { });
            else video.pause();
        }
    });
    return closest.idx;
}

// Carousel Navigation
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

if (scroller && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth;
        const gap = 32; // md:gap-8 = 32px
        scroller.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth;
        const gap = 32;
        scroller.scrollBy({ left: (cardWidth + gap), behavior: 'smooth' });
    });
}

if (scroller) {
    // Check if mobile
    const isMobile = () => window.innerWidth < 768;

    // Only add scroll behavior on desktop
    if (!isMobile()) {
        scroller.addEventListener('scroll', () => requestAnimationFrame(setActiveCard), { passive: true });
        window.addEventListener('resize', () => {
            if (!isMobile()) {
                setActiveCard();
            }
        });
        window.addEventListener('load', () => {
            if (!isMobile()) {
                requestAnimationFrame(() => {
                    centerSlide(scroller, cards[0], 'auto');
                    setActiveCard();
                });
            }
        });
    }
}

// Filter Logic
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item[data-category]');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        portfolioItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Simple Scroll Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
});
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Section Visibility Observer
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('section').forEach(el => sectionObserver.observe(el));

// Mobile Menu Logic
const toggle = document.getElementById('mobile-menu-toggle');
const menu = document.getElementById('mobile-menu');
let isOpen = false;

if (toggle && menu) {
    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            menu.classList.remove('hidden');
            requestAnimationFrame(() => {
                menu.style.maxHeight = menu.scrollHeight + 'px';
            });
        } else {
            menu.style.maxHeight = '0';
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300);
        }
    });

    // Close menu when clicking links
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            menu.style.maxHeight = '0';
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300);
        });
    });
}

// Type Words Animation Logic
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.type-words').forEach(el => {
        const text = el.textContent.trim().replace(/\s+/g, ' ');
        const words = text.split(' ');
        const stagger = parseFloat(el.dataset.stagger || '.2');
        const duration = parseFloat(el.dataset.duration || '2');
        const ease = el.dataset.ease || 'ease-in-out';
        const delay = parseFloat(el.dataset.delay || '0');

        el.innerHTML = words.map((word, i) =>
            `<span class="w" style="--i:${i}">${word}&nbsp;</span>`
        ).join('');

        el.style.setProperty('--stagger', `${stagger}s`);
        el.style.setProperty('--dur', `${duration}s`);
        el.style.setProperty('--ease', ease);
        el.style.setProperty('--delay', `${delay}s`);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(el);
    });
});
// Phone Scroll Animation
const phonesContainer = document.getElementById('phones-container');
const phoneLeft = document.querySelector('.phone-left');
const phoneRight = document.querySelector('.phone-right');

if (phonesContainer && phoneLeft && phoneRight) {
    window.addEventListener('scroll', () => {
        const rect = phonesContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Logic:
        // Start: Section enters viewport (bottom of screen) -> Phones are overlapped
        // End: Section is fully visible/centered -> Phones are separated

        // Calculate progress
        // When rect.top == viewportHeight, progress = 0
        // When rect.top == viewportHeight * 0.2 (near top), progress = 1

        const start = viewportHeight * 0.9;
        const end = viewportHeight * 0.2;

        let progress = (start - rect.top) / (start - end);
        progress = Math.min(Math.max(progress, 0), 1);

        // Animation
        const maxSpread = 170; // px

        // Current values
        // Ease out slightly for better feel? No, user wanted "dynamic" direct control.
        // Linear mapping is most direct.

        const spread = maxSpread * progress;

        // Apply
        if (window.innerWidth >= 768) {
            phoneLeft.style.transform = `translateX(-${spread}px)`;
            phoneRight.style.transform = `translateX(${spread}px)`;
        } else {
            // Mobile vertical stack
            phoneLeft.style.transform = 'none';
            phoneRight.style.transform = 'none';
        }
    });
}
// Mobile Showcase Interaction
// Mobile Showcase Interaction
const showcaseOptions = document.querySelectorAll('.showcase-option');
const phoneVideo1 = document.getElementById('phone-video-1');
const phoneVideo2 = document.getElementById('phone-video-2');

if (showcaseOptions.length > 0 && phoneVideo1 && phoneVideo2) {
    showcaseOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Prevent multiple clicks during animation
            if (option.classList.contains('active')) return;

            // Remove active class from all
            showcaseOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked
            option.classList.add('active');

            // 1. Collapse Animation (Simulate "coming from top" / overlap)
            // We temporarily override the transform to 0 (overlapped state)
            // The CSS transition (duration-700) will handle the smooth movement

            // Force overlap
            phoneLeft.style.transform = 'translateX(0)';
            phoneRight.style.transform = 'translateX(0)';

            // 2. Wait for collapse (700ms), then swap videos
            setTimeout(() => {
                // Get video sources
                const src1 = option.getAttribute('data-video-1');
                const src2 = option.getAttribute('data-video-2');

                // Swap sources
                if (phoneVideo1.querySelector('source').src !== src1) {
                    phoneVideo1.querySelector('source').src = src1;
                    phoneVideo1.load();
                    phoneVideo1.play();
                }
                if (phoneVideo2.querySelector('source').src !== src2) {
                    phoneVideo2.querySelector('source').src = src2;
                    phoneVideo2.load();
                    phoneVideo2.play();
                }

                // 3. Expand Animation (Simulate "scroll separation")
                // We simply trigger the scroll handler logic again to re-calculate 
                // the correct position based on current scroll.
                // But we need to wait a tiny bit for the video swap to feel "behind the scenes"
                // or just let it expand immediately after swap.

                // Re-trigger scroll logic
                // We can't easily call the anonymous function attached to scroll.
                // But we can just manually dispatch a scroll event or copy the logic.
                // Dispatching scroll event is cleaner.
                window.dispatchEvent(new Event('scroll'));

            }, 700); // Wait for the collapse transition to finish
        });
    });
}

// Vertical Logo Carousel Logic - No Simultaneous Duplicates
const logoPaths = [
    "assets/logos/LOGO BRANCA EXOUSIA (1).png",
    "assets/logos/NOVA_AI_LOGO (1).png",
    "assets/logos/fg-logo.e85c265.svg",
    "assets/logos/logo casabrava.png",
    "assets/logos/logo-rv-empreendimentos.png",
    "assets/logos/IMG_3003 (1).PNG",
    "assets/logos/LOGO-CIES-2026-BEGE.png.webp",
    "assets/logos/castro.webp",
    "assets/logos/haakelogo.png"
];

// Global state to track which logos are currently visible
const carouselState = {
    currentlyVisible: new Set(), // Tracks logos currently displayed
    columnQueues: [], // Pre-generated queues for each column
};

// Shuffle array helper
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate a unique queue for each column
function generateColumnQueue(columnIndex, columnCount) {
    const queue = [];
    const itemsNeeded = 30; // Generate enough items for a long loop

    // Start with shuffled logos
    let pool = shuffleArray([...logoPaths]);
    let poolIndex = 0;

    for (let i = 0; i < itemsNeeded; i++) {
        // Refill pool when exhausted
        if (poolIndex >= pool.length) {
            pool = shuffleArray([...logoPaths]);
            poolIndex = 0;
        }

        queue.push(pool[poolIndex]);
        poolIndex++;
    }

    return queue;
}

// Get next available logo that's not currently visible in other columns
function getNextLogo(columnIndex) {
    const queue = carouselState.columnQueues[columnIndex];

    // Find a logo from the queue that's not currently visible
    for (let i = 0; i < queue.length; i++) {
        const logo = queue[i];
        if (!carouselState.currentlyVisible.has(logo)) {
            // Move this logo to the end of the queue
            queue.splice(i, 1);
            queue.push(logo);
            return logo;
        }
    }

    // Fallback: if all logos are visible (shouldn't happen with 9 logos and 3 columns)
    // Just return the first one and rotate
    const logo = queue.shift();
    queue.push(logo);
    return logo;
}

function initLogoCarousel() {
    const container = document.getElementById('logo-carousel');
    if (!container) return;

    const columnCount = 3;

    // Initialize queues for each column
    for (let i = 0; i < columnCount; i++) {
        carouselState.columnQueues.push(generateColumnQueue(i, columnCount));
    }

    // Create DOM for columns
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'logo-column';
        colDiv.dataset.columnIndex = colIndex;
        container.appendChild(colDiv);

        // Helper to create logo item
        const createLogoItem = (src) => {
            const div = document.createElement('div');
            div.className = 'logo-item';
            div.dataset.logoSrc = src; // Track which logo this is
            const img = document.createElement('img');
            img.src = src;
            img.className = 'logo-img';

            // Specific fix for Exousia logo
            if (src.includes('LOGO BRANCA EXOUSIA')) {
                img.style.transform = 'scale(2.5)';
            }

            div.appendChild(img);
            return div;
        };

        // Get initial logo for this column
        const initialLogo = getNextLogo(colIndex);
        carouselState.currentlyVisible.add(initialLogo);

        let activeItem = createLogoItem(initialLogo);
        activeItem.classList.add('active');
        activeItem.style.transition = 'none';
        colDiv.appendChild(activeItem);

        // Re-enable transition after a tick
        requestAnimationFrame(() => {
            activeItem.style.transition = '';
        });

        // Cycle Logic
        const cycleInterval = 2500;
        const delay = colIndex * 800; // Stagger columns

        setTimeout(() => {
            setInterval(() => {
                // Remove current logo from visible set
                const currentLogoSrc = activeItem.dataset.logoSrc;
                carouselState.currentlyVisible.delete(currentLogoSrc);

                // Get next logo that's not currently visible
                const nextLogoSrc = getNextLogo(colIndex);
                carouselState.currentlyVisible.add(nextLogoSrc);

                const nextItem = createLogoItem(nextLogoSrc);
                colDiv.appendChild(nextItem);

                // Trigger animation
                requestAnimationFrame(() => {
                    // Exit active item
                    if (activeItem) {
                        activeItem.classList.remove('active');
                        activeItem.classList.add('exit');

                        const itemToRemove = activeItem;
                        setTimeout(() => {
                            itemToRemove.remove();
                        }, 500);
                    }

                    // Enter next item
                    void nextItem.offsetWidth;
                    nextItem.classList.add('active');

                    activeItem = nextItem;
                });
            }, cycleInterval);
        }, delay);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initLogoCarousel);

// Mobile Showcase Pagination Logic
const mobileCarousel = document.getElementById('mobile-carousel');
const mobilePagination = document.getElementById('mobile-pagination');

if (mobileCarousel && mobilePagination) {
    const dots = Array.from(mobilePagination.children);
    const items = mobileCarousel.querySelectorAll('.mobile-carousel-item');

    const updatePagination = () => {
        const scrollLeft = mobileCarousel.scrollLeft;
        const containerWidth = mobileCarousel.clientWidth;
        const center = scrollLeft + containerWidth / 2;

        let activeIndex = 0;
        let minDistance = Infinity;

        items.forEach((item, index) => {
            const itemCenter = item.offsetLeft + item.offsetWidth / 2;
            const distance = Math.abs(center - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                activeIndex = index;
            }
        });

        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.remove('bg-white/20');
                dot.classList.add('bg-white');
            } else {
                dot.classList.remove('bg-white');
                dot.classList.add('bg-white/20');
            }
        });
    };

    mobileCarousel.addEventListener('scroll', () => requestAnimationFrame(updatePagination), { passive: true });
    // Initial update
    updatePagination();
}
