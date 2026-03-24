// =========================================================================
// INITIALIZATION & WARNINGS
// =========================================================================
(console.log(
  "%c⚠ STOP!",
  "color: #ff4444; font-size: 2rem; font-weight: 900; text-shadow: 0 0 8px #ff4444;",
),
  console.log(
    "%cThis is a proprietary, privately-owned portfolio.\n\nAll source code, design, and assets are copyright © 2024–2026 Mosa Moleleki.\nUnauthorised copying, cloning, or reproduction is strictly prohibited.\n\nTo request permission: Molelekishoez@gmail.com\nLicense: https://github.com/Mr-S-U-D-O/personalPortfolioProject/blob/main/LICENSE",
    "color: #ffffff; font-size: 0.9rem; line-height: 1.8; background: #111; padding: 12px 16px; border-left: 4px solid #ff4444; border-radius: 4px;",
  ));
// =========================================================================
// THREE.JS IMPORTS & MODULES
// =========================================================================
import * as e from "three";
import { DRACOLoader as t } from "three-draco-loader";
import { GLTFLoader as o } from "three-gltf-loader";
import { CSS3DRenderer as n, CSS3DObject as s } from "three-css-3d-renderer";
// =========================================================================
// DOM ELEMENTS & DEVICE CONFIGURATION
// =========================================================================
const i = document.getElementById("splashScreen"),
  a = document.getElementById("quoteContainer"),
  l = document.getElementById("heroSection"),
  r = document.getElementById("laptop"),
  c = document.getElementById("laptop-screen"),
  d = document.getElementById("screen-content"),
  m =
    (window.innerWidth,
    {
      laptop: {
        file: "./models/laptop.glb",
        init: {
          position: { x: 0, y: -400, z: 0 },
          rotation: { x: Math.PI / 20, y: 0, z: 0 },
          scale: { x: 50, y: 50, z: 50 },
          targetY: -70,
        },
        lidClosedRotationX: Math.PI / 2,
        lidOpenRotationX: 0,
        hasLid: !0,
        screenCSSOffset: { x: 0, y: 0, z: 0 },
      },
      iphone: {
        file: "./models/iphone.glb",
        init: {
          position: { x: 0, y: -150, z: 0 },
          rotation: { x: 0, y: Math.PI, z: 0 },
          scale: { x: 250, y: 250, z: 250 },
          targetY: 45,
        },
        hasLid: !1,
        screenCSSOffset: { x: 0, y: -45, z: 0 },
      },
    }),
  u = {
    deviceType: "laptop",
    geometryFile: null,
    container: null,
    mesh: null,
    scene: null,
    renderer: null,
    camera: null,
  },
  h = { container: null, mesh: null, scene: null, renderer: null };
let y = null;
// =========================================================================
// AUDIO SYSTEM & SOUND EFFECTS
// =========================================================================
const p = new Audio("./audio sounds/startup sound.mp3"),
  g = new Audio("./audio sounds/initial quote appearance sound.mp3"),
  f = new Audio("./audio sounds/menu open.mp3"),
  w = new Audio("./audio sounds/button hover.mp3"),
  v = [p, g, f, w];
v.forEach((e) => {
  ((e.volume = 0), e.load());
});
const E = document.getElementById("muteToggle"),
  b = sessionStorage.getItem("isMuted");
let L = null === b || "true" === b;
const x = () => {
  if (
    (v.forEach((e) => {
      e.volume = L ? 0 : 0.2;
    }),
    E)
  ) {
    const e = E.querySelector("i");
    e &&
      (e.className = L
        ? "fa-solid fa-volume-xmark"
        : "fa-solid fa-volume-high");
  }
  (sessionStorage.setItem("isMuted", L),
    L ||
      (a &&
        a.classList.contains("show") &&
        g.paused &&
        g.play().catch((e) => console.log("Audio playback resumed:", e)),
      i &&
        "none" !== i.style.display &&
        p.paused &&
        p.play().catch((e) => console.log("Audio playback resumed:", e))));
};
(x(),
  E &&
    E.addEventListener("click", () => {
      ((L = !L), x());
    }));
const S = () => {
  ((w.currentTime = 0),
    w.play().catch((e) => console.log("Audio playback prevented:", e)));
};

