document.addEventListener('DOMContentLoaded', function() {

    // ---  Load Common Components ---
    function loadComponent(url, elementId) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
                // After loading, initialize event listeners (important!)
                if (elementId === 'header-placeholder') {
                    initNavigation();
                    animateHeader(); // Call animation function after header loads
                    highlightActiveLink(); // Call highlightActiveLink AFTER header is loaded
                }
                // FIX: Call initDarkMode() AFTER the footer is loaded!
                if (elementId === 'footer-placeholder') {
                    initDarkMode();
                }
            })
            .catch(error => {
                console.error('Error loading component:', error);
                document.getElementById(elementId).innerHTML = '<p>Error loading content.</p>';
            });
    }

    loadComponent('common/header.html', 'header-placeholder');
    loadComponent('common/nav.html', 'nav-placeholder'); // Load nav into its own placeholder
    loadComponent('common/footer.html', 'footer-placeholder');



    // --- Navigation Logic (moved inside a function) ---
    function initNavigation() {
        const hamburger = document.querySelector('.hamburger-menu');
        const menuItems = document.querySelector('.menu-items');

        if (hamburger && menuItems) { // Check if elements exist
            hamburger.addEventListener('click', function() {
                menuItems.classList.toggle('active');
                const isExpanded = menuItems.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);

                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = isExpanded ? 'rotate(45deg) translate(5px, 6px)' : '';
                spans[1].style.opacity = isExpanded ? '0' : '1';
                spans[2].style.transform = isExpanded ? 'rotate(-45deg) translate(5px, -6px)' : '';
            });


            const navLinks = document.querySelectorAll('.menu-items a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        menuItems.classList.remove('active');
                        const spans = hamburger.querySelectorAll('span');
                        spans[0].style.transform = '';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = '';
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    }
     // --- Dark Mode Toggle ---
    function initDarkMode(){
        const darkModeButton = document.getElementById('dark-mode-button');
        const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');

        if(darkModeButton && darkModeStylesheet){
            // Check for saved preference in localStorage
            const savedMode = localStorage.getItem('darkMode');
            if (savedMode === 'enabled') {
                darkModeStylesheet.disabled = false;
                document.body.classList.add('dark-mode');
            }

            darkModeButton.addEventListener('click', function() {
                if (darkModeStylesheet.disabled) {
                    darkModeStylesheet.disabled = false;
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('darkMode', 'enabled'); // Save preference
                } else {
                    darkModeStylesheet.disabled = true;
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('darkMode', 'disabled'); // Save preference
                }
            });
        }
    }


    // --- Animation Functions ---
    function animateHeader() {
        const topNav = document.querySelector('.top-nav');
        const menuItems = document.querySelector('.menu-items');
        const ctaButton = document.querySelector('.cta-button');
        const hamburgerMenu = document.querySelector('.hamburger-menu')

        // Add animation classes
        if(topNav){
          topNav.classList.add('animate-fade-in-up');
        }
        if(menuItems){
            menuItems.classList.add('animate-menu-items'); // Add class to trigger staggered animation

        }
        if(ctaButton){
            ctaButton.classList.add('animate-cta-button'); // Add class to trigger animation

        }
        if(hamburgerMenu){
          hamburgerMenu.classList.add('animate-hamburger-menu')
        }
    }


    // --- Scroll-triggered animations (basic example) ---
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');

        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    function highlightActiveLink() {
        const path = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.menu-items a');

        navLinks.forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});




// ---  Load Page-specific Content ---
// --- Carousel Logic (Basic Example) ---
const carousel = document.querySelector('.projects-carousel');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');

if (carousel && prevButton && nextButton) { // Make sure elements exist
    let currentIndex = 0;
    const projectItems = carousel.querySelectorAll('.project-item');
    const numItems = projectItems.length;
    const itemWidth = projectItems[0].offsetWidth; //Assumes all same size
    const itemMarginRight = parseInt(window.getComputedStyle(projectItems[0]).marginRight); // Get marginRight
    const itemFullWidth = itemWidth + itemMarginRight;



    function updateCarousel() {
        //Use translate for best performance.
        carousel.style.transform = `translateX(-${currentIndex * itemFullWidth}px)`;

    }

    prevButton.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1); // Prevent going before first
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
         currentIndex = Math.min(numItems - 1, currentIndex + 1); // Prevent going past last item (if not looping)
        // OR, for infinite loop:
        // currentIndex = (currentIndex + 1) % numItems;

        updateCarousel();
    });
}