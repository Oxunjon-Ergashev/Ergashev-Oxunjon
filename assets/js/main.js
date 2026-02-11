(() => {
  "use strict";

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  const yearNow = $("#yearNow");
  const lastUpdated = $("#lastUpdated");
  if (yearNow) yearNow.textContent = String(new Date().getFullYear());
  if (lastUpdated) lastUpdated.textContent = new Date().toLocaleDateString("uz-UZ", { year:"numeric", month:"long", day:"numeric" });

  const navbar = $("#navbar");
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (navbar) navbar.classList.toggle("navbar-shrink", y > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const offcanvasEl = $("#mobileMenu");
      if (offcanvasEl && offcanvasEl.classList.contains("show")) {
        const off = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (off) off.hide();
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    });
  });

  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    revealObserver.observe(el);
    // Check if element is already in viewport on page load
    if (!el.classList.contains("is-visible")) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      }
    }
  });

  const skillBlocks = $$("[data-skill]");
  const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target.querySelector(".progress-bar");
      if (bar && !bar.dataset.filled) {
        const p = bar.getAttribute("data-progress") || "0";
        bar.style.width = `${Number(p)}%`;
        bar.dataset.filled = "1";
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  skillBlocks.forEach(s => skillObserver.observe(s));

  const projectsGrid = $("#projectsGrid");
  const filterBtns = $$(".filter-btn");
  let currentFilter = "all";

  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function projectCard(p){
    const techBadges = (p.tech || []).map(t => `<span class="badge badge-soft me-1 mb-1">${escapeHtml(t)}</span>`).join("");
    const cat = escapeHtml(p.category || "all");

    return `
      <div class="col-md-6 col-lg-4 project-item" data-category="${cat}">
        <div class="card card-glass project-card h-100 p-3">
          <span class="project-glow" aria-hidden="true"></span>

          <div class="project-media mb-3">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} preview (placeholder)" loading="lazy" />
          </div>

          <div class="d-flex align-items-start justify-content-between gap-2">
            <div>
              <h3 class="h5 fw-semibold mb-1">${escapeHtml(p.title)}</h3>
              <div class="text-secondary small text-capitalize">${cat}</div>
            </div>
            <span class="badge badge-soft"><i class="bi bi-lightning-charge me-1"></i> Demo</span>
          </div>

          <p class="text-secondary mt-3 mb-3">
            ${escapeHtml(p.description)}
          </p>

          <div class="mb-3">
            ${techBadges}
          </div>

          <div class="d-flex gap-2 mt-auto">
            <a class="btn btn-outline-light btn-sm flex-fill" href="${escapeHtml(p.github || "#")}" target="_blank" rel="noopener">
              <i class="bi bi-github me-1"></i> GitHub
            </a>
            <a class="btn btn-gradient btn-sm flex-fill" href="${escapeHtml(p.demo || "#")}" target="_blank" rel="noopener">
              <i class="bi bi-box-arrow-up-right me-1"></i> Live
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderProjects(){
    if (!projectsGrid) return;
    const list = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    projectsGrid.innerHTML = list.map(projectCard).join("");
    applyFilter(currentFilter);
  }

  function applyFilter(filter){
    currentFilter = filter;

    filterBtns.forEach(b => b.classList.toggle("is-active", b.dataset.filter === filter));

    $$(".project-item", projectsGrid).forEach(item => {
      const cat = item.dataset.category || "all";
      const show = (filter === "all") || (cat === filter);
      item.style.display = show ? "" : "none";
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.filter || "all");
    });
  });

  renderProjects();

  const sections = ["about","skills","projects","experience","testimonials","contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = $$(".nav-link");
  const setActiveLink = (id) => {
    navLinks.forEach(a => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible && visible.target && visible.target.id) setActiveLink(visible.target.id);
  }, { threshold: [0.22, 0.35, 0.5, 0.7] });

  sections.forEach(s => sectionObserver.observe(s));

  const toTop = $("#toTop");
  const toggleTop = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (!toTop) return;
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", toggleTop, { passive: true });
  toggleTop();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const form = $("#contactForm");
  const toastEl = $("#successToast");
  const toast = toastEl ? new bootstrap.Toast(toastEl, { delay: 2800 }) : null;

  function isEmailValid(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#name");
      const email = $("#email");
      const message = $("#message");

      let ok = true;

      if (!name || String(name.value).trim().length < 2) {
        ok = false;
        name?.classList.add("is-invalid");
      } else name.classList.remove("is-invalid");

      if (!email || !isEmailValid(email.value)) {
        ok = false;
        email?.classList.add("is-invalid");
      } else email.classList.remove("is-invalid");

      if (!message || String(message.value).trim().length < 10) {
        ok = false;
        message?.classList.add("is-invalid");
      } else message.classList.remove("is-invalid");

      if (!ok) return;

      // fake success
      form.reset();
      name?.classList.remove("is-invalid");
      email?.classList.remove("is-invalid");
      message?.classList.remove("is-invalid");

      toast?.show();
    });

    ["input","blur"].forEach(evt => {
      form.addEventListener(evt, (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;

        if (t.id === "name") {
          t.classList.toggle("is-invalid", String(t.value).trim().length < 2);
        }
        if (t.id === "email") {
          t.classList.toggle("is-invalid", !isEmailValid(t.value));
        }
        if (t.id === "message") {
          t.classList.toggle("is-invalid", String(t.value).trim().length < 10);
        }
      }, true);
    });
  }
})();