// =========================================================================
// THREE.JS SCENE SETUP & RENDERING LOGIC
// =========================================================================
const I = () => ({ height: window.innerHeight, width: window.innerWidth }),
  B = (t) => {
    ("Cube008_2" === t.name
      ? (t.material.side = e.FrontSide)
      : "keyboard" === t.name &&
        (t.material = new e.MeshPhongMaterial({
          color: 1710618,
          emissive: 0,
          specular: 1118481,
          shininess: 100,
          side: e.FrontSide,
        })),
      (t.children || []).forEach((e) => B(e)));
  },
  C = () => {
    const { height: t, width: o } = I();
    ((u.container = r),
      (u.mesh = ((e) => {
        const t = e.scene,
          o = m[u.deviceType];
        (t.position.set(
          o.init.position.x,
          o.init.position.y,
          o.init.position.z,
        ),
          t.rotation.set(
            o.init.rotation.x,
            o.init.rotation.y,
            o.init.rotation.z,
          ),
          t.scale.set(o.init.scale.x, o.init.scale.y, o.init.scale.z));
        let n = null,
          s = null;
        return (
          o.hasLid
            ? (B(t),
              (n = t.children[0]),
              (s = n.children[0].children[2]),
              n.rotation.set(o.lidClosedRotationX, 0, 0))
            : ((s = t.getObjectByName("Screen")),
              !s && t.children.length > 0 && (s = t.children[0])),
          { base: t, lid: n, screen: s }
        );
      })(u.geometryFile)),
      ((t, o) => {
        const n = t.cloneNode(!0);
        t.remove();
        const i = new s(n);
        ((o.css3dObject = i), o.add(i));
        const a = new e.Box3().setFromObject(o),
          l = new e.Vector3();
        a.getSize(l);
        const r = m[u.deviceType].init.scale.x,
          c = l.x * r,
          d = (l.y > l.z ? l.y : l.z) * r;
        ((n.style.width = `${Math.floor(c)}px`),
          (n.style.height = `${Math.floor(d)}px`),
          (o.material = new e.MeshPhongMaterial({
            opacity: 0.15,
            color: new e.Color(1118481),
            blending: e.NoBlending,
          })));
        const { max: h, min: y } = o.geometry.boundingBox;
        o.geometry = new e.BoxGeometry(h.x - y.x, h.y - y.y, h.z - y.z + 0.2);
        const p = n.querySelector(".skeleton-loader");
        p && (p.id = "skeletonLoaderClone");
      })(d, u.mesh.screen),
      (u.scene = new e.Scene()),
      (u.renderer = new e.WebGLRenderer({ alpha: !0, antialias: !0 })),
      u.renderer.setPixelRatio(window.devicePixelRatio),
      u.renderer.setSize(o, t),
      r.appendChild(u.renderer.domElement),
      (u.camera = new e.PerspectiveCamera(70, o / t, 1, 1e3)),
      u.camera.position.set(0, 0, o < 768 ? 1100 : 750));
    const i = new e.PointLight(16777215, 3.5, 0, 0);
    i.position.set(0, 700, 750);
    const a = new e.PointLight(16777215, 0.05, 0, 0);
    (a.position.set(-300, 100, 100),
      u.scene.add(i, a, u.mesh.base),
      (h.container = c),
      (h.mesh = u.mesh.screen.css3dObject),
      (h.scene = new e.Scene()),
      (h.renderer = new n()),
      h.renderer.setSize(o, t),
      (h.renderer.domElement.style.position = "absolute"),
      (h.renderer.domElement.style.top = 0),
      c.appendChild(h.renderer.domElement),
      h.scene.add(h.mesh));
  },
  M = (t) => {
    y || (y = t);
    const o = t - y,
      n = Math.max(0, o - 300),
      s = Math.min(1, n / 5e3),
      d = Math.min(1, s / 0.15),
      p = ((f = d), 1 - Math.pow(1 - f, 3));
    var f;
    const w = m[u.deviceType].init.position.y,
      v = m[u.deviceType].init.targetY;
    u.mesh.base.position.y = w + (v - w) * p;
    let E = 0;
    s > 0.15 && (E = Math.max(0, Math.min(1, (s - 0.15) / 0.2)));
    const b = ((e) => (e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2))(
        E,
      ),
      L = m[u.deviceType];
    L.hasLid &&
      u.mesh.lid &&
      (u.mesh.lid.rotation.x =
        L.lidClosedRotationX - (L.lidClosedRotationX - L.lidOpenRotationX) * b);
    let x = 0;
    s > 0.6 && (x = Math.max(0, Math.min(1, (s - 0.6) / 0.4)));
    const S = ((e) => (0 === e ? 0 : Math.pow(2, 10 * e - 10)))(x),
      I = window.innerWidth < 768 ? 1100 : 750,
      B = I - I * S;
    if (
      ((u.camera.position.z = B),
      u.renderer.render(u.scene, u.camera),
      h.renderer.render(h.scene, u.camera),
      (() => {
        const t = new e.Vector3(),
          o = new e.Quaternion();
        (u.mesh.screen.matrixWorld.decompose(t, o, new e.Vector3()),
          h.mesh.position.copy(t),
          h.mesh.quaternion.copy(o));
        const n = m[u.deviceType];
        (n.hasLid &&
          h.mesh.rotateOnAxis(new e.Vector3(1, 0, 0), (Math.PI / 2) * -1),
          n.screenCSSOffset &&
            (h.mesh.translateX(n.screenCSSOffset.x),
            h.mesh.translateY(n.screenCSSOffset.y),
            h.mesh.translateZ(n.screenCSSOffset.z)));
      })(),
      s < 1)
    )
      requestAnimationFrame(M);
    else {
      const e = document.getElementById("skeletonLoaderClone");
      (e && e.classList.add("active"),
        setTimeout(() => {
          (e && e.classList.add("fade-out"),
            setTimeout(() => {
              ((r.style.display = "none"),
                (c.style.display = "none"),
                a.classList.add("show"),
                g
                  .play()
                  .catch((e) => console.log("Audio playback prevented:", e)),
                setTimeout(() => {
                  (a.classList.add("zoom-into"),
                    setTimeout(() => {
                      (l.classList.add("show"),
                        document
                          .getElementById("globalUi")
                          ?.classList.add("show"),
                        (document.documentElement.style.overflowY = "auto"),
                        (document.documentElement.style.overflowX = "hidden"),
                        (document.body.style.overflowY = "auto"),
                        (document.body.style.overflowX = "hidden"),
                        (document.documentElement.style.height = "auto"),
                        (document.body.style.height = "auto"),
                        // Force initial calculation of scroll-based animations
                        refreshScrollAnims(),
                        setTimeout(() => {
                          i.style.display = "none";
                        }, 500));
                    }, 600)); // Added a bit more for zoom-into transition
                }, 3000)); // INCREASED FROM 2000 TO 6000 FOR BETTER READABILITY
            }, 800));
        }, 2500));
    }
  };
