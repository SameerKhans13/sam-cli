import axios from "axios";
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";
import * as path from "path";

/**
 * Ethically scrapes quotes from quotes.toscrape.com
 * This is a PRACTICE site designed specifically for learning web scraping
 */
export async function scrapeQuotes(pageLimit = 3) {
  try {
    const quotes = [];
    const baseUrl = "http://quotes.toscrape.com";

    for (let page = 1; page <= pageLimit; page++) {
      const url = `${baseUrl}/page/${page}/`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $(".quote").each((i, el) => {
        const text = $(el).find(".text").text().replace(/"/g, "").trim();
        const author = $(el).find(".author small").text().replace("by ", "").trim();
        const tags = [];
        $(el).find(".tags .tag").each((j, tag) => {
          tags.push($(tag).text().replace("tag: ", "").trim());
        });

        quotes.push({ text, author, tags });
      });
    }

    return {
      success: true,
      count: quotes.length,
      data: quotes,
      source: "quotes.toscrape.com (Educational Practice Site)",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Ethically scrapes books from books.toscrape.com
 * This is a PRACTICE site designed specifically for learning web scraping
 */
export async function scrapeBooks(pageLimit = 2) {
  try {
    const books = [];
    const baseUrl = "http://books.toscrape.com";

    for (let page = 1; page <= pageLimit; page++) {
      const url = `${baseUrl}/catalogue/page-${page}.html`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $(".product_pod").each((i, el) => {
        const title = $(el).find("h3 a").attr("title");
        const price = $(el).find(".price_color").text().trim();
        const rating = $(el).find(".star-rating").attr("class").split(" ")[1];
        const availability = $(el).find(".instock.availability").text().trim();

        books.push({ title, price, rating, availability });
      });
    }

    return {
      success: true,
      count: books.length,
      data: books,
      source: "books.toscrape.com (Educational Practice Site)",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates an original portfolio website from data
 * Creates HTML/CSS/JS for a responsive portfolio
 */
export function generatePortfolioSite(data = {}) {
  const {
    title = "My Portfolio",
    description = "Showcase of my work and projects",
    projects = [],
    skills = [],
    outputDir = "../generated-portfolio-site",
  } = data;

  try {
    mkdirSync(outputDir, { recursive: true });

    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="logo">${title}</div>
            <ul class="nav-links">
                <li><a href="#projects">Projects</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
        <div class="hero">
            <h1>${title}</h1>
            <p>${description}</p>
        </div>
    </header>

    <section id="projects" class="projects">
        <h2>Projects</h2>
        <div class="projects-grid">
            ${projects.slice(0, 6).map((proj, i) => `
            <div class="project-card">
                <h3>${proj.title || `Project ${i + 1}`}</h3>
                <p>${proj.description || "An innovative project showcasing modern development practices."}</p>
                <div class="tags">
                    ${(proj.tags || ["Web Development"])
                      .slice(0, 3)
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
            </div>
            `).join("")}
        </div>
    </section>

    <section id="skills" class="skills">
        <h2>Skills</h2>
        <div class="skills-grid">
            ${(skills.length > 0 ? skills : ["JavaScript", "React", "Node.js", "Web Design", "Problem Solving", "Team Collaboration"])
              .slice(0, 8)
              .map((skill) => `<div class="skill-badge">${skill}</div>`)
              .join("")}
        </div>
    </section>

    <section id="contact" class="contact">
        <h2>Get in Touch</h2>
        <p>I'm always interested in hearing about new projects and opportunities.</p>
        <a href="mailto:contact@example.com" class="cta-button">Send me an email</a>
    </section>

    <footer class="footer">
        <p>&copy; 2026 ${title}. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

    // Generate CSS
    const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.2);
}

.logo {
    font-size: 1.8rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

.nav-links a:hover {
    opacity: 0.8;
}

.hero {
    text-align: center;
    padding: 4rem 2rem;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: slideDown 0.8s ease-out;
}

.hero p {
    font-size: 1.2rem;
    opacity: 0.9;
}

section {
    max-width: 1200px;
    margin: 4rem auto;
    padding: 2rem;
}

h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
    color: white;
}

.projects {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
}

.project-card h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.tag {
    background: #667eea;
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
}

.skills {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
}

.skill-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.contact {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.contact h2 {
    color: #667eea;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    margin-top: 1rem;
    transition: transform 0.3s;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.cta-button:hover {
    transform: scale(1.05);
}

.footer {
    background: rgba(0, 0, 0, 0.3);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .nav-links {
        gap: 1rem;
    }

    .hero h1 {
        font-size: 2rem;
    }

    section {
        margin: 2rem 1rem;
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}`;

    // Generate JavaScript
    const js = `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add scroll animation on elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .skill-badge').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

console.log('Portfolio site loaded successfully! 🚀');`;

    writeFileSync(path.join(outputDir, "index.html"), html);
    writeFileSync(path.join(outputDir, "styles.css"), css);
    writeFileSync(path.join(outputDir, "script.js"), js);

    return {
      success: true,
      message: "Portfolio site generated successfully!",
      outputDir,
      files: ["index.html", "styles.css", "script.js"],
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates an original quote gallery from scraped quotes
 * Creates HTML/CSS/JS for an interactive quote display
 */
export function generateQuoteGallery(quotes = [], outputDir = "../generated-quote-gallery") {
  try {
    mkdirSync(outputDir, { recursive: true });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspirational Quotes Gallery</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>✨ Inspirational Quotes</h1>
            <p>A collection of wisdom from great minds</p>
        </header>

        <div class="quotes-gallery" id="gallery">
            ${quotes.slice(0, 12).map((quote, i) => `
            <div class="quote-card" data-index="${i}">
                <div class="quote-mark">"</div>
                <p class="quote-text">${quote.text}</p>
                <p class="quote-author">— ${quote.author || "Unknown"}</p>
                <div class="quote-tags">
                    ${(quote.tags || []).slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join("")}
                </div>
                <button class="share-btn" onclick="shareQuote(${i})">📤 Share</button>
            </div>
            `).join("")}
        </div>

        <div class="controls">
            <button id="shuffle" class="btn">🔀 Shuffle</button>
            <button id="reset" class="btn">↺ Reset</button>
            <span class="total">Total: ${quotes.length} quotes</span>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>`;

    const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Georgia', serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.quotes-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.quote-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.quote-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.quote-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.quote-mark {
    font-size: 4rem;
    color: #667eea;
    opacity: 0.3;
    line-height: 1;
    margin-bottom: -1rem;
}

.quote-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #333;
    margin-bottom: 1rem;
    font-style: italic;
}

.quote-author {
    color: #667eea;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.quote-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
}

.tag {
    background: #f0f0f0;
    color: #667eea;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.85rem;
}

.share-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
    margin-top: 1rem;
    width: 100%;
}

.share-btn:hover {
    transform: scale(1.05);
}

.controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.btn {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.btn:hover {
    background: #667eea;
    color: white;
}

.total {
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }

    .quotes-gallery {
        grid-template-columns: 1fr;
    }
}`;

    const js = `let allQuotes = ${JSON.stringify(quotes.slice(0, 12))};

function shareQuote(index) {
    const quote = allQuotes[index];
    const text = \`"\${quote.text}" — \${quote.author}\`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Inspirational Quote',
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Quote copied to clipboard!');
        });
    }
}

document.getElementById('shuffle')?.addEventListener('click', () => {
    const gallery = document.getElementById('gallery');
    const cards = Array.from(gallery.children);
    
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    cards.forEach(card => gallery.appendChild(card));
});

document.getElementById('reset')?.addEventListener('click', () => {
    location.reload();
});

console.log('Quote gallery loaded! 📖');`;

    writeFileSync(path.join(outputDir, "index.html"), html);
    writeFileSync(path.join(outputDir, "styles.css"), css);
    writeFileSync(path.join(outputDir, "script.js"), js);

    return {
      success: true,
      message: "Quote gallery generated successfully!",
      outputDir,
      files: ["index.html", "styles.css", "script.js"],
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
