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
    d.dispatchEvent(new CustomEvent("zelva:lang", { detail: { lang: lang } }));
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

  /* ---------- Historia por capítulos (Nosotros) ---------------------- */
  d.querySelectorAll("[data-chapters]").forEach(function (wrap) {
    var chapters = wrap.querySelectorAll("[data-chapter]");
    var visuals = wrap.querySelectorAll("[data-visual]");
    var dots = wrap.querySelectorAll(".chapters__dots li");
    function activate(i) {
      [chapters, visuals, dots].forEach(function (list) {
        list.forEach(function (el, j) { el.classList.toggle("is-active", j === i); });
      });
    }
    if (!("IntersectionObserver" in window)) return;
    var spyChapters = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) activate(Number(en.target.getAttribute("data-chapter")));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    chapters.forEach(function (c) { spyChapters.observe(c); });
  });

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Recursos: búsqueda + filtro por tema ------------------- */
  var searchItems = d.querySelectorAll("[data-search]");
  if (searchItems.length) {
    var filters = d.querySelectorAll("[data-filter]");
    var searchInput = d.getElementById("rsearch");
    var state = { cat: "all", q: "" };
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    // El texto incluye ambos idiomas: se puede buscar en español o en inglés
    var index = Array.prototype.map.call(searchItems, function (el) { return norm(el.textContent); });

    var applyFilters = function () {
      var Flip = window.Flip;
      var flipState = Flip && window.gsap && !reduceMotion ? Flip.getState(searchItems) : null;
      var shown = { guide: 0, term: 0 };
      searchItems.forEach(function (el, i) {
        var kind = el.getAttribute("data-kind");
        var okQ = !state.q || index[i].indexOf(state.q) !== -1;
        var okCat = kind !== "guide" || state.cat === "all" || el.getAttribute("data-cat") === state.cat;
        var show = okQ && okCat;
        el.classList.toggle("is-filtered-out", !show);
        if (show) shown[kind] = (shown[kind] || 0) + 1;
        if (show && state.q && kind === "term") el.open = true;
      });
      d.querySelectorAll("[data-empty]").forEach(function (msg) { msg.hidden = shown[msg.getAttribute("data-empty")] > 0; });
      if (flipState) {
        window.Flip.from(flipState, {
          duration: 0.55, ease: "power2.inOut", absolute: true, nested: true,
          onEnter: function (els) { return window.gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }); },
          onLeave: function (els) { return window.gsap.to(els, { opacity: 0, duration: 0.25 }); }
        });
      }
    };

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.cat = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        applyFilters();
      });
    });
    if (searchInput) {
      var timer;
      searchInput.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () { state.q = norm(searchInput.value.trim()); applyFilters(); }, 140);
      });
      searchInput.form.addEventListener("submit", function (e) {
        e.preventDefault();
        state.q = norm(searchInput.value.trim());
        applyFilters();
        var target = d.getElementById("guias");
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ---------- Recursos: término del día ------------------------------ */
  d.querySelectorAll("[data-term-rotator]").forEach(function (card) {
    var items = card.querySelectorAll(".term-card__item");
    var dots = card.querySelectorAll(".term-card__dots button");
    var current = 0, timer = null;
    var show = function (i) {
      current = (i + items.length) % items.length;
      items.forEach(function (el, j) { el.classList.toggle("is-active", j === current); });
      dots.forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === current)); });
    };
    var start = function () { if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, 5500); };
    var stop = function () { clearInterval(timer); };
    dots.forEach(function (b, j) { b.addEventListener("click", function () { stop(); show(j); start(); }); });
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focusin", stop);
    start();
  });

  /* ---------- Recursos: etapas de la vida -------------------------- */
  // Actualiza el contador y la barra; también la usa js/zelva-motion.js
  window.zelvaStagesUpdate = function (section, p, offset) {
    var cards = section.querySelectorAll(".stage");
    var n = cards.length;
    var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    // Tarjeta que se ve a la izquierda; al final del recorrido, la última
    var idx = p > 0.97 ? n - 1 : Math.min(n - 1, Math.round((offset || 0) / step));
    var cur = section.querySelector("[data-stage-current]");
    var bar = section.querySelector("[data-stage-bar]");
    if (cur) cur.textContent = (idx < 9 ? "0" : "") + (idx + 1);
    if (bar) bar.style.transform = "scaleX(" + Math.max(1 / n, p) + ")";
  };
  d.querySelectorAll("[data-stages]").forEach(function (section) {
    var vp = section.querySelector(".stages__viewport");
    var n = section.querySelectorAll(".stage").length;
    vp.addEventListener("scroll", function () {
      if (section.classList.contains("is-pinned")) return;
      var max = vp.scrollWidth - vp.clientWidth;
      window.zelvaStagesUpdate(section, max > 0 ? vp.scrollLeft / max : 0, vp.scrollLeft);
    }, { passive: true });
    section.querySelectorAll("[data-stage-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = Number(btn.getAttribute("data-stage-nav"));
        var st = section.zelvaTrigger;
        if (st && section.classList.contains("is-pinned")) {
          var step = (st.end - st.start) / (n - 1);
          var target = Math.round((st.scroll() - st.start) / step + dir);
          target = Math.max(0, Math.min(n - 1, target));
          window.scrollTo({ top: st.start + target * step + 2, behavior: reduceMotion ? "auto" : "smooth" });
        } else {
          var card = section.querySelector(".stage");
          vp.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: reduceMotion ? "auto" : "smooth" });
        }
      });
    });
  });

  /* ---------- Nosotros: rasgos de personalidad (lista + panel) ------- */
  d.querySelectorAll("[data-persona]").forEach(function (wrap) {
    var items = wrap.querySelectorAll(".persona__item");
    var panel = wrap.querySelector(".persona__panel");
    if (!panel || !items.length) return;
    var numEl = panel.querySelector(".persona__panel-num");
    var titleEl = panel.querySelector(".persona__panel-title");
    var descEl = panel.querySelector(".persona__panel-desc");
    var bar = panel.querySelector(".persona__progress span");
    var gsap = window.gsap;
    var current = 0, barTween = null, userTook = false, inView = false;
    wrap.classList.add("persona--js");
    var panelVisible = function () { return getComputedStyle(panel).display !== "none"; };

    var fill = function (i) {
      var it = items[i];
      numEl.textContent = it.querySelector(".persona__num").textContent;
      titleEl.innerHTML = it.querySelector(".persona__name").innerHTML;
      descEl.innerHTML = it.querySelector(".persona__desc").innerHTML;
    };
    var cycle = function () {
      if (barTween) barTween.kill();
      if (!gsap || reduceMotion || userTook || !inView || !panelVisible()) { if (bar) bar.style.transform = "scaleX(0)"; return; }
      barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 5, ease: "none", onComplete: function () { show((current + 1) % items.length); } });
    };
    var show = function (i) {
      if (i !== current) {
        current = i;
        items.forEach(function (it, j) {
          it.classList.toggle("is-active", j === i);
          it.querySelector(".persona__btn").setAttribute("aria-pressed", String(j === i));
        });
        var parts = [numEl, titleEl, descEl];
        if (gsap && !reduceMotion) {
          gsap.to(parts, { opacity: 0, y: -10, duration: 0.18, overwrite: true, onComplete: function () {
            fill(i);
            gsap.fromTo(parts, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" });
          } });
        } else {
          fill(i);
        }
      }
      cycle();
    };

    items.forEach(function (it, i) {
      var btn = it.querySelector(".persona__btn");
      btn.addEventListener("click", function () { userTook = true; show(i); });
      btn.addEventListener("focus", function () { userTook = true; show(i); });
      btn.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) { userTook = true; show(i); } });
    });
    // Pausa mientras el mouse está sobre la sección
    wrap.addEventListener("mouseenter", function () { if (barTween) barTween.pause(); });
    wrap.addEventListener("mouseleave", function () { if (barTween && !userTook) barTween.resume(); });
    // Solo avanza solo cuando la sección está a la vista
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) cycle(); else if (barTween) barTween.pause();
      }, { threshold: 0.35 }).observe(wrap);
    }
  });

  /* ---------- Formulario de cotización por pasos (Contacto) ---------- */
  var form = d.getElementById("quote-form");
  if (form) {
    // Preseleccionar el seguro desde la URL: contacto.html?seguro=auto
    var preset = new URLSearchParams(window.location.search).get("seguro");
    if (preset) {
      var presetRadio = form.querySelector("input[name='tipo_de_seguro'][data-key='" + preset + "']");
      if (presetRadio) presetRadio.checked = true;
    }
    // Volver a esta web después del envío (funciona en cualquier dominio)
    var next = form.querySelector("input[name='_next']");
    if (next && /^https?:/.test(window.location.protocol)) {
      next.value = new URL("gracias.html", window.location.href).href;
    }

    var msg = d.getElementById("form-msg");
    var submit = form.querySelector("[type='submit']");
    var steps = form.querySelectorAll(".wizard__step");
    var indicators = d.querySelectorAll(".wizard-steps li");
    var bar = d.querySelector(".wizard-bar span");
    var stepRules = { 1: ["tipo_de_seguro"], 2: ["name", "email", "phone"], 3: ["message"] };
    var current = 1;
    var rules = {
      tipo_de_seguro: function () { return form.querySelector("input[name='tipo_de_seguro']:checked") ? "" : t("Elige una opción para continuar.", "Choose an option to continue."); },
      name: function (v) { return v.trim().length >= 2 ? "" : t("Escribe tu nombre completo.", "Please enter your full name."); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : t("Escribe un correo electrónico válido.", "Please enter a valid email address."); },
      phone: function (v) { return !v.trim() || v.replace(/\D/g, "").length >= 10 ? "" : t("Escribe un teléfono de 10 dígitos.", "Please enter a 10-digit phone number."); },
      message: function (v) { return v.trim().length >= 5 ? "" : t("Cuéntanos brevemente cómo podemos ayudarte.", "Briefly tell us how we can help."); }
    };
    var fieldOf = function (name) {
      return name === "tipo_de_seguro" ? form.querySelector(".choice-grid") : form.elements[name].closest(".field");
    };
    var check = function (name) {
      var input = form.elements[name];
      var err = rules[name](input && input.value !== undefined ? input.value : "");
      var field = fieldOf(name);
      var out = d.getElementById(name === "tipo_de_seguro" ? "tipo-error" : name + "-error");
      if (field) field.classList.toggle("has-error", !!err);
      if (name !== "tipo_de_seguro") input.setAttribute("aria-invalid", err ? "true" : "false");
      if (out) { out.textContent = err; out.hidden = !err; }
      if (err && field && window.gsap && !reduceMotion) {
        window.gsap.fromTo(field, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)", clearProps: "transform" });
      }
      return !err;
    };
    var focusField = function (name) {
      var el = name === "tipo_de_seguro" ? form.querySelector("input[name='tipo_de_seguro']") : form.elements[name];
      if (el) el.focus();
    };
    var validStep = function (n) {
      var firstBad = null;
      stepRules[n].forEach(function (name) { if (!check(name) && !firstBad) firstBad = name; });
      return firstBad;
    };
    var updateSummary = function () {
      var box = form.querySelector("[data-summary]");
      var chosen = form.querySelector("input[name='tipo_de_seguro']:checked");
      var lang = form.querySelector("input[name='idioma_preferido']:checked");
      if (!box || !chosen) return;
      box.innerHTML = "";
      var box2 = chosen.nextElementSibling;
      var inLang = box2.querySelector("[lang='" + currentLang() + "']");
      [[t("Seguro", "Coverage"), (inLang || box2).textContent.trim()],
       [t("Idioma", "Language"), lang ? lang.value : ""]].forEach(function (pair) {
        var chip = d.createElement("span");
        chip.textContent = pair[0] + ": " + pair[1];
        box.appendChild(chip);
      });
      box.hidden = false;
    };
    var go = function (n, focus) {
      var prev = current;
      current = Math.max(1, Math.min(steps.length, n));
      steps.forEach(function (s) { s.classList.toggle("is-active", Number(s.getAttribute("data-step")) === current); });
      indicators.forEach(function (li, i) {
        li.classList.toggle("is-current", i + 1 === current);
        li.classList.toggle("is-done", i + 1 < current);
      });
      if (bar) bar.style.transform = "scaleX(" + current / steps.length + ")";
      if (current === steps.length) updateSummary();
      var active = form.querySelector(".wizard__step.is-active");
      if (window.gsap && !reduceMotion && prev !== current) {
        window.gsap.fromTo(active, { opacity: 0, x: current > prev ? 28 : -28 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", clearProps: "transform,opacity" });
      }
      if (focus) {
        var title = active.querySelector(".wizard__title");
        if (title) title.focus({ preventScroll: true });
        var card = d.getElementById("cotizar");
        if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    };

    if (steps.length > 1) {
      form.classList.add("wizard--js");
      form.querySelectorAll("[data-next]").forEach(function (b) {
        b.addEventListener("click", function () {
          var bad = validStep(current);
          if (bad) focusField(bad); else go(current + 1, true);
        });
      });
      form.querySelectorAll("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(current - 1, true); }); });
      // Al elegir un seguro, avanzar solo al siguiente paso
      form.querySelectorAll("input[name='tipo_de_seguro']").forEach(function (r) {
        r.addEventListener("change", function () {
          check("tipo_de_seguro");
          setTimeout(function () { if (current === 1) go(2, true); }, 350);
        });
      });
      // Enter dentro de un paso avanza en lugar de enviar
      form.addEventListener("keydown", function (e) {
        var tag = e.target.tagName;
        if (e.key !== "Enter" || tag !== "INPUT" || e.target.type === "checkbox" || current >= steps.length) return;
        e.preventDefault();
        var bad = validStep(current);
        if (bad) focusField(bad); else go(current + 1, true);
      });
      go(1, false);
    }

    ["name", "email", "phone", "message"].forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", function () { if (input.value) check(name); });
      input.addEventListener("input", function () { if (input.closest(".field").classList.contains("has-error")) check(name); });
    });

    form.addEventListener("submit", function (e) {
      for (var n = 1; n <= 3; n++) {
        var bad = validStep(n);
        if (bad) {
          e.preventDefault();
          if (steps.length > 1) go(n, false);
          if (msg) { msg.textContent = t("Revisa los campos marcados para continuar.", "Please review the highlighted fields."); msg.hidden = n !== 3; }
          focusField(bad);
          return;
        }
      }
      if (msg) msg.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = '<i class="ri-loader-4-line spin" aria-hidden="true"></i> ' + t("Enviando…", "Sending…");
      }
    });
    // Si el usuario vuelve con el botón Atrás, reactivar el botón
    if (submit) submit.setAttribute("data-label-html", submit.innerHTML);
    window.addEventListener("pageshow", function () {
      if (submit && submit.disabled) { submit.disabled = false; submit.innerHTML = submit.getAttribute("data-label-html"); }
    });
  }

  /* ---------- Copiar teléfono o correo ------------------------------- */
  d.querySelectorAll("[data-copy]").forEach(function (btn) {
    var es = btn.querySelector("[lang='es']"), en = btn.querySelector("[lang='en']"), icon = btn.querySelector("i");
    var done = function () {
      btn.classList.add("is-copied");
      if (es) es.textContent = "¡Copiado!";
      if (en) en.textContent = "Copied!";
      if (icon) icon.className = "ri-check-line";
      setTimeout(function () {
        btn.classList.remove("is-copied");
        if (es) es.textContent = "Copiar";
        if (en) en.textContent = "Copy";
        if (icon) icon.className = "ri-file-copy-line";
      }, 1800);
    };
    var fallback = function (text) {
      var ta = d.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      d.body.appendChild(ta); ta.select();
      try { if (d.execCommand("copy")) done(); } catch (err) { /* sin portapapeles */ }
      d.body.removeChild(ta);
    };
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
      else fallback(text);
    });
  });

  /* ---------- Video de fondo de la portada (inicio) ----------------- */
  var heroVideo = d.querySelector(".hero-video");
  if (heroVideo) {
    var videoBtn = d.querySelector(".hero-video__toggle");
    var conn = navigator.connection || {};
    // En celulares, con "ahorro de datos" o con "reducir movimiento" se queda la imagen fija
    var canPlay = !reduceMotion && !conn.saveData && window.matchMedia("(min-width: 768px)").matches;
    if (canPlay) {
      var userPaused = false;
      heroVideo.src = heroVideo.getAttribute("data-src");
      heroVideo.preload = "auto";
      var playVideo = function () { var pr = heroVideo.play(); if (pr && pr.catch) pr.catch(function () { /* el navegador no permitió reproducir */ }); };
      heroVideo.addEventListener("playing", function () { if (videoBtn) videoBtn.hidden = false; });
      // Solo se reproduce mientras la portada está a la vista
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { if (!userPaused) playVideo(); } else { heroVideo.pause(); }
        }, { threshold: 0.1 }).observe(heroVideo);
      } else {
        playVideo();
      }
      if (videoBtn) {
        videoBtn.addEventListener("click", function () {
          userPaused = !heroVideo.paused;
          if (userPaused) heroVideo.pause(); else playVideo();
          videoBtn.setAttribute("aria-pressed", String(userPaused));
          videoBtn.querySelector("i").className = userPaused ? "ri-play-line" : "ri-pause-line";
        });
      }
    }
  }

  /* ---------- Animaciones de entrada --------------------------------- */
  // Con GSAP disponible, js/zelva-motion.js se encarga; esto es el respaldo.
  var reveal = window.gsap && window.ScrollTrigger ? [] : d.querySelectorAll("[data-reveal]");
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