let k = !1;
// =========================================================================
// INTRO ANIMATION & INITIALIZATION ROUTINE
// =========================================================================
const z = () => {
  if (k) return;
  k = !0;

  // 1. Determine if we are on the homepage
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html");
  if (!isHomePage) {
    // If not on homepage, just show content and skip splash logic
    if (i) i.style.display = "none";
    if (l) l.classList.add("show");
    document.getElementById("globalUi")?.classList.add("show");
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    return;
  }

  // 2. Logic to decide whether to show animation or skip it
  const shouldSkipAnimation = (() => {
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : "";

    // Fallback for older browsers or inconsistent performance API
    const isReload =
      navType === "reload" ||
      (window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 1);
    const isBackForward =
      navType === "back_forward" ||
      (window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 2);

    const introPlayed = sessionStorage.getItem("introPlayed") === "true";
    const hasHash = !!window.location.hash;

    // Skip cases:
    if (isBackForward) return true;
    if (isReload && hasHash) return true;
    if (introPlayed && !isReload) return true;

    return false;
  })();

  if (shouldSkipAnimation) {
    if (r) r.style.display = "none";
    if (c) c.style.display = "none";
    if (a) a.style.display = "none";
    if (i) i.style.display = "none";
    if (l) l.classList.add("show");
    document.getElementById("globalUi")?.classList.add("show");
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";

    // If there's a hash, scroll to it immediately
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        target?.scrollIntoView();
        // Trigger animations once scroll position is restored
        refreshScrollAnims();
      }, 100);
    } else {
        // Even without hash, trigger animations once for restored scroll position
        refreshScrollAnims();
    }
  } else {
    // Show splash screen and start animation
    sessionStorage.setItem("introPlayed", "true");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      (async () => {
        const gltfLoader = new o();
        const dracoLoader = new t();
        dracoLoader.setDecoderPath(
          "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
        );
        gltfLoader.setDRACOLoader(dracoLoader);
        u.deviceType = window.innerWidth < 768 ? "iphone" : "laptop";
        const deviceConfig = m[u.deviceType];
        u.geometryFile = await gltfLoader.loadAsync(deviceConfig.file);
      })().then(() => {
        C();
        if (!L)
          p.play().catch((e) => console.log("Audio playback prevented:", e));
        requestAnimationFrame(M);
      });
    }, 300);
  }
};
// =========================================================================
// GLOBAL EVENT LISTENERS & RESIZE HANDLING
// =========================================================================
(document.addEventListener("readystatechange", (e) => {
  "complete" === e.target.readyState && z();
}),
  "complete" === document.readyState && z(),
  window.addEventListener("resize", () => {
    if (u.renderer) {
      const { height: e, width: t } = I();
      ((u.camera.aspect = t / e),
        l.classList.contains("show") ||
          u.camera.position.setZ(t < 768 ? 1100 : 750),
        u.camera.updateProjectionMatrix(),
        u.renderer.setSize(t, e),
        h.renderer.setSize(t, e));
    }
  }),
  (function () {
    const e = document.getElementById("dynamicGreeting");
    if (!e) return;
    const t = new Date().getHours();
    let o = "Good evening";
    (t >= 5 && t < 12
      ? (o = "Good morning")
      : t >= 12 && t < 18 && (o = "Good afternoon"),
      (e.textContent = o));
  })());
