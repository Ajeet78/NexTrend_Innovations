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

    loadComponent('includes/header.html', 'header-placeholder');
    loadComponent('includes/nav.html', 'nav-placeholder'); // Load nav into its own placeholder
    loadComponent('includes/footer.html', 'footer-placeholder');

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
        const hamburgerMenu = document.querySelector('.hamburger-menu');

        if(topNav){
            topNav.classList.add('animate-fade-in-up');
        }
        if(menuItems){
            menuItems.classList.add('animate-menu-items');
        }
        if(ctaButton){
            ctaButton.classList.add('animate-cta-button');
        }
        if(hamburgerMenu){
            hamburgerMenu.classList.add('animate-hamburger-menu');
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
            if (link.getAttribute('href') === path || (path === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    const menuLinks = document.querySelectorAll('.menu-items a');

    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function(event) {
            const rect = this.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const origin = (x / rect.width) * 100;
            this.style.setProperty('--origin-x', `${origin}%`);
        });

        link.addEventListener('mouseleave', function() {
            this.style.removeProperty('--origin-x');
        });
    });

    // --- Filtering functionality for the projects gallery ---
    const filterButtons = document.querySelectorAll('.filter-button');
    const projectItems = document.querySelectorAll('.project-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            // Update active filter button styling
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show/hide projects based on filter
            projectItems.forEach(item => {
                if (filter === 'all' || item.dataset.type === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const skeletonScreen = document.querySelector('.skeleton-screen');
    const spinner = document.querySelector('.spinner');

    // Simulate loading state
    setTimeout(() => {
        skeletonScreen.style.display = 'none';
        spinner.style.display = 'none';
    }, 2000); // Adjust the timeout as needed

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatbotInput.value = '';
            setTimeout(() => {
                addMessage('bot', getBotResponse(message));
            }, 1000); // Simulate response delay
        }
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chatbot-message', sender);
        messageElement.textContent = text;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getBotResponse(message) {
        // Simple FAQ responses
        const responses = {
            "what’s your average project cost?": "Our average project cost varies depending on the scope and requirements. Please contact us for a detailed quote.",
            "how long does it take to complete a project?": "The timeline for project completion depends on the complexity and requirements. Typically, it ranges from a few weeks to several months.",
            "what services do you offer?": "We offer web development, mobile app development, UI/UX design, AI integration, and more. Visit our services page for more details."
        };
        return responses[message.toLowerCase()] || "I'm sorry, I don't have an answer for that. Please contact us for more information.";
    }

    // --- Form Validation (Example) ---
    function initFormValidation() {
        const form = document.querySelector('form'); // Replace 'form' with your actual form selector
        if (form) {
            form.addEventListener('submit', function(event) {
                let isValid = true;
                const nameInput = form.querySelector('#name'); // Example: Assuming a name field
                const emailInput = form.querySelector('#email'); // Example: Assuming an email field

                if (nameInput && nameInput.value.trim() === '') {
                    isValid = false;
                    alert('Please enter your name.'); // Basic validation message
                }

                if (emailInput && !isValidEmail(emailInput.value.trim())) {
                    isValid = false;
                    alert('Please enter a valid email address.'); // Basic validation message
                }

                if (!isValid) {
                    event.preventDefault(); // Prevent form submission if validation fails
                }
            });

            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
        }
    }

    // --- Back to Top Button ---
    function initBackToTop() {
        const backToTopButton = document.createElement('button');
        backToTopButton.id = 'back-to-top';
        backToTopButton.innerHTML = '&uarr;'; // Up arrow character
        document.body.appendChild(backToTopButton);

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // For smooth scrolling
            });
        });

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) { // Show after scrolling down 300px
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }

    // --- Lazy Loading for Images ---
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const lazyLoad = (image) => {
            image.setAttribute('src', image.getAttribute('data-src'));
            image.onload = () => {
                image.removeAttribute('data-src');
            };
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        lazyLoad(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });

            images.forEach(image => {
                observer.observe(image);
            });
        } else {
            // Fallback for browsers that don't support Intersection Observer
            images.forEach(image => lazyLoad(image));
        }
    }

    // --- Initialize new features ---
    initFormValidation();
    initBackToTop();
    initLazyLoading();





