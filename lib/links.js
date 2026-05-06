export function parseCustomLinks(linkInput) {
  if (!linkInput || linkInput.trim().toUpperCase() === "SKIP") {
    return getDefaultLinks();
  }

  const links = {};
  const entries = linkInput.split(",").map((e) => e.trim());

  entries.forEach((entry) => {
    const [key, value] = entry.split(":").map((s) => s.trim());
    if (key && value) {
      links[key.toLowerCase()] = value;
    }
  });

  return { ...getDefaultLinks(), ...links };
}

export function getDefaultLinks() {
  return {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "contact@example.com",
    portfolio: "https://yourportfolio.com",
    demo: "https://demo.example.com",
  };
}

export function generateNavLinks(customLinks) {
  const navHTML = `
      <nav class="nav-links">
        <a href="${customLinks.portfolio || "#"}">Portfolio</a>
        <a href="${customLinks.demo || "#"}">Demo</a>
        <a href="${customLinks.email ? `mailto:${customLinks.email}` : "#"}">Contact</a>
      </nav>`;
  return navHTML;
}

export function generateSocialLinks(customLinks) {
  const socialHTML = `
    <div class="social-links">
      ${customLinks.github ? `<a href="${customLinks.github}" target="_blank">GitHub</a>` : ""}
      ${customLinks.linkedin ? `<a href="${customLinks.linkedin}" target="_blank">LinkedIn</a>` : ""}
      ${customLinks.twitter ? `<a href="${customLinks.twitter}" target="_blank">Twitter</a>` : ""}
      ${customLinks.email ? `<a href="mailto:${customLinks.email}">Email</a>` : ""}
    </div>`;
  return socialHTML;
}

export function generateFooterLinks(customLinks) {
  const footerHTML = `
    <div class="footer-section">
      <h4>Connect</h4>
      <ul>
        ${customLinks.github ? `<li><a href="${customLinks.github}" target="_blank">GitHub</a></li>` : ""}
        ${customLinks.linkedin ? `<li><a href="${customLinks.linkedin}" target="_blank">LinkedIn</a></li>` : ""}
        ${customLinks.twitter ? `<li><a href="${customLinks.twitter}" target="_blank">Twitter</a></li>` : ""}
        ${customLinks.email ? `<li><a href="mailto:${customLinks.email}">Email</a></li>` : ""}
        ${customLinks.portfolio ? `<li><a href="${customLinks.portfolio}">Portfolio</a></li>` : ""}
      </ul>
    </div>`;
  return footerHTML;
}
