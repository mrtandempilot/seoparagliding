import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://ejmybxnysrgjjixyialf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbXlieG55c3JnamppeHlpYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzA3NzcsImV4cCI6MjA5MTkwNjc3N30.73ZAWikj4gKPBryoRwE-cbaG7UTC2cvjRzCmi-FKLgM';
const BASE_URL = 'https://www.paragliding-oludeniz.com';

async function generate() {
    console.log('🚀 Starting Static Site Generation...');

    // 1. Fetch Posts
    const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=created_at.desc`, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`
        }
    });
    let posts = await response.json();
    
    // 🔥 DATA OVERRIDE: Force replace Turkish posts with English high-value content
    posts = posts.map(post => {
        if (post.slug === 'supabase-ile-dinamik-blog-yonetimi' || post.id === 'b1b60965-566a-4aca-afb0-c984981722e3') {
            return {
                ...post,
                title: "Babadağ Mountain Guide: Everything You Need to Know",
                slug: "babadag-mountain-paragliding-guide",
                excerpt: "Planning a flight from Babadağ? Here is your complete guide to altitude, weather, and launch sites.",
                category: "Guide",
                image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200",
                content: "# Babadağ Mountain: The World's Best Paragliding Peak\n\nBabadağ Mountain rises 1,969 meters above the Mediterranean coast of Ölüdeniz. It is the highest coastal paragliding launch site in the world.\n\n## Why Choose Babadağ?\nThe vertical drop from 1,960m directly to sea level within 5km creates unmatched thermals and views."
            };
        }
        if (post.slug === 'oludenizde-gokyuzu-ozgurlugu-yamac-parasutu-rehberi' || post.id === '3e0d7dba-f0a7-49b6-8c6d-e63db175d9e8') {
            return {
                ...post,
                title: "Ölüdeniz Paragliding Price Guide 2026",
                slug: "oludeniz-paragliding-price-guide-2026",
                excerpt: "Current rates, package inclusions, and how to book the best tandem flight in Fethiye.",
                category: "Pricing",
                image_url: "https://images.unsplash.com/photo-1533310266094-8898a03807dd?auto=format&fit=crop&w=1200",
                content: "# Ölüdeniz Paragliding Pricing 2026\n\nHow much does it cost to fly in Ölüdeniz? Here is the breakdown:\n\n- Standard Tandem: $150\n- 4K Media Bundle: $190\n- Sunset Premium: $200"
            };
        }
        return post;
    });

    console.log(`📦 Fetched and sanitized ${posts.length} posts.`);

    // 2. Setup dist directory
    const dist = 'dist';
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
    fs.mkdirSync(dist);
    fs.mkdirSync(path.join(dist, 'blog'));
    fs.mkdirSync(path.join(dist, 'assets'));

    // 3. Helper to format Markdown-ish content
    const formatContent = (content) => content
        .replace(/^# (.*$)/gim, '<h2 style="margin-top:2rem;">$1</h2>')
        .replace(/^## (.*$)/gim, '<h3 style="margin-top:1.5rem;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/^\- (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.5rem;">$1</li>')
        .replace(/\n/g, '<br>');

    const generateCard = (post) => {
        const imageUrl = (post.image_url && !post.image_url.includes('example.com')) 
            ? post.image_url 
            : '/assets/hero.png';
        return `
        <article class="blog-card">
            <img src="${imageUrl}" alt="${post.title} - Ölüdeniz paragliding" class="blog-img">
            <div class="blog-content">
                <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">${post.category || 'Adventure'}</span>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt || 'Read about our latest tandem flight...'}</p>
                <a href="/blog/${post.slug}" class="read-more">Read Story</a>
            </div>
        </article>`;
    };

    // 4. Generate BlogPosting Schema for individual posts
    const generateBlogSchema = (post) => `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": ${JSON.stringify(post.title)},
      "description": ${JSON.stringify(post.excerpt || post.title)},
      "image": ${JSON.stringify(post.image_url || BASE_URL + '/assets/hero.png')},
      "author": {
        "@type": "Organization",
        "name": "SkyHigh Ölüdeniz"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SkyHigh Ölüdeniz",
        "url": "${BASE_URL}/"
      },
      "datePublished": ${JSON.stringify(post.created_at)},
      "dateModified": ${JSON.stringify(post.created_at)},
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${BASE_URL}/blog/${post.slug}"
      }
    }
    </script>`;

    // 5. Generate Index Page (Latest 3)
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    const latestCards = posts.slice(0, 3).map(generateCard).join('');
    indexHtml = indexHtml.replace('<!-- LATEST_POSTS_INJECTION -->', latestCards);
    fs.writeFileSync(path.join(dist, 'index.html'), indexHtml);

    // 6. Generate Blog List Page
    const blogTemplate = fs.readFileSync('blog.html', 'utf8');
    const allCards = posts.map(generateCard).join('');
    let blogListHtml = blogTemplate
        .replace(/<!-- CANONICAL_URL -->.*?["']/g, `${BASE_URL}/blog"`)
        .replace(/<!-- OG_URL -->.*?["']/g, `${BASE_URL}/blog"`)
        .replace('<!-- LATEST_POSTS_INJECTION -->', allCards)
        .replace('<!-- PAGE_TITLE -->', '')
        .replace('<!-- PAGE_DESCRIPTION -->', '');
    
    // TRU STATIC for listing page: Remove redundant scripts
    const bScriptStartIndex = blogListHtml.indexOf('<script>');
    const bScriptEndIndex = blogListHtml.lastIndexOf('</script>');
    if (bScriptStartIndex !== -1 && bScriptEndIndex > bScriptStartIndex) {
        blogListHtml = blogListHtml.substring(0, bScriptStartIndex) + '<!-- Static Archive Rendered -->' + blogListHtml.substring(bScriptEndIndex + 9);
    }
    // Blog listing page needs its own H1
    blogListHtml = blogListHtml.replace('<h2>SkyHigh <span style="color: var(--primary)">Stories</span></h2>', '<h1>SkyHigh <span style="color: var(--primary)">Stories</span></h1>');
    fs.writeFileSync(path.join(dist, 'blog.html'), blogListHtml);

    // 7. Generate Individual Post Pages
    for (const post of posts) {
        let postHtml = blogTemplate
            .replace(/<!-- CANONICAL_URL -->.*?["']/g, `${BASE_URL}/blog/${post.slug}"`)
            .replace(/<!-- OG_URL -->.*?["']/g, `${BASE_URL}/blog/${post.slug}"`)
            .replace('<!-- PAGE_TITLE -->SkyHigh Stories | Ölüdeniz Paragliding Blog', `${post.title} | SkyHigh Ölüdeniz`)
            .replace('<!-- PAGE_DESCRIPTION -->Latest paragliding news and expert flight stories from the SkyHigh team in Ölüdeniz, Fethiye.', post.excerpt || post.title)
            // Enhanced Social Meta
            .replace(/<meta property="og:title" content=".*?"/g, `<meta property="og:title" content="${post.title} | SkyHigh Stories"`)
            .replace(/<meta property="og:description" content=".*?"/g, `<meta property="og:description" content="${post.excerpt || post.title}"`)
            .replace(/<meta name="twitter:title" content=".*?"/g, `<meta name="twitter:title" content="${post.title} | SkyHigh Stories"`)
            .replace(/<meta name="twitter:description" content=".*?"/g, `<meta name="twitter:description" content="${post.excerpt || post.title}"`)
            .replace('<!-- POST_DETAIL_INJECTION -->', `
                <p style="color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">${post.category || 'Adventure'} • <time datetime="${post.created_at}">${new Date(post.created_at).toLocaleDateString()}</time></p>
                <h1 style="font-size: 3rem; margin-bottom: 2rem; line-height: 1.2;">${post.title}</h1>
                <img src="${(post.image_url && !post.image_url.includes('example.com')) ? post.image_url : 'https://images.unsplash.com/photo-1533310266094-8898a03807dd?auto=format&fit=crop&w=1200'}" alt="${post.title} - Ölüdeniz paragliding" style="width: 100%; border-radius: var(--radius); margin-bottom: 3rem;">
                <div class="post-content" style="line-height: 1.8; font-size: 1.1rem; color: #cbd5e1;">${formatContent(post.content)}</div>
            `)
            .replace('display: none; /* Shown only when slug is present */', 'display: block;')
            .replace('<div id="blog-list-view">', '<div id="blog-list-view" style="display:none;">')
            .replace('<h2>SkyHigh <span style="color: var(--primary)">Stories</span></h2>', '<div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">SkyHigh <span style="color: var(--primary)">Stories</span></div>');
        
        // Inject BlogPosting Schema before </head>
        postHtml = postHtml.replace('</head>', generateBlogSchema(post) + '\n</head>');

        // TRU STATIC: Remove the redundant script block from the generated file
        // This ensures the page is 100% static and doesn't try to sync with the API again.
        const scriptStartIndex = postHtml.indexOf('<script>');
        const scriptEndIndex = postHtml.lastIndexOf('</script>');
        if (scriptStartIndex !== -1 && scriptEndIndex > scriptStartIndex) {
            // We want to keep script.js but remove the internal handleRouting logic
            postHtml = postHtml.substring(0, scriptStartIndex) + '<!-- Static Content Rendered -->' + postHtml.substring(scriptEndIndex + 9);
        }
        
        fs.writeFileSync(path.join(dist, 'blog', `${post.slug}.html`), postHtml);
    }

    // 8. Copy Static Assets & Files
    const filesToCopy = [
        'style.css', 'script.js', 'robots.txt', 'google0ea4b84cd5b64d00.html',
        // Core pages
        'pricing.html', 'safety.html', 'location.html', 'faq.html', 'booking.html',
        // Money pages — Main
        'oludeniz-paragliding.html', 'fethiye-paragliding.html',
        'oludeniz-paragliding-price.html', 'oludeniz-paragliding-booking.html',
        'fethiye-paragliding-price.html', 'fethiye-paragliding-booking.html',
        // Money pages — Location
        'marmaris-paragliding-price.html', 'marmaris-paragliding-tour-oludeniz.html',
        'antalya-paragliding-day-trip-oludeniz.html', 'kas-paragliding-experience.html',
        // Money pages — Trust/Info
        'babadaag-paragliding-experience.html', 'is-paragliding-safe-oludeniz.html',
        'what-to-expect-paragliding-oludeniz.html', 'paragliding-oludeniz-guide.html',
        // Money pages — Sales
        'oludeniz-tandem-paragliding.html', 'vip-paragliding-oludeniz-private-flight.html',
        'paragliding-photo-video-package-oludeniz.html', 'sunset-paragliding-oludeniz.html',
        // Money pages — Seasonal
        'best-time-paragliding-oludeniz.html', 'oludeniz-paragliding-weather-guide.html',
        'summer-paragliding-fethiye.html'
    ];
    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) fs.copyFileSync(file, path.join(dist, file));
    });
    
    // Copy Assets folder
    if (fs.existsSync('assets')) {
        const assets = fs.readdirSync('assets');
        assets.forEach(asset => fs.copyFileSync(path.join('assets', asset), path.join(dist, 'assets', asset)));
    }

    // 9. Generate Complete Sitemap with ALL pages
    const today = new Date().toISOString().split('T')[0];
    const moneyPages = [
        'oludeniz-paragliding', 'fethiye-paragliding',
        'oludeniz-paragliding-price', 'oludeniz-paragliding-booking',
        'fethiye-paragliding-price', 'fethiye-paragliding-booking',
        'marmaris-paragliding-price', 'marmaris-paragliding-tour-oludeniz',
        'antalya-paragliding-day-trip-oludeniz', 'kas-paragliding-experience',
        'babadaag-paragliding-experience', 'is-paragliding-safe-oludeniz',
        'what-to-expect-paragliding-oludeniz', 'paragliding-oludeniz-guide',
        'oludeniz-tandem-paragliding', 'vip-paragliding-oludeniz-private-flight',
        'paragliding-photo-video-package-oludeniz', 'sunset-paragliding-oludeniz',
        'best-time-paragliding-oludeniz', 'oludeniz-paragliding-weather-guide',
        'summer-paragliding-fethiye'
    ];
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/blog</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/pricing</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/safety</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/location</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/faq</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/booking</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
  ${moneyPages.filter(p => fs.existsSync(`${p}.html`)).map(p => `<url><loc>${BASE_URL}/${p}</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>`).join('\n  ')}
  ${posts.map(p => `<url><loc>${BASE_URL}/blog/${p.slug}</loc><lastmod>${new Date(p.created_at).toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>`).join('\n  ')}
</urlset>`;
    fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemapContent);
    fs.writeFileSync('sitemap.xml', sitemapContent);

    console.log('✅ SSG Completed! Site is ready in /dist');
}

generate().catch(console.error);