//for auto scroll in tech================================================================
const carousel = document.querySelector('.tech-stack-carousel');

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function startAutoScroll() {
  const scrollWidth = carousel.scrollWidth;
  const clientWidth = carousel.clientWidth;
  const scrollAmount = scrollWidth - clientWidth;
  let currentScroll = 0;
  const startTime = performance.now();
  const scrollDuration = 5000; // Adjust this value to change the speed (milliseconds)

  function animateScroll(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / scrollDuration;

    if (progress < 1) {
      const easedProgress = easeInOutQuad(progress);
      currentScroll = easedProgress * scrollAmount;
      carousel.scrollLeft = currentScroll;
      requestAnimationFrame(animateScroll);
    } else {
      carousel.scrollLeft = 0;
      startAutoScroll();
    }
  }
  requestAnimationFrame(animateScroll);
}

startAutoScroll();







});




 
// ---  Load Page-specific Content ---
// --- Carousel Logic (Basic Example) ---
const carousel = document.querySelector('.projects-carousel');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');

if (carousel && prevButton && nextButton) {
    let currentIndex = 0;
    const projectItems = carousel.querySelectorAll('.project-item');
    const numItems = projectItems.length;
    const itemWidth = projectItems[0].offsetWidth;
    const itemMarginRight = parseInt(window.getComputedStyle(projectItems[0]).marginRight);
    const itemFullWidth = itemWidth + itemMarginRight;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * itemFullWidth}px)`;
    }

    prevButton.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = Math.min(numItems - 1, currentIndex + 1);
        updateCarousel();
    });
}

let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
    setTimeout(showSlides, 3000); // Change image every 3 seconds
}

function currentSlide(n) {
    slideIndex = n;
    showSlides();
}

//------------------------------------- popup message--------------------------------
document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById('development-modal');
    const closeButton = document.querySelector('.close-button');

    // Display the modal when the page loads
    modal.style.display = 'block';

    // Close the modal when the close button is clicked
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    // Close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});



/*================================================================================
                            Search Functionality
================================================================================*/
 const searchInput = document.getElementById('search-input');
 const searchButton = document.getElementById('search-button');

 if (searchButton && searchInput) {
     searchButton.addEventListener('click', performSearch);
     searchInput.addEventListener('keypress', function(event) {
         if (event.key === 'Enter') {
             performSearch();
         }
     });
 }

 function performSearch() {
     const searchTerm = searchInput.value.trim().toLowerCase();
     if (searchTerm) {
         //  Implement your search logic here
         //  For example, redirect to a search results page:
         window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
         //  Or, filter content on the current page.
         console.log(`Searching for: ${searchTerm}`);
     }
 }
                   


// ==============================for texh icon scroll=========================
/*const carousel = document.querySelector('.tech-stack-carousel');

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function startAutoScroll() {
  const scrollWidth = carousel.scrollWidth;
  const clientWidth = carousel.clientWidth;
  const scrollAmount = scrollWidth - clientWidth;
  let currentScroll = 0;
  const startTime = performance.now();
  const scrollDuration = 5000; // Adjust this value to change the speed (milliseconds)

  function animateScroll(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / scrollDuration;

    if (progress < 1) {
      const easedProgress = easeInOutQuad(progress);
      currentScroll = easedProgress * scrollAmount;
      carousel.scrollLeft = currentScroll;
      requestAnimationFrame(animateScroll);
    } else {
      carousel.scrollLeft = 0;
      startAutoScroll();
    }
  }
  requestAnimationFrame(animateScroll);
}

startAutoScroll();
*/


/*=============================For blog filter=============================*/
    document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const blogPosts = document.querySelectorAll(".article-listings .blog-post, .latest-posts .blog-post");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
          // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        const category = button.getAttribute("data-category");
        
          // Filter posts (both in Latest and Article Listings)
        blogPosts.forEach(post => {
            if (category === "all" || post.getAttribute("data-category") === category) {
            post.style.display = "block";
            } else {
            post.style.display = "none";
            }
        });
        });
    });
    });











 