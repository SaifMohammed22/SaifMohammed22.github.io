// Theme Toggle
(function() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
})();

// Smooth scrolling (works from homepage and sub-pages like /post/...)
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;
    const linkPath = href.slice(0, hashIndex) || '/';
    const hash = href.slice(hashIndex);
    if (hash.length <= 1) return;
    // Only smooth-scroll if the link targets the current page.
    // From a blog post, "/#about" navigates back to the homepage instead.
    const samePage =
      linkPath === '/' && (window.location.pathname === '/' || window.location.pathname === '/index.html') ||
      linkPath === window.location.pathname;
    if (!samePage) return; // let the browser navigate to "/#..."
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', hash);
    }
  });
});

// Project filtering
(function() {
  const filters = document.getElementById('project-filters');
  const grid = document.getElementById('projects-grid');
  if (!filters || !grid) return;

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    grid.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.dataset.tags.includes(filter)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
})();

// Active nav highlight (homepage only)
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
})();
