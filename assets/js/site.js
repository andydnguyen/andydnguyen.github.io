/* =========================================================================
   Andy Nguyen · Portfolio interactions
   ========================================================================= */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ----- Footer year -------------------------------------------------- */
    var yearEl = document.getElementById("year");
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    /* ----- Nav: solid-on-scroll + scroll progress ----------------------- */
    var nav = document.getElementById("nav");
    var progressBar = document.getElementById("progressBar");

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (nav) { nav.classList.toggle("scrolled", y > 24); }

        if (progressBar) {
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docH > 0 ? (y / docH) * 100 : 0;
            progressBar.style.width = pct + "%";
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ----- Mobile menu -------------------------------------------------- */
    var toggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    function setMenu(open) {
        if (!nav || !toggle) { return; }
        nav.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    }
    if (toggle) {
        toggle.addEventListener("click", function () {
            setMenu(!nav.classList.contains("menu-open"));
        });
    }
    if (navLinks) {
        navLinks.addEventListener("click", function (e) {
            if (e.target.closest("a")) { setMenu(false); }
        });
    }
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { setMenu(false); }
    });

    /* ----- Scroll-spy: highlight active nav link ------------------------ */
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id], header[id]"));
    var linkFor = {};
    document.querySelectorAll(".nav__links a[href^='#']").forEach(function (a) {
        linkFor[a.getAttribute("href").slice(1)] = a;
    });

    if ("IntersectionObserver" in window && sections.length) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    Object.keys(linkFor).forEach(function (key) {
                        linkFor[key].classList.toggle("is-active", key === id);
                    });
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ----- Reveal on scroll --------------------------------------------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    if (prefersReduced || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var reveal = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var siblings = Array.prototype.slice.call(el.parentElement.querySelectorAll(":scope > [data-reveal]"));
                    var idx = siblings.indexOf(el);
                    el.style.transitionDelay = (idx > 0 ? Math.min(idx, 6) * 90 : 0) + "ms";
                    el.classList.add("is-visible");
                    obs.unobserve(el);
                }
            });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
        revealEls.forEach(function (el) { reveal.observe(el); });
    }

    /* ----- Hero interactive glow (desktop, pointer) --------------------- */
    var hero = document.getElementById("home");
    if (hero && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
        var glow = document.createElement("div");
        glow.className = "hero__cursor";
        glow.setAttribute("aria-hidden", "true");
        hero.appendChild(glow);
        var raf = null, mx = 0, my = 0;
        hero.addEventListener("pointermove", function (e) {
            var r = hero.getBoundingClientRect();
            mx = e.clientX - r.left;
            my = e.clientY - r.top;
            if (!raf) {
                raf = requestAnimationFrame(function () {
                    glow.style.transform = "translate(" + mx + "px," + my + "px)";
                    glow.style.opacity = "1";
                    raf = null;
                });
            }
        });
        hero.addEventListener("pointerleave", function () { glow.style.opacity = "0"; });
    }

    /* ----- Contact form: AJAX submit to Formspree ----------------------- */
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("submitBtn");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (status) { status.className = "form-status"; status.textContent = ""; }
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            }).then(function (res) {
                if (res.ok) {
                    form.reset();
                    if (status) { status.className = "form-status is-ok"; status.textContent = "Thanks! Your message is on its way."; }
                } else {
                    return res.json().then(function (data) {
                        var msg = (data && data.errors) ? data.errors.map(function (x) { return x.message; }).join(", ") : "Something went wrong. Please try again.";
                        throw new Error(msg);
                    });
                }
            }).catch(function (err) {
                if (status) { status.className = "form-status is-err"; status.textContent = err.message || "Network error. Please email me directly."; }
            }).finally(function () {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send it over"; }
            });
        });
    }
})();
