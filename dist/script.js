/**
 * SkyHigh Ölüdeniz - Site Logic
 * Optimized for performance and Supabase REST integration.
 */

const SUPABASE_URL = 'https://ejmybxnysrgjjixyialf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbXlieG55c3JnamppeHlpYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzA3NzcsImV4cCI6MjA5MTkwNjc3N30.73ZAWikj4gKPBryoRwE-cbaG7UTC2cvjRzCmi-FKLgM';

async function fetchLatestPosts(limit = 3) {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    // SECURITY / PERFORMANCE: If we already have statically generated posts (more than one child), 
    // don't overwrite them with a client-side fetch.
    if (blogContainer.children.length > 1) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        const posts = await response.json();
        
        if (posts.length === 0) {
            blogContainer.innerHTML = '<p style="text-align: center; width: 100%;">New adventures taking flight soon. Check back tomorrow!</p>';
            return;
        }

        blogContainer.innerHTML = posts.map(post => `
            <article class="blog-card">
                <img src="${post.image_url || '/assets/thumb.png'}" alt="${post.title}" class="blog-img">
                <div class="blog-content">
                    <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">${post.category || 'Adventure'}</span>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt || 'Read about our latest tandem flight over the stunning blue lagoon of Ölüdeniz...'}</p>
                    <a href="/blog/${post.slug}" class="read-more">Read Story</a>
                </div>
            </article>
        `).join('');

        // Re-init animations for new cards
        initAnimations();

    } catch (error) {
        console.error('Error fetching posts:', error);
        // Silent fail if static content exists, otherwise show error.
        if (blogContainer.children.length <= 1) {
            blogContainer.innerHTML = '<p>The sky is a bit cloudy. Unable to load stories right now.</p>';
        }
    }
}

// Simple Intersection Observer for scroll animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .blog-card').forEach(el => {
        // Only apply if not already visible to avoid reset
        if (el.style.opacity !== "1") {
            el.style.opacity = 0;
            el.style.transform = 'translateY(20px)';
            el.style.transition = '0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        }
    });
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    // Note: fetchLatestPosts is NOT called globally anymore to favor SSG. 
    // It is called manually in blog.html as a fallback.
    initAnimations();
});