// =========================================================================
// UI INTERACTIONS (BLUR, NAV, TOOLTIPS)
// =========================================================================
const q = document.getElementById("blurOverlay"),
  T = document.querySelector(".sidebar-nav");
document.querySelector(".tech-carousel-wrapper");
function A() {
  (q && q.classList.add("active"),
    (f.currentTime = 0),
    f.play().catch((e) => console.log("Audio playback prevented:", e)));
}
function P() {
  q && q.classList.remove("active");
}
T && (T.addEventListener("mouseenter", A), T.addEventListener("mouseleave", P));
const O = document.querySelector(".tech-track");
O &&
  (O.addEventListener("mouseenter", () => {
    O.getAnimations().forEach((e) => (e.playbackRate = 0.2));
  }),
  O.addEventListener("mouseleave", () => {
    O.getAnimations().forEach((e) => (e.playbackRate = 1));
  }));
const j = document.getElementById("globalTooltip"),
  R = document.getElementById("globalTooltipText"),
  X = document.querySelectorAll(".tech-item");
j &&
  X.length > 0 &&
  X.forEach((e) => {
    (e.addEventListener("mouseenter", () => {
      const t = e.getAttribute("data-tooltip");
      if (t) {
        ((R.textContent = t), j.classList.add("visible"));
        const o = e.getBoundingClientRect();
        ((j.style.top = o.top - 10 + "px"),
          (j.style.left = o.left + o.width / 2 + "px"));
      }
    }),
      e.addEventListener("mouseleave", () => {
        j.classList.remove("visible");
      }));
  });
const F = document.querySelector(".cv-nav");
(F &&
  (F.addEventListener("mouseenter", A), F.addEventListener("mouseleave", P)),
  // Simple CV link handled by HTML <a> tag
  (() => {
    // No custom JS needed, default behavior of <a> tag in index.html will handle it
  })(),
  document.addEventListener(
    "mouseenter",
    (e) => {
      const t = e.target;
      t.matches?.("button, a, .tech-item, .bento-item, .nav-link") && S();
    },
    !0,
  ),
  document.addEventListener("themechange", (e) => {
    const t = e.detail.theme,
      o = document.querySelector(".hero-profile-img");
    o &&
      (o.src =
        "light" === t
          ? "my pictures/light mode.webp"
          : "my pictures/dark mode.webp");
    document.querySelectorAll(".project-row-img[data-light]").forEach((img) => {
      img.src =
        "light" === t
          ? img.getAttribute("data-light")
          : img.getAttribute("data-dark");
    });
    document.querySelectorAll(".blog-black-cube").forEach((cube) => {
      const imgPath =
        t === "light"
          ? cube.getAttribute("data-light")
          : cube.getAttribute("data-dark");
      if (imgPath) cube.style.backgroundImage = `url('${imgPath}')`;
    });
  }));
const N = document.documentElement.getAttribute("data-theme") || "dark",
  Y = document.querySelector(".hero-profile-img");
Y &&
  (Y.src =
    "light" === N
      ? "my pictures/light mode.webp"
      : "my pictures/dark mode.webp");
document.querySelectorAll(".project-row-img[data-light]").forEach((img) => {
  img.src =
    "light" === N
      ? img.getAttribute("data-light")
      : img.getAttribute("data-dark");
});
document.querySelectorAll(".blog-black-cube").forEach((cube) => {
  const imgPath =
    N === "light"
      ? cube.getAttribute("data-light")
      : cube.getAttribute("data-dark");
  if (imgPath) cube.style.backgroundImage = `url('${imgPath}')`;
});
const G = document.getElementById("heroScrollRig"),
  H = document.getElementById("heroContentGroup");
