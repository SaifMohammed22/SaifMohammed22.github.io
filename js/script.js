// ===== PORTFOLIO INTERACTIVITY =====

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Active navigation state
function initActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// Intersection Observer for section animations
function initSectionAnimations() {
  const sections = document.querySelectorAll('section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  sections.forEach(section => {
    observer.observe(section);
  });
}

// Skill bar animations
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const percentage = entry.target.getAttribute('data-percentage');
        entry.target.style.width = percentage + '%';
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => {
    observer.observe(bar);
  });
}

// Contact form handling
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(form);
      const name = formData.get('name') || 'Anonymous';
      const email = formData.get('email') || 'no-email@example.com';
      const subject = formData.get('subject') || 'Portfolio Contact';
      const message = formData.get('message') || 'No message provided';
      
      // Create mailto link
      const mailtoLink = `mailto:ssaifmohammed04@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      
      // Open email client
      window.open(mailtoLink);
      
      // Reset form
      form.reset();
      
      // Show success message
      showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    });
  }
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
  `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Parallax effect for hero section
function initParallax() {
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      heroSection.style.transform = `translateY(${rate}px)`;
    });
  }
}

// Floating animation for skill items
function initFloatingAnimations() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  skillItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add('float-animation');
  });
}

// Smooth reveal for project cards
function initProjectReveal() {
  const projectCards = document.querySelectorAll('.project-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, {
    threshold: 0.1
  });

  projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
}

// Typing effect disabled - was causing visual flicker
// Text now displays normally without animation

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScrolling();
  initActiveNavigation();
  initSectionAnimations();
  initSkillBars();
  initContactForm();
  initParallax();
  initFloatingAnimations();
  initProjectReveal();
  initThemeToggle();
  
  // Initialize blog preview on homepage
  if (document.getElementById('blog-preview')) {
    loadBlogPreview();
  }
  
  console.log('Portfolio initialized successfully! 🚀');
});

// ===== DARK MODE TOGGLE =====
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Check for saved theme preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

// ===== READING PROGRESS BAR =====
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });
}

// Add floating animation CSS
const floatingCSS = `
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

// Inject floating animation CSS
const style = document.createElement('style');
style.textContent = floatingCSS;
document.head.appendChild(style);

// ===== BLOG FUNCTIONALITY =====

let blogPosts = [];

// Parse frontmatter from markdown file
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, content: markdown };
  }
  
  const frontmatter = match[1];
  const content = match[2];
  
  // Parse YAML-like frontmatter
  const metadata = {};
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Handle arrays like [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim());
      }
      metadata[key] = value;
    }
  });
  
  return { metadata, content };
}

// Enhanced markdown parser with code blocks and images
function parseMarkdown(markdown) {
  let html = markdown;
  
  // Code blocks with syntax highlighting class (handles \r\n, \n, or \r line endings)
  html = html.replace(/```(\w+)?[\r\n]+([\s\S]*?)```/g, (match, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : '';
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code${langClass}>${escapedCode.trim()}</code></pre>`;
  });
  
  // Inline code (must come after code blocks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-image">');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Math is preserved as-is for KaTeX auto-render to handle
  
  // Unordered lists
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);
  
  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr>');
  
  // Paragraphs - wrap remaining text blocks
  const blocks = html.split('\n\n');
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap if already an HTML block element
    if (block.match(/^<(h[1-6]|ul|ol|li|pre|div|hr|img|blockquote)/i)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  
  return html;
}

// Load and parse a markdown post
async function loadMarkdownPost(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const markdown = await response.text();
    return parseFrontmatter(markdown);
  } catch (error) {
    console.error('Error loading post:', error);
    return null;
  }
}

