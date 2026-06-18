// ============================================
// PRODUCTION LEVEL LAYOUT LOADER (DRY PATTERN)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inject transition loader HTML immediately
  const injectTransitionLoader = () => {
    if (document.getElementById('page-transition-loader')) return;
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'page-transition-loader';
    loaderDiv.className = 'page-transition-loader';
    loaderDiv.innerHTML = `
      <div class="loader-logo">Dolly Digital Studio</div>
      <div class="loader-shutter"></div>
    `;
    document.body.prepend(loaderDiv);
  };

  injectTransitionLoader();

  // Fade out loader
  const removeTransitionLoader = () => {
    const loader = document.getElementById('page-transition-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('fade-out');
      }, 400);
    }
  };

  // Intercept local page transition navigations
  const setupPageTransitions = () => {
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      const target = link.getAttribute('target');
      
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target === '_blank' ||
        link.classList.contains('no-transition') ||
        (href.includes('://') && !href.includes(window.location.hostname))
      ) {
        return;
      }

      link.addEventListener('click', (e) => {
        // Handle contact anchor redirect exception
        if (href.includes('#')) {
          const parts = href.split('#');
          if (parts[0] === window.location.pathname.split('/').pop()) {
            return; // let browser scroll natively
          }
        }
        
        e.preventDefault();
        const loader = document.getElementById('page-transition-loader');
        if (loader) {
          loader.classList.remove('fade-out');
        }
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });
    });
  };

  // 1. Define targets
  const headerPlaceholder = document.getElementById('site-header');
  const footerPlaceholder = document.getElementById('site-footer');

  // 2. Load templates
  const loadLayouts = async () => {
    try {
      const headerPromise = headerPlaceholder
        ? fetch('/components/header.html')
            .then(res => res.text())
            .then(html => {
              headerPlaceholder.innerHTML = html;
              initializeNavigation();
            })
        : Promise.resolve();

      const footerPromise = footerPlaceholder
        ? fetch('/components/footer.html')
            .then(res => res.text())
            .then(html => {
              footerPlaceholder.innerHTML = html;
            })
        : Promise.resolve();

      await Promise.all([headerPromise, footerPromise]);
      setupPageTransitions();
      removeTransitionLoader();
      
      // Dispatch event for any page-specific scripts that need to run after header/footer are loaded
      document.dispatchEvent(new CustomEvent('layoutsLoaded'));
    } catch (err) {
      console.error('Error loading modular layouts:', err);
      removeTransitionLoader();
    }
  };

  // 3. Navigation Bindings (Hamburger & Active Class)
  const initializeNavigation = () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (!hamburger || !navMenu) return;

    const closeMenu = () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    hamburger.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isActive);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(event.target) && !hamburger.contains(event.target)) {
        closeMenu();
      }
    });

    // Close menu on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });

    // Highlight active link
    highlightActiveLink(navMenu);
  };

  const highlightActiveLink = (navMenu) => {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    
    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === pageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  loadLayouts();
});
