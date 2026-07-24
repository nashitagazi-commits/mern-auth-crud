@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-canvas text-ink font-body;
  min-height: 100vh;
}

::selection {
  background: rgba(108, 92, 231, 0.18);
}

.focus-ring:focus-visible {
  outline: 2px solid #6C5CE7;
  outline-offset: 2px;
}

/* Soft ambient blobs used behind auth screens and the dashboard header */
.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}

/* Gentle lift on interactive cards */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(108, 92, 231, 0.14);
}

/* Shimmering skeleton for loading states */
.shimmer-bg {
  background: linear-gradient(90deg, #F1EFFA 25%, #EAE6FB 37%, #F1EFFA 63%);
  background-size: 400% 100%;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
