(function () {
  "use strict";

  var state = {
    config: null,
    articles: [],
    query: "",
    category: null,
  };

  var VISITOR_BADGE_URL =
    "https://hits.sh/hhotinfo.github.io/jpcf-blog.svg?style=flat-square&label=visitantes&color=6b7280";

  var contentEl = document.getElementById("content");
  var sidebarEl = document.getElementById("sidebar");
  var brandMarkEl = document.getElementById("brand-mark");
  var brandNameEl = document.getElementById("brand-name");
  var footerTextEl = document.getElementById("footer-text");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
      );
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    var months = [
      "jan", "fev", "mar", "abr", "mai", "jun",
      "jul", "ago", "set", "out", "nov", "dez",
    ];
    var y = parts[0], m = parseInt(parts[1], 10) - 1, d = parseInt(parts[2], 10);
    if (isNaN(m) || m < 0 || m > 11) return dateStr;
    return d + " de " + months[m] + ". de " + y;
  }

  function getCategories() {
    var counts = {};
    state.articles.forEach(function (a) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.keys(counts)
      .sort()
      .map(function (name) {
        return { name: name, count: counts[name] };
      });
  }

  function filteredArticles() {
    var q = state.query.trim().toLowerCase();
    return state.articles.filter(function (a) {
      var matchesCategory = !state.category || a.category === state.category;
      if (!matchesCategory) return false;
      if (!q) return true;
      var haystack = (
        a.title + " " + a.excerpt + " " + a.category
      ).toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderSidebar() {
    var categories = getCategories();
    var catItems = categories
      .map(function (c) {
        var active = state.category === c.name ? " active" : "";
        return (
          '<li><button class="' +
          active +
          '" data-category="' +
          escapeHtml(c.name) +
          '">' +
          escapeHtml(c.name) +
          ' <span class="category-count">(' +
          c.count +
          ")</span></button></li>"
        );
      })
      .join("");

    var allActive = !state.category ? " active" : "";

    sidebarEl.innerHTML =
      '<div class="sidebar-block">' +
      '<h3 class="sidebar-title">Categorias</h3>' +
      '<ul class="category-list">' +
      '<li><button class="' + allActive + '" data-category="">Todas</button></li>' +
      catItems +
      "</ul>" +
      "</div>" +
      '<div class="sidebar-block sidebar-about">' +
      '<h3 class="sidebar-title">Sobre o blog' +
      '<img class="visitor-counter" src="' + VISITOR_BADGE_URL + '" alt="contador de visitantes" />' +
      "</h3>" +
      "<p>" + escapeHtml(state.config.bio || "") + "</p>" +
      "</div>";

    sidebarEl.querySelectorAll("[data-category]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-category") || null;
        render();
      });
    });
  }

  function renderArticleList() {
    var list = filteredArticles();

    var searchBox =
      '<form class="search-box" id="search-form">' +
      '<input type="search" id="search-input" placeholder="Buscar artigos..." value="' +
      escapeHtml(state.query) +
      '" aria-label="Buscar" />' +
      '<button type="submit">Buscar</button>' +
      "</form>";

    var listHtml;
    if (list.length === 0) {
      listHtml = '<p class="empty-state">Nenhum artigo encontrado.</p>';
    } else {
      listHtml =
        '<ul class="article-list">' +
        list
          .map(function (a) {
            return (
              '<li class="article-item">' +
              "<h2><a href=\"#/artigo/" +
              encodeURIComponent(a.slug) +
              '">' +
              escapeHtml(a.title) +
              "</a></h2>" +
              '<div class="article-meta"><span class="category-tag">' +
              escapeHtml(a.category) +
              "</span> · " +
              escapeHtml(formatDate(a.date)) +
              "</div>" +
              '<p class="article-excerpt">' +
              escapeHtml(a.excerpt) +
              "</p>" +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    }

    contentEl.innerHTML = searchBox + listHtml;

    var form = document.getElementById("search-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.query = document.getElementById("search-input").value;
      render();
    });
  }

  function renderArticleDetail(slug) {
    var article = state.articles.find(function (a) {
      return a.slug === slug;
    });

    if (!article) {
      contentEl.innerHTML =
        '<a class="back-link" href="#/">&larr; Voltar</a>' +
        "<p>Artigo não encontrado.</p>";
      return;
    }

    contentEl.innerHTML =
      '<a class="back-link" href="#/">&larr; Voltar aos artigos</a>' +
      '<article class="article-full">' +
      '<div class="article-meta"><span class="category-tag">' +
      escapeHtml(article.category) +
      "</span> · " +
      escapeHtml(formatDate(article.date)) +
      "</div>" +
      "<h1>" + escapeHtml(article.title) + "</h1>" +
      '<div class="article-body">' + article.contentHtml + "</div>" +
      "</article>";

    document.title = article.title + " · " + state.config.siteTitle;
  }

  function renderAbout() {
    contentEl.innerHTML =
      '<div class="about-page">' +
      "<h1>Sobre</h1>" +
      "<p>" + escapeHtml(state.config.bio || "") + "</p>" +
      "</div>";
  }

  function render() {
    var hash = window.location.hash || "#/";
    var articleMatch = hash.match(/^#\/artigo\/(.+)$/);

    if (hash === "#/sobre") {
      renderAbout();
      sidebarEl.innerHTML = "";
    } else if (articleMatch) {
      renderArticleDetail(decodeURIComponent(articleMatch[1]));
      sidebarEl.innerHTML = "";
    } else {
      document.title = state.config.siteTitle;
      renderArticleList();
      renderSidebar();
    }
  }

  function init(config, articles) {
    state.config = config;
    state.articles = articles;

    brandMarkEl.textContent = config.siteTitle || "Blog";
    brandNameEl.textContent = config.authorName || "";
    footerTextEl.textContent = config.footerText || "©";
    document.title = config.siteTitle || "Blog";

    window.addEventListener("hashchange", render);
    render();
  }

  Promise.all([
    fetch("content/config.json").then(function (r) { return r.json(); }),
    fetch("data/articles.json").then(function (r) { return r.json(); }),
  ])
    .then(function (results) {
      init(results[0], results[1]);
    })
    .catch(function (err) {
      contentEl.innerHTML =
        "<p>Erro ao carregar o blog. Verifique se data/articles.json existe " +
        "(rode <code>npm run build</code>).</p>";
      console.error(err);
    });
})();