// Fetch all blog posts
async function fetchBlogPosts() {
  try {
    const response = await fetch('/blog-posts.json');
    if (!response.ok) throw new Error('Failed to load posts index');
    const postsIndex = await response.json();
    
    // Load each markdown file
    const posts = await Promise.all(
      postsIndex.map(async (entry) => {
        const post = await loadMarkdownPost(entry.file);
        if (post) {
          return {
            id: entry.id,
            file: entry.file,
            title: post.metadata.title || 'Untitled',
            date: post.metadata.date || new Date().toISOString().split('T')[0],
            summary: post.metadata.summary || '',
            tags: Array.isArray(post.metadata.tags) ? post.metadata.tags : [],
            content: post.content
          };
        }
        return null;
      })
    );
    
    blogPosts = posts.filter(p => p !== null);
    return blogPosts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Load blog preview for homepage (shows latest 2 posts)
async function loadBlogPreview() {
  const container = document.getElementById('blog-preview');
  if (!container) return;

  const posts = await fetchBlogPosts();
  
  if (posts.length === 0) {
    container.innerHTML = '<p>No posts yet. Check back soon!</p>';
    return;
  }

  // Sort by date and take latest 2
  const latestPosts = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 2);

  container.innerHTML = latestPosts.map(post => `
    <a href="blog.html#${post.id}" class="blog-card">
      <div class="blog-card-date">${formatDate(post.date)}</div>
      <h3 class="blog-card-title">${post.title}</h3>
      <p class="blog-card-summary">${post.summary}</p>
      <div class="blog-card-tags">
        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

// Load all blog posts for blog page
async function loadBlogPosts() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  const posts = await fetchBlogPosts();
  
  if (posts.length === 0) {
    container.innerHTML = '<p>No posts yet. Check back soon!</p>';
    return;
  }

  // Update filter buttons with tags
  updateFilterButtons(posts);

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderBlogList(sortedPosts);
}

// Render blog list
function renderBlogList(posts) {
  const container = document.getElementById('blog-posts-container');
  
  container.innerHTML = posts.map(post => `
    <article class="blog-list-item" data-tags="${post.tags.join(',')}" onclick="showPost('${post.id}')">
      <div class="blog-card-date">${formatDate(post.date)}</div>
      <h3 class="blog-card-title">${post.title}</h3>
      <p class="blog-card-summary">${post.summary}</p>
      <div class="blog-card-tags">
        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
      </div>
      <span class="read-more-link">Read more →</span>
    </article>
  `).join('');
}

// Update filter buttons based on available tags
function updateFilterButtons(posts) {
  const filterContainer = document.querySelector('.blog-filters');
  if (!filterContainer) return;

  // Get unique tags
  const allTags = new Set();
  posts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));

  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all" onclick="filterPosts('all')">All</button>
    ${[...allTags].map(tag => 
      `<button class="filter-btn" data-filter="${tag}" onclick="filterPosts('${tag}')">${tag}</button>`
    ).join('')}
  `;
}

// Filter posts by tag
function filterPosts(tag) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === tag);
  });

  const items = document.querySelectorAll('.blog-list-item');
  items.forEach(item => {
    const itemTags = item.dataset.tags.split(',');
    if (tag === 'all' || itemTags.includes(tag)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Show single post
async function showPost(postId) {
  const post = blogPosts.find(p => p.id === postId);
  if (!post) return;

  const listSection = document.getElementById('blog-list');
  const postSection = document.getElementById('blog-post-view');
  const postContent = document.getElementById('blog-post-content');

  if (listSection) listSection.classList.add('hidden');
  if (postSection) postSection.classList.remove('hidden');

  postContent.innerHTML = `
    <header class="blog-post-header">
      <h1 class="blog-post-title">${post.title}</h1>
      <div class="blog-post-meta">${formatDate(post.date)}</div>
    </header>
    <div class="blog-post-body">
      ${parseMarkdown(post.content)}
    </div>
    <div class="blog-post-tags">
      ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
    </div>
  `;

  // Apply syntax highlighting if available
  if (typeof hljs !== 'undefined') {
    postContent.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }

  // Render math with KaTeX if available
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(postContent, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });
  }

  // Update URL hash
  window.location.hash = postId;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show blog list (back from single post)
function showBlogList() {
  const listSection = document.getElementById('blog-list');
  const postSection = document.getElementById('blog-post-view');

  if (listSection) listSection.classList.remove('hidden');
  if (postSection) postSection.classList.add('hidden');

  // Clear URL hash
  history.pushState('', document.title, window.location.pathname);
}

// Handle browser back/forward for blog posts
window.addEventListener('hashchange', () => {
  if (window.location.hash) {
    const postId = window.location.hash.slice(1);
    if (blogPosts.length > 0) {
      showPost(postId);
    }
  } else {
    showBlogList();
  }
});

