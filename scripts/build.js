#!/usr/bin/env node
/**
 * Lê todos os arquivos .md em content/articles/, extrai o cabeçalho (frontmatter)
 * e converte o corpo Markdown em HTML, gerando data/articles.json.
 *
 * Uso: node scripts/build.js
 */
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const OUT_FILE = path.join(ROOT, "data", "articles.json");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw };
  }
  const [, frontmatterBlock, body] = match;
  const meta = {};
  frontmatterBlock.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) meta[key] = value;
  });
  return { meta, body };
}

function slugify(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`Pasta não encontrada: ${ARTICLES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"));

  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);

    const title = meta.title || file.replace(/\.md$/i, "");
    const slug = meta.slug ? slugify(meta.slug) : slugify(title);
    const date = meta.date || "";
    const category = meta.category || "Geral";
    const excerpt = meta.excerpt || body.trim().slice(0, 180).replace(/\n/g, " ");
    const contentHtml = marked.parse(body.trim());

    return { slug, title, date, category, excerpt, contentHtml, sourceFile: file };
  });

  // ordena por data decrescente (mais recentes primeiro); sem data vai pro fim
  articles.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  // checa slugs duplicados
  const seen = new Set();
  for (const a of articles) {
    if (seen.has(a.slug)) {
      console.warn(
        `Aviso: slug duplicado "${a.slug}" (arquivo ${a.sourceFile}). Verifique o campo "slug" ou "title".`
      );
    }
    seen.add(a.slug);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(articles, null, 2), "utf8");
  console.log(`OK: ${articles.length} artigo(s) escrito(s) em ${path.relative(ROOT, OUT_FILE)}`);
}

main();