// =========================================================================
// SCROLL ANIMATIONS (HERO RIG & TIMELINE)
// =========================================================================
// Reusable function to update all scroll-based animations
// Reusable function to update all scroll-based animations
const refreshScrollAnims = () => {
    const rig = document.getElementById("heroScrollRig");
    const content = document.getElementById("heroContentGroup");
    
    if (rig && content) {
      const rect = rig.getBoundingClientRect();
      const scrollRange = rig.offsetHeight - window.innerHeight;
      let progress = 0;
      if (scrollRange > 0) {
        progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
      }
      
      const scale = Math.pow(25, progress);
      let opacity = 1;
      if (progress > 0.6) {
        opacity = Math.max(0, Math.min(1, 1 - (progress - 0.6) / 0.4));
      }
      
      content.style.transform = `scale(${scale})`;
      content.style.opacity = opacity;
      
      const carousel = document.querySelector(".tech-carousel-wrapper");
      if (carousel) {
        let carouselOpacity = Math.max(0, 1 - 2.5 * progress);
        carousel.style.opacity = carouselOpacity;
      }
    }

    const midPoint = window.innerHeight / 2;
    const timelineNodes = document.querySelectorAll(".st-node, .st-turn");
    
    timelineNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const relativeProgress = (midPoint + 50 - rect.top) / rect.height;
      const fillProgress = Math.max(0, Math.min(1, relativeProgress));
      
      if (node.classList.contains("st-node")) {
        const fill = node.querySelector(".st-v .st-fill");
        if (fill) fill.style.transform = `scaleY(${fillProgress})`;
        
        const dot = node.querySelector(".st-dot");
        const content = node.querySelector(".st-content");
        
        if (relativeProgress >= 0.5) {
          if (dot) dot.classList.add("filled");
          if (content) content.classList.add("visible");
        } else {
          if (dot) dot.classList.remove("filled");
          if (content) content.classList.remove("visible");
        }
      } else if (node.classList.contains("st-turn")) {
        const topFill = node.querySelector(".st-top-left .st-fill") || node.querySelector(".st-top-right .st-fill");
        const horizontalFill = node.querySelector(".st-h .st-fill");
        const bottomFill = node.querySelector(".st-bottom-right .st-fill") || node.querySelector(".st-bottom-left .st-fill");
        
        let topSection = Math.max(0, Math.min(1, fillProgress / 0.2));
        let midSection = Math.max(0, Math.min(1, (fillProgress - 0.2) / 0.6));
        let botSection = Math.max(0, Math.min(1, (fillProgress - 0.8) / 0.2));
        
        if (topFill) topFill.style.transform = `scaleY(${topSection})`;
        if (horizontalFill) horizontalFill.style.transform = `scaleX(${midSection})`;
        if (bottomFill) bottomFill.style.transform = `scaleY(${botSection})`;
      }
    });
};

// Handle bfcache restoration
window.addEventListener("pageshow", (event) => {
    // Immediate refresh
    refreshScrollAnims();
    // Delayed refresh to ensure layout flow is complete
    setTimeout(refreshScrollAnims, 100);
    setTimeout(refreshScrollAnims, 500); // Brute force fallback for slower systems
});

