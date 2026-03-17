document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("page-loader");

  // Global function to hide loader
  window.hideLoader = () => {
    if (loader) {
      loader.classList.add("hidden");
    }
  };

  // If there's no 3D container (like on shop.html), hide it on window load
  if (!document.getElementById("container3D")) {
    window.addEventListener("load", window.hideLoader);
  }

  // Intercept links for smooth page transitions
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Ignore if it's an anchor, empty, opens in new tab, or is just "#"
      if (
        !href ||
        href.startsWith("#") ||
        link.getAttribute("target") === "_blank" ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      e.preventDefault();

      // Show loader
      if (loader) {
        loader.classList.remove("hidden");
      }

      // Navigate after transition completes
      setTimeout(() => {
        window.location.href = href;
      }, 500); // matches CSS opacity transition
    });
  });
});

// Fallback: hide loader after 3 seconds max, just in case
window.addEventListener("load", () => {
  setTimeout(() => {
    if (window.hideLoader) window.hideLoader();
  }, 3000);
});
