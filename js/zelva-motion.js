/* =====================================================================
   ZELVA INSURANCE AGENCY CORP — Animaciones (GSAP 3.15)
   Movimiento sutil y con marca: "elegantes, pero no ostentosos".
   - Entrada de la portada: título línea por línea y diagonal dorada
   - Secciones que aparecen en secuencia al hacer scroll
   - Línea dorada del proceso que se llena con el scroll
   - Parallax leve en fotografías (solo escritorio)
   - Brillo dorado en el borde de tarjetas (solo con mouse)
   Si GSAP no carga, js/zelva.js muestra el contenido sin animación.
   Quien tenga activado "reducir movimiento" ve todo sin animaciones.
   ===================================================================== */
(function () {
  "use strict";

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var d = document;
  var root = d.documentElement;

  if (!gsap || !ST) { root.classList.remove("intro"); return; }
  gsap.registerPlugin(ST);
  if (Split) gsap.registerPlugin(Split);
  if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin);
  if (window.Flip) gsap.registerPlugin(window.Flip);
  root.classList.add("has-gsap");

  var hero = d.querySelector(".hero, .page-hero, .article-hero, .notice");
  var reveals = gsap.utils.toArray("[data-reveal]");

  /* Los textos bilingües tienen dos <span lang>: se anima solo el visible */
  function visiblePart(el) {
    var parts = el.querySelectorAll(":scope > [lang]");
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].getClientRects().length) return parts[i];
    }
    return el;
  }

  /* Divide un titular en líneas; devuelve null si no es posible */
  function splitLines(el) {
    if (!Split || !el) return null;
    var target = visiblePart(el);
    if (target !== el) target.style.display = "block";
    var split = new Split(target, { type: "lines", linesClass: "split-line" });
    var done = function () {
      split.revert();
      if (target !== el) target.style.display = "";
    };
    return { lines: split.lines, done: done };
  }

  function fontsReady(maxWait) {
    if (!d.fonts || d.fonts.status === "loaded") return Promise.resolve();
    return Promise.race([d.fonts.ready, new Promise(function (r) { setTimeout(r, maxWait); })]);
  }

  var mm = gsap.matchMedia();

  mm.add({
    motion: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 981px)",
    tall: "(min-height: 680px)",
    wideSteps: "(min-width: 821px)",
    pointer: "(hover: hover) and (pointer: fine)"
  }, function (ctx) {
    var c = ctx.conditions;

    if (!c.motion) {
      // Movimiento reducido: todo visible, sin animaciones
      root.classList.remove("intro");
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    /* ---------- 1. Entrada de la portada ---------------------------- */
    var handled = [];
    if (hero) {
      var q = function (sel) { return gsap.utils.toArray(hero.querySelectorAll(sel)); };
      q("[data-reveal]").forEach(function (el) {
        gsap.set(el, { opacity: 1, y: 0 });
        el.classList.add("is-visible");
        handled.push(el);
      });

      var first = q(".breadcrumb, .eyebrow");
      var after = q(".lead, .hero-chips, .rsearch, .rsearch__hint, .hero__actions, .page-hero__actions, .legal-meta, .article-meta, .notice__icon, .notice__actions");
      var media = q(".quote-card, .term-card, .media-frame, .article-cover, .collage__small, .collage__chip");
      var tiles = q(".quote-tile");
      var trust = q(".trust li");
      var diag = hero.querySelector(":scope > .diagonal");
      var h1 = hero.querySelector("h1");

      // Ocultar ya, antes de esperar a las fuentes, para evitar parpadeos
      gsap.set([].concat(first, after, media, tiles, trust), { opacity: 0 });
      if (h1) gsap.set(h1, { opacity: 0 });
      root.classList.remove("intro");

      fontsReady(700).then(function () {
        var tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
        if (diag) {
          tl.fromTo(diag,
            { clipPath: "polygon(100% 100%, 100% 100%, 100% 100%)" },
            { clipPath: "polygon(100% 100%, -100% 100%, 100% -100%)", duration: 1.8, ease: "power2.inOut", clearProps: "clipPath" }, 0);
        }
        var heroBg = hero.querySelector(".hero-photo__bg img");
        if (heroBg) tl.fromTo(heroBg, { scale: 1.14 }, { scale: 1, duration: 2.8, ease: "power2.out" }, 0);
        if (first.length) tl.fromTo(first, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08 }, 0.1);
        if (h1) {
          var s = splitLines(h1);
          gsap.set(h1, { opacity: 1 });
          if (s) {
            tl.fromTo(s.lines, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.05, stagger: 0.12, ease: "power4.out", onComplete: s.done }, 0.2);
          } else {
            tl.fromTo(h1, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.2);
          }
        }
        if (after.length) tl.fromTo(after, { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.55);
        if (media.length) tl.fromTo(media, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, clearProps: "transform" }, 0.45);
        if (tiles.length) tl.fromTo(tiles, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, clearProps: "transform" }, 0.8);
        if (trust.length) tl.fromTo(trust, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 1);
      });
    } else {
      root.classList.remove("intro");
    }

    /* ---------- 2. Secciones que aparecen al hacer scroll ------------ */
    var rest = reveals.filter(function (el) { return handled.indexOf(el) === -1; });
    gsap.set(rest, { opacity: 0, y: 28 });
    ST.batch(rest, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true,
          onComplete: function () { batch.forEach(function (el) { el.classList.add("is-visible"); }); }
        });
      }
    });

    /* Titulares de sección: entran línea por línea */
    gsap.utils.toArray("main .h2").forEach(function (h2) {
      if (hero && hero.contains(h2)) return;
      ST.create({
        trigger: h2,
        start: "top 88%",
        once: true,
        onEnter: function () {
          var s = splitLines(h2);
          if (!s) return;
          gsap.fromTo(s.lines, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.1, ease: "power3.out", delay: 0.1, onComplete: s.done });
        }
      });
    });

    /* ---------- 3. Proceso: la línea dorada avanza con el scroll ------- */
    gsap.utils.toArray(".steps").forEach(function (steps) {
      var nums = gsap.utils.toArray(steps.querySelectorAll(".step__num"));
      if (c.wideSteps) {
        gsap.fromTo(steps, { "--progress": 0 }, {
          "--progress": 1,
          ease: "none",
          scrollTrigger: {
            trigger: steps, start: "top 78%", end: "bottom 52%", scrub: 0.6,
            onUpdate: function (self) {
              nums.forEach(function (n, i) {
                n.classList.toggle("is-active", self.progress >= (i / (nums.length - 1)) * 0.97);
              });
            }
          }
        });
      } else {
        nums.forEach(function (n) {
          ST.create({
            trigger: n, start: "top 75%",
            onEnter: function () { n.classList.add("is-active"); },
            onLeaveBack: function () { n.classList.remove("is-active"); }
          });
        });
      }
    });

    /* ---------- 4. Parallax leve en fotografías (escritorio) ---------- */
    if (c.desktop) {
      gsap.utils.toArray(".media-frame__img img, .collage__small img").forEach(function (img) {
        gsap.fromTo(img, { yPercent: -4, scale: 1.1 }, {
          yPercent: 4, scale: 1.1, ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    }

    /* ---------- 5. La hoja dorada se dibuja con el scroll (Nosotros) -- */
    var leaf = d.querySelector(".leaf-art");
    if (leaf && window.DrawSVGPlugin) {
      var line = leaf.querySelector(".leaf-art__line");
      var fill = leaf.querySelector(".leaf-art__fill");
      gsap.timeline({ scrollTrigger: { trigger: leaf, start: "top 82%", end: "bottom 45%", scrub: 0.8 } })
        .fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", duration: 1 })
        .fromTo(fill, { opacity: 0, scale: 0.92, transformOrigin: "20% 100%" }, { opacity: 1, scale: 1, ease: "power1.out", duration: 0.45 }, 0.75);
    }

    /* ---------- Contacto: fondo con parallax y línea de pasos ---------- */
    var contactBg = d.querySelector(".hero-photo__bg img");
    if (contactBg && c.desktop) {
      gsap.to(contactBg, { yPercent: 8, ease: "none", scrollTrigger: { trigger: contactBg.closest("section"), start: "top top", end: "bottom top", scrub: true } });
    }
    gsap.utils.toArray(".next-card .next-steps").forEach(function (list) {
      gsap.fromTo(list, { "--line": 0 }, { "--line": 1, ease: "none", scrollTrigger: { trigger: list, start: "top 82%", end: "bottom 60%", scrub: 0.6 } });
    });

    /* ---------- Nosotros: cada rasgo se ubica en su punto justo ------- */
    gsap.utils.toArray(".spectrum__row").forEach(function (row, i) {
      var target = parseFloat(row.style.getPropertyValue("--k")) || 0.3;
      gsap.fromTo(row, { "--k": 0.5 }, {
        "--k": target, duration: 1.3, ease: "power3.out", delay: i * 0.08,
        scrollTrigger: { trigger: row, start: "top 90%", once: true }
      });
    });

    /* ---------- 6. Etapas de la vida: scroll horizontal fijado -------- */
    var cleanups = [];
    var stagesEl = d.querySelector("[data-stages]");
    if (stagesEl && c.desktop && c.tall) {
      var track = stagesEl.querySelector(".stages__track");
      var viewport = stagesEl.querySelector(".stages__viewport");
      var siteHeader = d.querySelector(".site-header");
      stagesEl.classList.add("is-pinned");
      var distance = function () { return Math.max(0, track.scrollWidth - viewport.clientWidth); };
      var pinTween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: "none",
        scrollTrigger: {
          trigger: stagesEl,
          pin: true,
          start: function () { return "top " + (siteHeader ? siteHeader.offsetHeight : 0) + "px"; },
          end: function () { return "+=" + distance(); },
          scrub: 0.6,
          invalidateOnRefresh: true,
          refreshPriority: 1, // se calcula antes que las animaciones de más abajo
          onUpdate: function (self) { if (window.zelvaStagesUpdate) window.zelvaStagesUpdate(stagesEl, self.progress, self.progress * distance()); }
        }
      });
      stagesEl.zelvaTrigger = pinTween.scrollTrigger;
      ST.sort();
      cleanups.push(function () { stagesEl.classList.remove("is-pinned"); stagesEl.zelvaTrigger = null; });
    }

    /* ---------- 7. Brillo dorado que sigue al cursor (mouse) ---------- */
    if (c.pointer) {
      var glowEls = d.querySelectorAll(".quote-tile, .card, .post-card");
      glowEls.forEach(function (el) { el.classList.add("glow"); });
      var onMove = function (e) {
        var el = e.target.closest && e.target.closest(".glow");
        if (!el) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      };
      d.addEventListener("pointermove", onMove, { passive: true });
      var magnets = gsap.utils.toArray(".btn--magnetic").map(function (btn) {
        var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
        var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
        var move = function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        };
        var leave = function () { xTo(0); yTo(0); };
        btn.addEventListener("pointermove", move);
        btn.addEventListener("pointerleave", leave);
        return function () { btn.removeEventListener("pointermove", move); btn.removeEventListener("pointerleave", leave); gsap.set(btn, { x: 0, y: 0 }); };
      });
      cleanups.push(function () { magnets.forEach(function (fn) { fn(); }); });
      cleanups.push(function () {
        d.removeEventListener("pointermove", onMove);
        glowEls.forEach(function (el) { el.classList.remove("glow"); });
      });
    }
    return function () { cleanups.forEach(function (fn) { fn(); }); };
  });

  /* Recalcular posiciones cuando cambia la altura de la página */
  var refresh = function () { requestAnimationFrame(function () { ST.refresh(); }); };
  d.addEventListener("zelva:lang", refresh);
  d.addEventListener("toggle", refresh, true);
  d.addEventListener("click", function (e) {
    if (e.target.closest("[role='tab'], [data-filter]")) refresh();
  });
  window.addEventListener("load", refresh);
})();
