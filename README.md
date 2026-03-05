<div align="center">
  <img src="my pictures/dark mode.webp" alt="Mosa Moleleki - Portfolio" width="120" style="border-radius: 50%;" />
  <h1>👨‍💻 Mosa "S.U.D.O" Moleleki - Personal Portfolio</h1>
  <p>
    <strong>A highly interactive, modern, and performant personal portfolio website.</strong>
  </p>

  <p>
    <a href="https://github.com/Mr-S-U-D-O/personalPortfolioProject/stargazers">
      <img src="https://img.shields.io/github/stars/Mr-S-U-D-O/personalPortfolioProject?style=for-the-badge&color=ffd700&label=Star%20this%20Repo!&logo=github" alt="GitHub Stars">
    </a>
  </p>
</div>

<br />

Welcome to the source repository for my personal portfolio! This site is designed from the ground up to showcase my projects, technical articles, and front-end development capabilities using a blend of vanilla HTML/CSS/JS architecture fused with modern animation logic.

> **Note:** If you find this project interesting or inspiring, I would highly appreciate a **star** ⭐️ on the repository! However, please review the critical legal guidelines below before exploring the code.

---

## 🛑 Important Proprietary Notice

This repository contains my absolute personal source code and design assets. **This is NOT a template.**

### ⚠️ You MAY NOT:
* **Copy, clone, or fork** this repository to create your own portfolio.
* **Use or extract** any code, styling, SVGs, structure, or assets for personal or commercial projects.
* **Mirror or host** this site elsewhere.

### ⚖️ Legal
All content, code, and design are proprietary and strictly protected by copyright. By viewing this repository, you agree to the terms laid out in the [LICENSE](./LICENSE) and [NOTICE](./NOTICE) files. Any unauthorized use or derivative works without explicit written permission from the author will result in necessary action. 

If you wish to study the code or discuss technical details, you are warmly invited to look through it here on GitHub, but **please respect the intellectual property**.

---

## 🛠️ Technology Stack

This portfolio avoids heavy frameworks in favor of absolute control over performance and DOM animations, utilizing a custom static build engine.

| Category | Technology |
| :--- | :--- |
| **Core** | HTML5, CSS3 (Vars, Grid, Flexbox), Vanilla JavaScript (ES6+) |
| **Animations** | [GSAP](https://gsap.com/) & ScrollTrigger, Native CSS Transitions |
| **3D Rendering** | [Three.js](https://threejs.org/) (Model integration) |
| **Build Engine** | Custom `Node.js` scripts, `marked` (Markdown compiler) |
| **Minification** | `clean-css`, `terser` |

---

## ⚙️ Local Development & Build Process

The project uses a custom Node.js script to compile Markdown files into fully rendered HTML pages, injecting them into dynamic templates while minifying CSS and JS assets.

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Running
1. Clone the repository *(for authorized/development purposes only)*.
2. Install the necessary build dependencies:
   ```bash
   npm install
   ```
3. Run the Custom Build Script:
   ```bash
   node scripts/build.js
   ```
   > *This script will read `data/blog.json` and `data/projects.json`, parse the corresponding `.md` files, compile them into HTML using `scripts/blog-template.html` and `scripts/project-template.html`, output them to the `posts/` and `projects/` directories, and finally minify all `.css` and `.js` files.*

4. Use a local server (like VS Code Live Server or `npx serve`) to run the site from the root directory.

---

## 📫 Contact

Created by **Mosa "S.U.D.O" Moleleki**

* **Email:** Molelekishoez@gmail.com
* **GitHub:** [@Mr-S-U-D-O](https://github.com/Mr-S-U-D-O)

*Thank you for visiting! Don't forget to click the ⭐ button if you enjoy the codebase aesthetics!*
