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
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = data;
                    // After loading, initialize event listeners (important!)
                    if (elementId === 'header-placeholder') {
                        initNavigation();
                        animateHeader(); // Call animation function after header loads
                        highlightActiveLink(); // Call highlightActiveLink AFTER header is loaded
                    }
                    if (elementId === 'footer-placeholder') {
                        initDarkMode();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading component:', error);
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = '<p>Error loading content.</p>';
                }
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

        // Dropdown toggle handling (improves mobile accessibility)
        const dropdownToggles = document.querySelectorAll('.nav-link.dropdown-toggle');
        if (dropdownToggles.length) {
            // Helper: clamp value
            function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

            // Helper: position a dropdown to avoid clipping. Uses fixed positioning so it stays visible.
            function positionDropdown(toggle, dropdown) {
                if (!toggle || !dropdown) return;

                // Temporarily show dropdown if hidden to measure size
                const computed = window.getComputedStyle(dropdown);
                const wasHidden = computed.display === 'none';
                const prevDisplay = dropdown.style.display;
                const prevVisibility = dropdown.style.visibility;
                if (wasHidden) {
                    dropdown.style.display = 'block';
                    dropdown.style.visibility = 'hidden';
                }

                const triggerRect = toggle.getBoundingClientRect();
                const ddRect = dropdown.getBoundingClientRect();
                const vw = document.documentElement.clientWidth || window.innerWidth;
                const margin = 8; // keep gap from edges

                // Calculate left so dropdown is centered under trigger but clamped to viewport
                // const desiredLeft = triggerRect.left + (triggerRect.width / 2) - (ddRect.width / 2);
                // const left = clamp(desiredLeft, margin, vw - ddRect.width - margin);

                // Place dropdown slightly below trigger
                const top = triggerRect.bottom + 0.1; // 8px gap

                // Use fixed positioning so scrolling doesn't affect placement
                dropdown.style.position = 'center';
                // dropdown.style.left = Math.round(left) + 'px';
                dropdown.style.top = Math.round(top) + 'px';
                dropdown.style.transform = 'none';

                // restore hidden state if needed
                if (wasHidden) {
                    dropdown.style.display = prevDisplay;
                    dropdown.style.visibility = prevVisibility;
                }
            }

            // Throttled reposition for resize/scroll
            let repositionTimer = null;
            function repositionOpenDropdowns() {
                if (repositionTimer) clearTimeout(repositionTimer);
                repositionTimer = setTimeout(() => {
                    document.querySelectorAll('.nav-item.dropdown.show').forEach(parent => {
                        const toggleEl = parent.querySelector('.nav-link.dropdown-toggle');
                        const menuEl = parent.querySelector('.dropdown-menu');
                        positionDropdown(toggleEl, menuEl);
                    });
                }, 60);
            }
            window.addEventListener('resize', repositionOpenDropdowns);
            window.addEventListener('scroll', repositionOpenDropdowns, { passive: true });
            dropdownToggles.forEach(toggle => {
                const parent = toggle.closest('.nav-item.dropdown');
                // Ensure aria attribute exists
                if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

                // Remove hover event listeners to prevent dropdown on cursor hover
                // Only toggle dropdown on click
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                    // Close other open dropdowns first
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            const otherParent = otherToggle.closest('.nav-item.dropdown');
                            otherToggle.setAttribute('aria-expanded', 'false');
                            otherParent.classList.remove('show');
                        }
                    });

                    toggle.setAttribute('aria-expanded', String(!isExpanded));
                    parent.classList.toggle('show', !isExpanded);

                    // position the dropdown when opening
                    if (!isExpanded) {
                        const menu = parent.querySelector('.dropdown-menu');
                        positionDropdown(toggle, menu);
                    }
                });

                // Add touch event support for mobile devices
                toggle.addEventListener('touchstart', function(e) {
                    // Prevent double-tap zoom on mobile
                    e.preventDefault();
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                    // Close other open dropdowns first
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            const otherParent = otherToggle.closest('.nav-item.dropdown');
                            otherToggle.setAttribute('aria-expanded', 'false');
                            otherParent.classList.remove('show');
                        }
                    });

                    toggle.setAttribute('aria-expanded', String(!isExpanded));
                    parent.classList.toggle('show', !isExpanded);

                    // position the dropdown when opening
                    if (!isExpanded) {
                        const menu = parent.querySelector('.dropdown-menu');
                        positionDropdown(toggle, menu);
                    }
                }, { passive: false });

                // Positioning is handled on click
            });

            // Make the arrow icon toggle the dropdown on mobile without following the parent link
            const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
            dropdownArrows.forEach(arrow => {
                arrow.addEventListener('click', function(e) {
                    // Prevent the parent anchor's navigation and stop bubbling so the link click handler doesn't trigger
                    e.preventDefault();
                    e.stopPropagation();

                    const toggle = this.closest('.nav-link.dropdown-toggle');
                    if (!toggle) return;
                    const parent = toggle.closest('.nav-item.dropdown');

                    if (window.innerWidth <= 768) {
                        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                        toggle.setAttribute('aria-expanded', String(!isExpanded));
                        parent.classList.toggle('show', !isExpanded);
                        if (!isExpanded) {
                            const menu = parent.querySelector('.dropdown-menu');
                            positionDropdown(toggle, menu);
                        }
                    } else {
                        // Desktop: just position/open for accessibility when arrow is clicked
                        const menu = parent.querySelector('.dropdown-menu');
                        positionDropdown(toggle, menu);
                    }
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function(e) {
                dropdownToggles.forEach(toggle => {
                    const parent = toggle.closest('.nav-item.dropdown');
                    if (!parent.contains(e.target)) {
                        toggle.setAttribute('aria-expanded', 'false');
                        parent.classList.remove('show');
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
 const searchResultsContainer = document.getElementById('search-results-container'); // Ensure this container exists in the HTML

 if (searchButton && searchInput && searchResultsContainer) {
     searchButton.addEventListener('click', performSearch);
     searchInput.addEventListener('keypress', function(event) {
         if (event.key === 'Enter') {
             performSearch();
         }
     });
 }

 function performSearch() {
     const query = searchInput.value.trim();

     if (query) {
         // Clear previous results and show a loading message
         searchResultsContainer.innerHTML = '<p>Searching...</p>';

         // Make the fetch request to your backend
         fetch(`/api/search/blog-posts?q=${encodeURIComponent(query)}`)
             .then(response => {
                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 return response.json();
             })
             .then(results => {
                 displayResults(results);
             })
             .catch(error => {
                 console.error('Error fetching search results:', error);
                 searchResultsContainer.innerHTML = '<p>An error occurred while fetching search results.</p>';
             });
     } else {
         // Handle empty query case (e.g., clear results or show a message)
         searchResultsContainer.innerHTML = '<p>Please enter a search term.</p>';
     }
 }

 function displayResults(results) {
     searchResultsContainer.innerHTML = ''; // Clear loading message

     if (results && results.length > 0) {
         results.forEach(result => {
             // Create HTML elements to display each result (e.g., title, summary, link)
             const resultElement = document.createElement('div');
             resultElement.classList.add('search-result'); // You'll need to define this class in your CSS

             resultElement.innerHTML = `
                 <h3>${result.title}</h3>
                 <p>${result.summary}</p>
                 <a href="${result.url}">Read More</a>
             `;
             searchResultsContainer.appendChild(resultElement);
         });
     } else {
         searchResultsContainer.innerHTML = '<p class="no-results">No results found.</p>'; // You'll need to define this class in your CSS
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
    // Fetch and render blog posts
    async function loadBlogPosts(filterCategory = null) {
      const res = await fetch('/api/blog-posts');
      let posts = await res.json();

      // Sort posts by date (latest first)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Filter posts by category if a filter is applied
      if (filterCategory && filterCategory !== 'all') {
        posts = posts.filter(post => post.category === filterCategory);
      }

      // Split into latest and older
      const latest = posts.slice(0, 25); // Display the 25 most recent as "Latest"
      const older = posts.slice(25);

      // Render latest posts
      const latestGrid = document.getElementById('latest-posts-grid');
      latestGrid.innerHTML = latest.map(post => `
        <a href="blog-post.html?id=${post.id}" class="blog-post-item" data-category="${post.category}">
          <img src="${post.image}" alt="${post.title}">
          <div class="post-content">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-snippet">${post.snippet}</p>
            <p class="post-date">Published on ${post.date}</p>
          </div>
        </a>
      `).join('');

      // Render older posts
      const olderList = document.getElementById('older-posts-list');
      olderList.innerHTML = older.map(post => `
        <a href="blog-post.html?id=${post.id}" class="blog-post-item" data-category="${post.category}">
          <img src="${post.image}" alt="${post.title}">
          <div class="post-content">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-snippet">${post.snippet}</p>
            <p class="post-date">Published on ${post.date}</p>
          </div>
        </a>
      `).join('');

      // Populate Recent/Popular Posts sidebar (using recent for now)
      const recentPopularList = document.getElementById('recent-popular-posts-list');
      // Use the *original* posts array for recent posts, not the filtered one
      const originalPosts = await (await fetch('/api/blog-posts')).json();
       originalPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const recentPosts = originalPosts.slice(0, 3);

      recentPopularList.innerHTML = recentPosts.map(post => `
        <li><a href="blog-post.html?id=${post.id}">${post.title}</a></li>
      `).join('');
    }

    // Filtering logic and initial load
    // Check for category in URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    loadBlogPosts(category);

    const filterButtons = document.querySelectorAll(".filter-button");
    const sidebarCategoryLinks = document.querySelectorAll("#categories-list a");

    // Function to handle filtering and URL update
    function applyFilter(filter) {
        // Update URL with the selected filter
        const newUrl = filter === 'all' ? 'blog.html' : `blog.html?category=${filter}`;
        history.pushState({ category: filter }, '', newUrl);

        // Filter the displayed posts
        document.querySelectorAll(".blog-post-item").forEach(post => {
          if (filter === "all" || post.getAttribute("data-category") === filter) {
            post.style.display = "block";
          } else {
            post.style.display = "none";
          }
        });

        // Update active state of filter buttons
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
         // Update active state of sidebar category links
        sidebarCategoryLinks.forEach(link => {
            if (link.getAttribute('data-category') === filter) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Scroll to the top of the main content area
        document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
    }

    // Event listener for filter buttons
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('filter-button')) {
        const filter = e.target.getAttribute("data-filter");
        applyFilter(filter);
      }
    });

     // Event listener for sidebar category links
    sidebarCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            const filter = this.getAttribute('data-category');
            applyFilter(filter);
        });
    });

     // Handle back/forward browser navigation
    window.addEventListener('popstate', function(event) {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      loadBlogPosts(category);
      // Also update active state of filter buttons and sidebar links
      filterButtons.forEach(btn => {
          if (btn.getAttribute('data-filter') === (category || 'all')) {
              btn.classList.add('active');
          } else {
              btn.classList.remove('active');
          }
      });
       sidebarCategoryLinks.forEach(link => {
          if (link.getAttribute('data-category') === category) {
              link.classList.add('active');
          } else {
              link.classList.remove('active');
          }
      });
       // Scroll to the top when using back/forward navigation with filters
       document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
    });

    // Assuming you have a search input with id="search-input" and a button with id="search-button"
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results-container'); // You'll need to add this container to your blog.html

    searchButton.addEventListener('click', () => {
      performSearch();
    });

    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      }
    });

    function performSearch() {
      const query = searchInput.value.trim();

      if (query) {
        // Prevent the default navigation (if the button is inside a form)
        // event.preventDefault(); // You might need this depending on your HTML structure

        // Clear previous results and show a loading message
        searchResultsContainer.innerHTML = '<p>Searching...</p>';

        // Make the fetch request to your backend
        fetch(`/api/search/blog-posts?q=${encodeURIComponent(query)}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(results => {
            displayResults(results);
          })
          .catch(error => {
            console.error('Error fetching search results:', error);
            searchResultsContainer.innerHTML = '<p>An error occurred while fetching search results.</p>';
          });
      } else {
        // Handle empty query case (e.g., clear results or show a message)
        searchResultsContainer.innerHTML = '<p>Please enter a search term.</p>';
      }
    }

    function displayResults(results) {
      searchResultsContainer.innerHTML = ''; // Clear loading message

      if (results && results.length > 0) {
        results.forEach(result => {
          // Create HTML elements to display each result (e.g., title, summary, link)
          const resultElement = document.createElement('div');
          resultElement.classList.add('search-result'); // You'll need to define this class in your CSS

          resultElement.innerHTML = `
            <h3>${result.title}</h3>
            <p>${result.summary}</p>
            <a href="${result.url}">Read More</a>
          `;
          searchResultsContainer.appendChild(resultElement);
        });
      } else {
        searchResultsContainer.innerHTML = '<p class="no-results">No results found.</p>'; // You'll need to define this class in your CSS
      }
    }
    







  // --- Event listeners for the search bar in the header ---
  const headerSearchInput = document.querySelector('header .search-container #search-input');
  const headerSearchButton = document.querySelector('header .search-container #search-button');

  if (headerSearchInput && headerSearchButton) {
      // Listen for 'Enter' key in the input field
      headerSearchInput.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
              event.preventDefault(); // Prevent form submission if it's within a form
              const query = headerSearchInput.value.trim();
              if (query) {
                  performSearch(query);
              }
          }
      });

      // Listen for click on the search button
      headerSearchButton.addEventListener('click', function() { // This is the listener for your button
          const query = headerSearchInput.value.trim();
          if (query) {
              performSearch(query);
          }
      });

      console.log('Header search bar event listeners added.');
  } else {
      console.warn('Header search bar elements not found.');
  }

  // --- Event listeners for the search bar in the hero section (index.html, often for mobile) ---
  // Note: This assumes you want separate behavior or just need to capture input from this one too
  const heroSearchInput = document.querySelector('.search-container #search-input');
  const heroSearchButton = document.querySelector('.search-container #search-button');

  if (heroSearchInput && heroSearchButton) {
       // Listen for 'Enter' key in the input field
       heroSearchInput.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
              event.preventDefault(); // Prevent form submission if it's within a form
              const query = heroSearchInput.value.trim();
              if (query) {
                  performSearch(query); // Use the same search logic
              }
          }
      });

      // Listen for click on the search button
      heroSearchButton.addEventListener('click', function() {
          const query = heroSearchInput.value.trim();
          if (query) {
              performSearch(query); // Use the same search logic
          }
      });
      console.log('Hero search bar event listeners added.');
  } else {
       console.warn('Hero search bar elements not found.');
  }

});



    
// Merge all script here

            document.addEventListener('DOMContentLoaded', async () => {
                const container = document.getElementById('blog-posts-container');
                try {
                    const response = await fetch('/api/blog-posts');
                    if (!response.ok) throw new Error('Failed to fetch blog posts');
                    const posts = await response.json();

                    container.innerHTML = posts.map(post => `
        <a href="blog-post.html?id=${post.id}" class="blog-post" data-category="${post.category}">
    
        <div>
          <img src="${post.image}" alt="${post.title}">
                <h3 class="blog-post-title">${post.title}</h3>
                <!-- <p class="blog-post-excerpt">${post.snippet}</p> -->
                <!-- <p class="blog-post-meta">Posted on <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time></span></p> -->
                <!-- <a href="${post.url}" class="blog-post-link" aria-label="Read more about ${post.title}">Read More</a> -->
            </div>

            </a>
        `).join('');
                } catch (error) {
                    container.innerHTML = '<p>Unable to load latest blog posts at this time.</p>';
                    console.error(error);
                }
            });
    
            document.addEventListener('DOMContentLoaded', async () => {
                const container = document.getElementById('featured-projects-container');
                container.innerHTML = '<p>Loading featured projects...</p>';

                try {
                    const response = await fetch('/api/blog-posts');
                    if (!response.ok) throw new Error('Failed to fetch projects');
                    const posts = await response.json();

                    // Filter for case studies and take the first 3 as featured
                    const featuredCaseStudies = posts
                        .filter(post => post.postType === 'caseStudy')
                        .slice(0, 3);

                    if (featuredCaseStudies.length === 0) {
                        container.innerHTML = '<p>No featured projects available.</p>';
                        return;
                    }

                    container.innerHTML = '';

                    featuredCaseStudies.forEach(post => {
                        const projectItem = document.createElement('div');
                        projectItem.className = 'project-item';

                        const link = document.createElement('a');
                        link.href = `case-study-template.html?id=${post.id}`;
                        link.style.textDecoration = 'none';
                        link.style.color = 'inherit';
                        link.style.display = 'block';

                        const img = document.createElement('img');
                        img.src = post.image;
                        img.alt = post.title;
                        img.className = 'project-image';

                        const title = document.createElement('h3');
                        title.className = 'project-title';
                        title.textContent = post.title;

                        const excerpt = document.createElement('p');
                        excerpt.className = 'project-excerpt';
                        excerpt.textContent = post.snippet;

                        link.appendChild(img);
                        link.appendChild(title);
                        link.appendChild(excerpt);

                        projectItem.appendChild(link);
                        container.appendChild(projectItem);
                    });
                } catch (error) {
                    container.innerHTML = '<p>Unable to load featured projects at this time.</p>';
                    console.error(error);
                }
            });
      
        document.getElementById('enquiry-form').addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            const msg = document.getElementById('form-message');

            // Validate form fields
            if (!name || !email || !message) {
                msg.textContent = 'Please fill in all fields.';
                msg.style.color = 'red';
                return;
            }

            try {
                const res = await fetch('/api/send-enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (res.ok) {
                    msg.textContent = 'Enquiry sent successfully!';
                    msg.style.color = 'green';
                    this.reset(); // Clear the form
                } else {
                    const errorData = await res.json();
                    msg.textContent = errorData.message || 'Failed to send enquiry.';
                    msg.style.color = 'red';
                }
            } catch (error) {
                console.error('Error:', error);
                msg.textContent = 'An error occurred. Please check the server or network.';
                msg.style.color = 'red';
            }

            // Clear the message after 3 seconds
            setTimeout(() => {
                msg.textContent = '';
            }, 3000);
        });
    
        // Contact Modal Functionality
        document.addEventListener('DOMContentLoaded', function () {
            const openModalBtn = document.getElementById('open-contact-modal');
            const closeModalBtn = document.getElementById('close-contact-modal');
            const contactModal = document.getElementById('contact-modal');
            const closeSuccessBtn = document.getElementById('close-success-popup');
            const modalSuccessPopup = document.getElementById('modal-successPopup');
            const modalForm = document.getElementById('contactForm');

            // Open modal when button is clicked
            openModalBtn.addEventListener('click', function () {
                contactModal.style.display = 'flex';
            });

            // Close modal when close button is clicked
            closeModalBtn.addEventListener('click', function () {
                contactModal.style.display = 'none';
            });

            // Close success popup when close button is clicked
            closeSuccessBtn.addEventListener('click', function () {
                modalSuccessPopup.style.display = 'none';
            });

            // Close modal when clicking outside of modal content
            window.addEventListener('click', function (event) {
                if (event.target == contactModal) {
                    contactModal.style.display = 'none';
                }
                if (event.target == modalSuccessPopup) {
                    modalSuccessPopup.style.display = 'none';
                }
            });

            // Handle form submission
            modalForm.addEventListener('submit', async function (event) {
                event.preventDefault(); // Prevent default form submission

                if (grecaptcha.getResponse() === "") {
                    alert("Please complete the CAPTCHA");
                    return;
                }

                const formData = new FormData(modalForm);
                formData.append('g-recaptcha-response', grecaptcha.getResponse());

                try {
                    const response = await fetch('/submit-form', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        modalSuccessPopup.style.display = 'flex'; // Show success popup
                        modalForm.reset(); // Reset the form
                        grecaptcha.reset();
                        // Reset upload label text
                        uploadLabel.innerHTML = '<i class="fas fa-upload"></i> Browse to upload (optional)';
                        setTimeout(function () {
                            modalSuccessPopup.style.display = 'none'; // Hide popup after 3 seconds
                        }, 3000);
                    } else {
                        alert('Failed to send inquiry. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                }
            });

            // Update upload label text on file select
            const uploadInput = document.getElementById('modal-upload');
            const uploadLabel = document.querySelector('label[for="modal-upload"]');

            uploadInput.addEventListener('change', function () {
                if (uploadInput.files.length > 0) {
                    uploadLabel.innerHTML = `${uploadInput.files[0].name} <span id="remove-file" style="cursor:pointer; color:red; font-weight:bold; margin-left:8px;">&times;</span>`;
                    const removeBtn = document.getElementById('remove-file');
                    removeBtn.addEventListener('click', function () {
                        uploadInput.value = '';
                        uploadLabel.innerHTML = '<i class="fas fa-upload"></i> Browse to upload (optional)';
                    });
                } else {
                    uploadLabel.innerHTML = '<i class="fas fa-upload"></i> Browse to upload (optional)';
                }
            });
        });







 