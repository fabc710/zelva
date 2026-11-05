/* =====================================================================
   ZELVA INSURANCE AGENCY CORP — Interacciones del sitio
   - Idioma ES / EN (se recuerda en el navegador)
   - Menú de Seguros, menú móvil, pestañas, subnavegación
   - Filtros de recursos, formulario de cotización, animaciones
   ===================================================================== */
(function () {
  "use strict";

  var d = document;
  var root = d.documentElement;
  var LANG_KEY = "zelva-lang";

  /* ---------- Idioma ------------------------------------------------- */
  var ATTRS = ["placeholder", "aria-label", "title", "alt", "content"];

  function currentLang() { return root.getAttribute("data-lang") === "en" ? "en" : "es"; }

  function applyLang(lang) {
    // Textos simples: <el data-en="English">Español</el>
    d.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-es")) el.setAttribute("data-es", el.textContent);
      el.textContent = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-es");
    });
    // Atributos: data-en-placeholder, data-en-aria-label, etc.
    ATTRS.forEach(function (attr) {
      d.querySelectorAll("[data-en-" + attr + "]").forEach(function (el) {
        var esKey = "data-es-" + attr;
        if (!el.hasAttribute(esKey)) el.setAttribute(esKey, el.getAttribute(attr) || "");
        el.setAttribute(attr, lang === "en" ? el.getAttribute("data-en-" + attr) : el.getAttribute(esKey));
      });
    });
    d.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
    });
    d.querySelectorAll("input[name='idioma_sitio']").forEach(function (input) {
      input.value = lang === "en" ? "English" : "Español";
    });
  }

  function setLang(lang, persist) {
    lang = lang === "en" ? "en" : "es";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    applyLang(lang);
    if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* sin almacenamiento */ } }
  }

  d.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-lang]");
    if (!btn) return;
    setLang(btn.getAttribute("data-set-lang"), true);
  });
  setLang(currentLang(), false);

  function t(es, en) { return currentLang() === "en" ? en : es; }

  /* ---------- Encabezado con sombra al hacer scroll ------------------- */
  var header = d.querySelector(".site-header");
  var mobileCta = d.querySelector(".mobile-cta");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (mobileCta) mobileCta.classList.toggle("is-visible", y > 420);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mega menú de Seguros ----------------------------------- */
  d.querySelectorAll(".nav__item--mega").forEach(function (item) {
    var trigger = item.querySelector(".nav__trigger");
    var closeTimer;
    function open() {
      clearTimeout(closeTimer);
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }
    trigger.addEventListener("click", function () {
      item.classList.contains("is-open") ? close() : open();
    });
    item.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) open(); });
    item.addEventListener("mouseleave", function () {
      if (window.matchMedia("(hover: hover)").matches) closeTimer = setTimeout(close, 160);
    });
    item.addEventListener("focusout", function (e) { if (!item.contains(e.relatedTarget)) close(); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("is-open")) { close(); trigger.focus(); }
    });
    d.addEventListener("click", function (e) { if (!item.contains(e.target)) close(); });
  });

  /* ---------- Menú móvil -------------------------------------------- */
  var drawer = d.getElementById("drawer");
  var toggle = d.querySelector(".nav-toggle");
  if (drawer && toggle) {
    var panel = drawer.querySelector(".drawer__panel");
    var lastFocus = null;
    drawer.setAttribute("inert", "");
    function openDrawer() {
      lastFocus = d.activeElement;
      drawer.removeAttribute("inert");
      drawer.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      d.body.style.overflow = "hidden";
      setTimeout(function () { var c = drawer.querySelector(".drawer__close"); if (c) c.focus(); }, 60);
    }
    function closeDrawer() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("inert", "");
      toggle.setAttribute("aria-expanded", "false");
      d.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    toggle.addEventListener("click", openDrawer);
    drawer.querySelectorAll("[data-close-drawer]").forEach(function (el) { el.addEventListener("click", closeDrawer); });
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
    d.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") closeDrawer();
      if (e.key === "Tab") {
        var f = panel.querySelectorAll("a, button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    drawer.querySelectorAll(".drawer__acc").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = d.getElementById(btn.getAttribute("aria-controls"));
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (sub) sub.hidden = isOpen;
      });
    });
  }

  /* ---------- Pestañas de seguros ------------------------------------ */
  d.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll("[role='tab']"));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var p = d.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      if (window.matchMedia("(max-width: 980px)").matches) {
        tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* ---------- Subnavegación activa (página Seguros) ------------------ */
  var subLinks = d.querySelectorAll(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = map[en.target.id];
        if (link) {
          link.classList.add("is-active");
          var list = link.parentElement.parentElement;
          list.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Filtros de recursos ------------------------------------ */
  var filters = d.querySelectorAll("[data-filter]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      d.querySelectorAll("[data-cat]").forEach(function (card) {
        card.classList.toggle("is-filtered-out", cat !== "all" && card.getAttribute("data-cat") !== cat);
      });
    });
  });

  /* ---------- Formulario de cotización ------------------------------- */
  var form = d.getElementById("quote-form");
  if (form) {
    // Preseleccionar el seguro desde la URL: contacto.html?seguro=auto
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("seguro");
    var select = form.querySelector("#seguro");
    if (preset && select) {
      var opt = select.querySelector("option[data-key='" + preset + "']");
      if (opt) opt.selected = true;
    }
    // Volver a esta web después del envío (funciona en cualquier dominio)
    var next = form.querySelector("input[name='_next']");
    if (next && /^https?:/.test(window.location.protocol)) {
      next.value = new URL("gracias.html", window.location.href).href;
    }

    var msg = d.getElementById("form-msg");
    var submit = form.querySelector("[type='submit']");
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : t("Escribe tu nombre completo.", "Please enter your full name."); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : t("Escribe un correo electrónico válido.", "Please enter a valid email address."); },
      phone: function (v) { return !v.trim() || v.replace(/\D/g, "").length >= 10 ? "" : t("Escribe un teléfono de 10 dígitos.", "Please enter a 10-digit phone number."); },
      message: function (v) { return v.trim().length >= 5 ? "" : t("Cuéntanos brevemente cómo podemos ayudarte.", "Briefly tell us how we can help."); }
    };
    function check(name) {
      var input = form.elements[name];
      if (!input) return true;
      var err = rules[name](input.value);
      var field = input.closest(".field");
      var out = d.getElementById(name + "-error");
      if (field) field.classList.toggle("has-error", !!err);
      input.setAttribute("aria-invalid", err ? "true" : "false");
      if (out) { out.textContent = err; out.hidden = !err; }
      return !err;
    }
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", function () { if (input.value) check(name); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) check(name);
      });
    });
    form.addEventListener("submit", function (e) {
      var ok = true, firstBad = null;
      Object.keys(rules).forEach(function (name) {
        if (!check(name)) { ok = false; if (!firstBad) firstBad = form.elements[name]; }
      });
      if (!ok) {
        e.preventDefault();
        if (msg) { msg.textContent = t("Revisa los campos marcados para continuar.", "Please review the highlighted fields."); msg.hidden = false; }
        if (firstBad) firstBad.focus();
        return;
      }
      if (msg) msg.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = '<i class="ri-loader-4-line spin" aria-hidden="true"></i> ' + t("Enviando…", "Sending…");
      }
    });
    // Si el usuario vuelve con el botón Atrás, reactivar el botón
    window.addEventListener("pageshow", function () {
      if (submit && submit.disabled) { submit.disabled = false; submit.innerHTML = submit.getAttribute("data-label-html") || submit.innerHTML; }
    });
    if (submit) submit.setAttribute("data-label-html", submit.innerHTML);
  }

  /* ---------- Animaciones de entrada --------------------------------- */
  var reveal = d.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Año actual en el pie ----------------------------------- */
  d.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
