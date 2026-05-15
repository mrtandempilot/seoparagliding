import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://ejmybxnysrgjjixyialf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbXlieG55c3JnamppeHlpYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzA3NzcsImV4cCI6MjA5MTkwNjc3N30.73ZAWikj4gKPBryoRwE-cbaG7UTC2cvjRzCmi-FKLgM';
const BASE_URL = 'https://www.paragliding-oludeniz.com';

async function generate() {
    console.log('🚀 Starting Static Site Generation...');

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
                image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=70",
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
                image_url: "https://images.unsplash.com/photo-1533310266094-8898a03807dd?auto=format&fit=crop&w=600&q=70",
                content: "# Ölüdeniz Paragliding Pricing 2026\n\nHow much does it cost to fly in Ölüdeniz? Here is the breakdown:\n\n- Standard Tandem: $150\n- 4K Media Bundle: $190\n- Sunset Premium: $200"
            };
        }
        return post;
    });

    console.log(`📦 Fetched and sanitized ${posts.length} posts.`);

    const dist = 'dist';
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
    fs.mkdirSync(dist);
    fs.mkdirSync(path.join(dist, 'blog'));
    fs.mkdirSync(path.join(dist, 'assets'));

    const styleContent = fs.readFileSync('style.css', 'utf8');
    const formatContent = (content) => content
        .replace(/^# (.*$)/gim, '<h2 style="margin-top:2rem;">$1</h2>')
        .replace(/^## (.*$)/gim, '<h3 style="margin-top:1.5rem;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/^\- (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.5rem;">$1</li>')
        .replace(/\n/g, '<br>');

    const processHtml = (html) => {
        return html
            .replace(/<link rel="stylesheet" href="\/style.css">/g, `<style>${styleContent}</style>`)
            .replace(/<link rel="stylesheet" href="style.css">/g, `<style>${styleContent}</style>`)
            .replace('<link rel="preconnect" href="https://fonts.googleapis.com">', '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    };

    const generateCard = (post) => {
        const imageUrl = (post.image_url && !post.image_url.includes('example.com')) 
            ? post.image_url 
            : 'https://images.unsplash.com/photo-1533310266094-8898a03807dd?auto=format&fit=crop&w=600&q=70';
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

    // 5. Generate Index Page
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    const latestCards = posts.slice(0, 3).map(generateCard).join('');
    indexHtml = indexHtml.replace('<!-- LATEST_POSTS_INJECTION -->', latestCards);
    fs.writeFileSync(path.join(dist, 'index.html'), processHtml(indexHtml));

    // 6. Generate Blog List Page
    const blogTemplate = fs.readFileSync('blog.html', 'utf8');
    const allCards = posts.map(generateCard).join('');
    let blogListHtml = blogTemplate
        .replace(/<!-- CANONICAL_URL -->.*?["']/g, `${BASE_URL}/blog"`)
        .replace(/<!-- OG_URL -->.*?["']/g, `${BASE_URL}/blog"`)
        .replace('<!-- LATEST_POSTS_INJECTION -->', allCards)
        .replace('<!-- PAGE_TITLE -->', '')
        .replace('<!-- PAGE_DESCRIPTION -->', '');
    
    const bScriptStartIndex = blogListHtml.indexOf('<script>');
    const bScriptEndIndex = blogListHtml.lastIndexOf('</script>');
    if (bScriptStartIndex !== -1 && bScriptEndIndex > bScriptStartIndex) {
        blogListHtml = blogListHtml.substring(0, bScriptStartIndex) + '<!-- Static Archive Rendered -->' + blogListHtml.substring(bScriptEndIndex + 9);
    }
    blogListHtml = blogListHtml.replace('<h2>SkyHigh <span style="color: var(--primary)">Stories</span></h2>', '<h1>SkyHigh <span style="color: var(--primary)">Stories</span></h1>');
    fs.writeFileSync(path.join(dist, 'blog.html'), processHtml(blogListHtml));

    // 7. Generate Individual Post Pages
    for (const post of posts) {
        let postHtml = blogTemplate
            .replace(/<!-- CANONICAL_URL -->.*?["']/g, `${BASE_URL}/blog/${post.slug}"`)
            .replace(/<!-- OG_URL -->.*?["']/g, `${BASE_URL}/blog/${post.slug}"`)
            .replace('<!-- PAGE_TITLE -->SkyHigh Stories | Ölüdeniz Paragliding Blog', `${post.title} | SkyHigh Ölüdeniz`)
            .replace('<!-- PAGE_DESCRIPTION -->Latest paragliding news and expert flight stories from the SkyHigh team in Ölüdeniz, Fethiye.', post.excerpt || post.title)
            .replace(/<meta property="og:title" content=".*?"/g, `<meta property="og:title" content="${post.title} | SkyHigh Stories"`)
            .replace(/<meta property="og:description" content=".*?"/g, `<meta property="og:description" content="${post.excerpt || post.title}"`)
            .replace(/<meta name="twitter:title" content=".*?"/g, `<meta name="twitter:title" content="${post.title} | SkyHigh Stories"`)
            .replace(/<meta name="twitter:description" content=".*?"/g, `<meta name="twitter:description" content="${post.excerpt || post.title}"`)
            .replace('<!-- POST_DETAIL_INJECTION -->', `
                <p style="color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">${post.category || 'Adventure'} • <time datetime="${post.created_at}">${new Date(post.created_at).toLocaleDateString()}</time></p>
                <h1 style="font-size: 3rem; margin-bottom: 2rem; line-height: 1.2;">${post.title}</h1>
                <img src="${(post.image_url && !post.image_url.includes('example.com')) ? post.image_url : 'https://images.unsplash.com/photo-1533310266094-8898a03807dd?auto=format&fit=crop&w=1000&q=70'}" alt="${post.title} - Ölüdeniz paragliding" style="width: 100%; border-radius: var(--radius); margin-bottom: 3rem;">
                <div class="post-content" style="line-height: 1.8; font-size: 1.1rem; color: #cbd5e1;">${formatContent(post.content)}</div>
            `)
            .replace('display: none; /* Shown only when slug is present */', 'display: block;')
            .replace('<div id="blog-list-view">', '<div id="blog-list-view" style="display:none;">')
            .replace('<h2>SkyHigh <span style="color: var(--primary)">Stories</span></h2>', '<div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">SkyHigh <span style="color: var(--primary)">Stories</span></div>');
        
        postHtml = postHtml.replace('</head>', generateBlogSchema(post) + '\n</head>');
        const scriptStartIndex = postHtml.indexOf('<script>');
        const scriptEndIndex = postHtml.lastIndexOf('</script>');
        if (scriptStartIndex !== -1 && scriptEndIndex > scriptStartIndex) {
            postHtml = postHtml.substring(0, scriptStartIndex) + '<!-- Static Content Rendered -->' + postHtml.substring(scriptEndIndex + 9);
        }
        fs.writeFileSync(path.join(dist, 'blog', `${post.slug}.html`), processHtml(postHtml));
    }

    // 8. Copy and Process All Other Pages
    const pagesToInline = [
        'pricing.html', 'safety.html', 'location.html', 'faq.html', 'booking.html',
        'oludeniz-paragliding.html', 'fethiye-paragliding.html',
        'oludeniz-paragliding-price.html', 'oludeniz-paragliding-booking.html',
        'fethiye-paragliding-price.html', 'fethiye-paragliding-booking.html',
        'marmaris-paragliding-price.html', 'marmaris-paragliding-tour-oludeniz.html',
        'antalya-paragliding-day-trip-oludeniz.html', 'kas-paragliding-experience.html',
        'babadaag-paragliding-experience.html', 'is-paragliding-safe-oludeniz.html',
        'what-to-expect-paragliding-oludeniz.html', 'paragliding-oludeniz-guide.html',
        'oludeniz-tandem-paragliding.html', 'vip-paragliding-oludeniz-private-flight.html',
        'paragliding-photo-video-package-oludeniz.html', 'sunset-paragliding-oludeniz.html',
        'best-time-paragliding-oludeniz.html', 'oludeniz-paragliding-weather-guide.html',
        'summer-paragliding-fethiye.html'
    ];

    pagesToInline.forEach(page => {
        if (fs.existsSync(page)) {
            const content = fs.readFileSync(page, 'utf8');
            fs.writeFileSync(path.join(dist, page), processHtml(content));
        }
    });

    const staticFiles = ['script.js', 'robots.txt', 'google0ea4b84cd5b64d00.html'];
    staticFiles.forEach(file => {
        if (fs.existsSync(file)) fs.copyFileSync(file, path.join(dist, file));
    });

    if (fs.existsSync('assets')) {
        const assets = fs.readdirSync('assets');
        assets.forEach(asset => fs.copyFileSync(path.join('assets', asset), path.join(dist, 'assets', asset)));
    }

    const today = new Date().toISOString().split('T')[0];
    const moneyPages = pagesToInline.map(p => p.replace('.html', ''));
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/blog</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/pricing</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/safety</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/location</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/faq</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/booking</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
  ${moneyPages.map(p => `<url><loc>${BASE_URL}/${p}</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>`).join('\n  ')}
  ${posts.map(p => `<url><loc>${BASE_URL}/blog/${p.slug}</loc><lastmod>${new Date(p.created_at).toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>`).join('\n  ')}
</urlset>`;
    fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemapContent);
    fs.writeFileSync('sitemap.xml', sitemapContent);

    console.log('✅ SSG Completed with Inlined CSS! Site is optimized for speed.');
}

generate().catch(console.error);
