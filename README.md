# 🌶️ Pink Paprikaa – Static Website

A responsive, multi-page restaurant website built with **Tailwind CSS v4**, showcasing premium Indian, Chinese, and Continental cuisines.
This project uses the **Tailwind CLI** for fast development and a lightweight production build — no frameworks, no dependencies beyond Node.

---

## 🧱 Project Structure

```
pink-paprikaa-site/
├── src/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── gallery.html
│   ├── policies.html
│   │
│   ├── assets/
│   │   ├── images/          # All static images, favicons, and banners
│   │   ├── scripts/
│   │   │   └── main.js      # Minimal JS for interactivity
│   │   └── styles/
│   │       ├── input.css    # Tailwind source
│   │       └── output.css   # Compiled Tailwind build
│
├── .gitignore
├── .prettierrc
├── .prettierignore
├── package.json
├── package-lock.json
├── robots.txt
└── sitemap.xml
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rishavpandey43/pink-paprikaa-site.git
cd pink-paprikaa-site
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Tailwind in Watch Mode

```bash
npx @tailwindcss/cli -i ./src/assets/styles/input.css -o ./src/assets/styles/output.css --watch
```

This watches your CSS and rebuilds automatically when you make changes.

### 4️⃣ Open `src/index.html`

Just open it directly in your browser, or use a simple local server like:

```bash
npx live-server ./src
```

---

## 🚀 Production Build

To generate a minified build (ready for deployment):

```bash
npx @tailwindcss/cli -i ./src/assets/styles/input.css -o ./src/assets/styles/output.css --minify
```

Your static website is now production-ready under `/src`.

---

## 🖼️ Asset References

| Type    | Example Path                  | Example Usage                                                        |
| ------- | ----------------------------- | -------------------------------------------------------------------- |
| CSS     | `./assets/styles/output.css`  | `<link rel="stylesheet" href="./assets/styles/output.css" />`        |
| JS      | `./assets/scripts/main.js`    | `<script src="./assets/scripts/main.js" defer></script>`             |
| Image   | `./assets/images/pp_logo.png` | `<img src="./assets/images/pp_logo.png" alt="Pink Paprikaa Logo" />` |
| Favicon | `./assets/images/favicon.ico` | `<link rel="icon" href="./assets/images/favicon.ico" />`             |

---

## 🔍 SEO Files

- **robots.txt** — Controls search engine indexing.
- **sitemap.xml** — Lists all website pages for crawlers.

---

## 🧹 Formatting

Prettier ensures consistent code style.

```bash
npx prettier --write .
```

---

## 💡 Future Enhancements

- [ ] Add scroll animations (AOS or GSAP)
- [ ] Optimize images via `imagemin`
- [ ] Deploy on GitHub Pages or Netlify
- [ ] Add contact form with EmailJS or Netlify Forms

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

---

## 💖 Credits

Built with ❤️ by **[Rishav Pandey](https://rishavpandey.com/)**
→ Powered by **Tailwind CSS v4** and a passion for great food 🍽️
