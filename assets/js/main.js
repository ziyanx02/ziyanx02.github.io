(() => {
  const $ = (sel) => document.querySelector(sel);

  // Background photo list (replace with your own).
  // Tip: Use images with at least 1920px width for best quality.
  const backgroundPhotos = [
    "url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2400&q=80')",
    "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80')",
    "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=80')",
    "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=80')",
  ];

  const prevBtn = $("#bgPrev");
  const nextBtn = $("#bgNext");

  const STORAGE_KEY = "academic_homepage_bg_idx";
  let bgIdx = 0;

  const loadIdx = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const v = raw == null ? 0 : Number(raw);
      if (Number.isFinite(v)) return ((v % backgroundPhotos.length) + backgroundPhotos.length) % backgroundPhotos.length;
      return 0;
    } catch {
      return 0;
    }
  };

  const saveIdx = (idx) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(idx));
    } catch {
      // ignore
    }
  };

  const setBackground = (idx) => {
    const safeIdx = ((idx % backgroundPhotos.length) + backgroundPhotos.length) % backgroundPhotos.length;
    bgIdx = safeIdx;
    document.documentElement.style.setProperty("--bg-url", backgroundPhotos[safeIdx]);
    saveIdx(safeIdx);
  };

  const stepBackground = (delta) => setBackground(bgIdx + delta);

  // Preload images (best-effort).
  const preload = () => {
    for (const cssUrl of backgroundPhotos) {
      const match = cssUrl.match(/url\(['"]?(.*?)['"]?\)/i);
      if (!match) continue;
      const img = new Image();
      img.src = match[1];
    }
  };

  const init = () => {
    // Year in footer.
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Hide center lane on the blank page after internship
    const centerLane = document.querySelector(".centerLane");
    const blankSection = $("#blank");
    if (centerLane && blankSection) {
      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
          (entries) => {
            // Only hide while the blank page is (almost) fully visible.
            const e = entries[0];
            const fullyVisible = (e && (e.intersectionRatio || 0) >= 0.99) || false;
            centerLane.classList.toggle("is-hidden", fullyVisible);
          },
          { root: null, threshold: [0, 0.99] }
        );
        obs.observe(blankSection);
      } else {
        // Fallback
        const onScroll = () => {
          const r = blankSection.getBoundingClientRect();
          const h = window.innerHeight || 1;
          const topbar = document.querySelector(".topbar");
          const topbarH = topbar ? topbar.getBoundingClientRect().height : 0;
          const eps = 2;
          // Fully visible when it sits under the topbar and reaches the bottom of viewport.
          const fullyVisible = r.top >= topbarH - eps && r.bottom <= h + eps;
          centerLane.classList.toggle("is-hidden", fullyVisible);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
      }
    }

    // Publication filter: Selected | All
    const pubSelectedBtn = $("#pubFilterSelected");
    const pubAllBtn = $("#pubFilterAll");
    const pubItems = Array.from(document.querySelectorAll("#publications .list__item"));

    const setPubFilter = (mode) => {
      const isSelected = mode === "selected";

      if (pubSelectedBtn) {
        pubSelectedBtn.classList.toggle("is-active", isSelected);
        pubSelectedBtn.setAttribute("aria-pressed", String(isSelected));
      }
      if (pubAllBtn) {
        pubAllBtn.classList.toggle("is-active", !isSelected);
        pubAllBtn.setAttribute("aria-pressed", String(!isSelected));
      }

      for (const li of pubItems) {
        const selected = (li.getAttribute("data-selected") || "").toLowerCase() === "true";
        li.style.display = isSelected && !selected ? "none" : "";
      }
    };

    if (pubSelectedBtn) pubSelectedBtn.addEventListener("click", () => setPubFilter("selected"));
    if (pubAllBtn) pubAllBtn.addEventListener("click", () => setPubFilter("all"));

    // Default: all
    setPubFilter("all");

    // Background setup.
    if (backgroundPhotos.length > 0) {
      bgIdx = loadIdx();
      setBackground(bgIdx);
      preload();
    }

    // Click zones.
    if (prevBtn) prevBtn.addEventListener("click", () => stepBackground(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => stepBackground(1));

    // Keyboard support.
    window.addEventListener("keydown", (e) => {
      // Don't hijack typing in inputs.
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft") stepBackground(-1);
      if (e.key === "ArrowRight") stepBackground(1);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