window.addEventListener("scroll", refreshScrollAnims);
// =========================================================================
// INTERSECTION OBSERVERS (FADE IN EFFECTS)
// =========================================================================
const $ = document.querySelectorAll(".projects-content-group");
if ($.length > 0) {
  const e = new IntersectionObserver(
    (e) => {
      e.forEach((e) => {
        e.isIntersecting
          ? e.target.classList.add("visible")
          : e.target.classList.remove("visible");
      });
    },
    { threshold: 0.1 },
  );
  $.forEach((t) => e.observe(t));
}
const D = document.querySelectorAll(".fade-in-section");
if (D.length > 0) {
  const e = new IntersectionObserver(
    (t) => {
      t.forEach((t) => {
        t.isIntersecting &&
          (t.target.classList.add("visible"), e.unobserve(t.target));
      });
    },
    { threshold: 0.1 },
  );
  D.forEach((t) => e.observe(t));
}
const W = document.querySelectorAll(".blog-gallery-item");
if (W.length > 0) {
  const e = new IntersectionObserver(
    (t) => {
      t.forEach((t) => {
        t.isIntersecting &&
          (t.target.classList.add("visible"), e.unobserve(t.target));
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );
  W.forEach((t) => e.observe(t));
}
// =========================================================================
// PROJECTS MODAL LOGIC & DATA FETCHING
// =========================================================================
const V = document.getElementById("projectsStack"),
  _ = document.getElementById("projectModal"),
  U = document.getElementById("modalCloseBtn");
let Z = [];
function J() {
  _.classList.remove("active");
}
U && U.addEventListener("click", J);
const Q = document.querySelector(".modal-content-wrapper");
(Q &&
  Q.addEventListener("mouseleave", () => {
    setTimeout(() => {
      _.matches(":hover") && J();
    }, 300);
  }),
  _ &&
    _.addEventListener("click", (e) => {
      (e.target === _ || e.target.classList.contains("modal-backdrop")) && J();
    }),
  (async function () {
    try {
      const e = await fetch("./data/projects.json");
      if (!e.ok) throw new Error("Failed to load projects data");
      Z = await e.json();

      // We don't need to render cards anymore as they are SSG
      // But we do need to handle clicks on the existing cards
      if (V) {
        V.addEventListener("click", (e) => {
          const card = e.target.closest(".project-row");
          if (card) {
            // If the user clicked a link or button, don't open the modal
            if (e.target.closest("a, button")) return;

            const indexValue = card.getAttribute("data-index");
            // Find the project by ID since build.js uses proj.id for data-index
            const project = Z.find((p) => p.id == indexValue) || Z[indexValue];

            if (project) {
              const modalImage = document.getElementById("modalImage");
              const modalCategory = document.getElementById("modalCategory");
              const modalTitle = document.getElementById("modalTitle");
              const modalDescription =
                document.getElementById("modalDescription");
              const modalTechStack = document.getElementById("modalTechStack");
              const modalLink = document.getElementById("modalLink");

              if (modalTitle) modalTitle.textContent = project.title;
              if (modalDescription)
                modalDescription.textContent = project.description;
              if (modalCategory)
                modalCategory.textContent = project.category || "";
              if (modalImage) {
                const themeVal =
                  document.documentElement.getAttribute("data-theme") || "dark";
                modalImage.src =
                  themeVal === "light"
                    ? project.thumbnail.light
                    : project.thumbnail.dark;
              }

              if (modalTechStack) {
                modalTechStack.innerHTML = "";
                (project.technologies || []).forEach((tech) => {
                  const span = document.createElement("span");
                  span.className = "tech-pill";
                  span.textContent = tech;
                  modalTechStack.appendChild(span);
                });
              }

              if (modalLink) modalLink.href = project.link;

              _.classList.add("active");
              S(); // Play sound
            }
          }
        });
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  })(),
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest(".glow-container");
    if (t) {
      t.querySelectorAll(".glow-card").forEach((t) => {
        const o = t.getBoundingClientRect();
        (t.style.setProperty("--x", e.clientX - o.left + "px"),
          t.style.setProperty("--y", e.clientY - o.top + "px"));
      });
    }
  }));
// =========================================================================
// CONTACT MODAL & EMAILJS FORM SUBMISSION
// =========================================================================
const K = document.getElementById("contactModal"),
  ee = document.getElementById("openContactBtn"),
  te = document.getElementById("contactModalCloseBtn");
function oe() {
  K && K.classList.remove("active");
}
(ee &&
  ee.addEventListener("click", function () {
    K && (K.classList.add("active"), S());
  }),
  te && te.addEventListener("click", oe),
  K &&
    K.addEventListener("click", (e) => {
      (e.target === K || e.target.classList.contains("modal-backdrop")) && oe();
    }));

const ie = document.getElementById("contactForm"),
  ae = ie ? ie.querySelector(".contact-submit-btn") : null;
ie &&
  ae &&
  ie.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. Bot Protection (Honeypot)
    if (this.querySelector('[name="website"]').value) {
      console.warn("Spam detected.");
      return;
    }

    // 2. Client-side Rate Limiting (1 per minute)
    const lastSubmit = localStorage.getItem("contact_last_submit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      alert("Please wait a moment before sending another message.");
      return;
    }

    // 3. Basic Validation
    const email = this.querySelector('[name="email"]').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const t = ae.textContent;
    ((ae.textContent = "Sending..."), (ae.disabled = !0));
    
    emailjs
      .sendForm("service_fklvlrs", "template_zjkrkz8", this)
      .then(() => {
        localStorage.setItem("contact_last_submit", Date.now().toString());
        (alert("Message sent successfully! I will get back to you soon."),
          ie.reset(),
          (ae.textContent = t),
          (ae.disabled = !1));
        const e = document.getElementById("contactModalCloseBtn");
        e && e.click();
      })
      .catch((e) => {
        (console.error("EmailJS Error:", e),
          alert(
            "Failed to send message. Please try again later or email me directly.",
          ),
          (ae.textContent = t),
          (ae.disabled = !1));
      });
  });
// =========================================================================
// GALLERY SEARCH & FILTER LOGIC
// =========================================================================
const gallerySearch = document.getElementById("gallerySearch");
const clearSearchBtn = document.getElementById("clearSearch");

// Helper: Debounce function to limit execution frequency
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to perform search and filter
const performSearch = (searchTerm = "") => {
  const query = searchTerm.toLowerCase().trim();
  const keywords = query.split(/\s+/).filter(k => k.length > 0);
  const projects = document.querySelectorAll(".project-row");

  // Toggle clear button
  if (clearSearchBtn) {
    const isSearchEmpty = query.length === 0;
    clearSearchBtn.style.opacity = isSearchEmpty ? "0" : "1";
    clearSearchBtn.style.pointerEvents = isSearchEmpty ? "none" : "auto";
  }

  projects.forEach((project) => {
    const title = project.querySelector(".project-row-title")?.textContent.toLowerCase() || "";
    const desc = project.querySelector(".project-row-desc")?.textContent.toLowerCase() || "";
    const tech = Array.from(project.querySelectorAll(".project-row-pill"))
      .map((p) => p.textContent.toLowerCase())
      .join(" ");

    // Check if ALL keywords match at least one field (multi-keyword AND search)
    const matchesAllKeywords = keywords.every(kw => 
      title.includes(kw) || desc.includes(kw) || tech.includes(kw)
    );

    const matches = keywords.length === 0 || matchesAllKeywords;

    if (matches) {
      project.style.display = "block";
      project.classList.remove("filtered-out");
      // Optional: Add a subtle animation/transition
      project.animate([
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 300, easing: "ease-out", fill: "both" });
    } else {
      project.style.display = "none";
      project.classList.add("filtered-out");
    }
  });

  // Check if no results
  const visibleProjects = Array.from(projects).filter(p => p.style.display !== "none");
  const projectsStack = document.getElementById("projectsStack");
  let noResultsMsg = document.getElementById("noResultsMsg");

  if (visibleProjects.length === 0 && query.length > 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.id = "noResultsMsg";
      noResultsMsg.className = "no-results-message fade-element visible";
      noResultsMsg.innerHTML = `
        <div class="no-results-content">
          <i class="fa-solid fa-magnifying-glass-chart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No matches for "${searchTerm}"</h3>
          <p>Try different keywords or browse our full collection below.</p>
        </div>
      `;
      projectsStack?.appendChild(noResultsMsg);
    } else {
      noResultsMsg.querySelector("h3").textContent = `No matches for "${searchTerm}"`;
    }
  } else {
    noResultsMsg?.remove();
  }

  // Update URL search param without reloading
  if (window.location.pathname.endsWith("projects.html")) {
    const url = new URL(window.location);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  }
};

// Main search listener with debouncing
if (gallerySearch) {
  const debouncedSearch = debounce((e) => {
    performSearch(e.target.value);
  }, 250);

  gallerySearch.addEventListener("input", debouncedSearch);

  // Initial check from URL parameters
  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      gallerySearch.value = initialQuery;
      performSearch(initialQuery);
    }
  });
}

if (clearSearchBtn && gallerySearch) {
  clearSearchBtn.addEventListener("click", () => {
    gallerySearch.value = "";
    performSearch(""); // Execute immediately without debounce
    gallerySearch.focus();
  });
}

// =========================================================================
// BLOG GRID PAGINATION & RENDERING
// =========================================================================
const blogGalleryContainer = document.getElementById("blogGalleryContainer");
const blogPaginationControls = document.getElementById(
  "blogPaginationControls",
);

let blogData = [];
let currentBlogPage = 1;
const blogsPerPage = 5;

function createBlogCardHTML(post, isImageBlock = false) {
  if (isImageBlock) {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const lightImg = "my pictures/light mode(gamified).png";
    const darkImg = "my pictures/dark mode(gamified).png";
    const currentImg = theme === "light" ? lightImg : darkImg;
    return `
      <div class="blog-black-cube" 
           data-light="${lightImg}" 
           data-dark="${darkImg}" 
           style="background-image: url('${currentImg}'); background-size: cover; background-position: center;">
      </div>`;
  }
  return `
    <a href="${post.link}" class="blog-card-v2 glow-card">
      <div class="card-line card-line-top"></div>
      <div class="card-line card-line-right"></div>
      <div class="card-line card-line-bottom"></div>
      <div class="card-line card-line-left"></div>
      <div class="blog-card-cat-date">
        <span>${post.category || "Engineering"}</span>
        <span>${post.date}</span>
      </div>
      <h3 class="blog-card-title">${post.topic}</h3>
      <p class="blog-card-excerpt">${post.description}</p>
      <div class="blog-card-footer">
        <span>By ${post.author || "Mosa Moleleki"}</span>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    </a>
  `;
}

function renderBlogPage(page) {
  if (!blogGalleryContainer) return;

  const startIndex = (page - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const pagePosts = blogData.slice(startIndex, endIndex);

  if (pagePosts.length === 0) {
    blogGalleryContainer.innerHTML =
      '<p style="text-align:center; padding: 2rem;">No articles found.</p>';
    return;
  }

  let html = '<div class="blog-grid-page">';

  // Quadrant 1 (Top Left) - Large single post
  html += '<div class="blog-q1">';
  if (pagePosts[0]) html += createBlogCardHTML(pagePosts[0]);
  else
    html +=
      '<div class="blog-card-v2 blank-card" style="cursor: default;"></div>';
  html += "</div>";

  // Quadrant 2 (Top Right) - Split into two stacked posts
  html += '<div class="blog-q2">';
  if (pagePosts[1]) html += createBlogCardHTML(pagePosts[1]);
  else
    html +=
      '<div class="blog-card-v2 blank-card" style="cursor: default;"></div>';
  if (pagePosts[2]) html += createBlogCardHTML(pagePosts[2]);
  else
    html +=
      '<div class="blog-card-v2 blank-card" style="cursor: default;"></div>';
  html += "</div>";

  // Quadrant 3 (Bottom Left) - Split into two stacked posts
  html += '<div class="blog-q3">';
  if (pagePosts[3]) html += createBlogCardHTML(pagePosts[3]);
  else
    html +=
      '<div class="blog-card-v2 blank-card" style="cursor: default;"></div>';
  if (pagePosts[4]) html += createBlogCardHTML(pagePosts[4]);
  else
    html +=
      '<div class="blog-card-v2 blank-card" style="cursor: default;"></div>';
  html += "</div>";

  // Quadrant 4 (Bottom Right) - Single large image block (usually from post 1)
  html += '<div class="blog-q4">';
  if (pagePosts.length > 0) {
    html += createBlogCardHTML(pagePosts[0], true);
  } else {
    html += '<div class="blog-black-cube"></div>';
  }
  html += "</div>";

  html += "</div>";
  blogGalleryContainer.innerHTML = html;

  // Re-attach hover logic for glow effect
  blogGalleryContainer.querySelectorAll(".glow-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const o = card.getBoundingClientRect();
      card.style.setProperty("--x", e.clientX - o.left + "px");
      card.style.setProperty("--y", e.clientY - o.top + "px");
    });
  });
}

function updateBlogPaginationControls() {
  if (!blogPaginationControls) return;
  const totalPages = Math.ceil(blogData.length / blogsPerPage);

  if (totalPages <= 1) {
    blogPaginationControls.style.display = "none";
    return;
  }

  blogPaginationControls.style.display = "flex";
  blogPaginationControls.innerHTML = `
    <button class="blog-page-btn" id="blogPrevBtn" ${currentBlogPage === 1 ? "disabled" : ""}>
      <i class="fa-solid fa-arrow-left"></i>
    </button>
    <div class="blog-page-info">PAGE ${currentBlogPage} OF ${totalPages}</div>
    <button class="blog-page-btn" id="blogNextBtn" ${currentBlogPage === totalPages ? "disabled" : ""}>
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;

  document.getElementById("blogPrevBtn")?.addEventListener("click", () => {
    if (currentBlogPage > 1) {
      if (typeof S === "function") S(); // sound
      currentBlogPage--;
      renderBlogPage(currentBlogPage);
      updateBlogPaginationControls();
    }
  });

  document.getElementById("blogNextBtn")?.addEventListener("click", () => {
    if (currentBlogPage < totalPages) {
      if (typeof S === "function") S(); // sound
      currentBlogPage++;
      renderBlogPage(currentBlogPage);
      updateBlogPaginationControls();
    }
  });
}

// Fetch loop
if (blogGalleryContainer) {
  fetch("./data/blog.json")
    .then((res) => res.json())
    .then((data) => {
      blogData = data;
      renderBlogPage(currentBlogPage);
      updateBlogPaginationControls();
    })
    .catch((err) => console.error("Error loading blog data:", err));
}
