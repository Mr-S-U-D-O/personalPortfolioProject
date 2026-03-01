import * as THREE from "three";
import { DRACOLoader } from "three-draco-loader";
import { GLTFLoader } from "three-gltf-loader";
import { CSS3DRenderer, CSS3DObject } from "three-css-3d-renderer";

const splashScreen = document.getElementById("splashScreen");
const skeletonLoader = document.getElementById("skeletonLoader");
const quoteContainer = document.getElementById("quoteContainer");
const heroSection = document.getElementById("heroSection");
const laptopContainer = document.getElementById("laptop");
const laptopScreen = document.getElementById("laptop-screen");
const laptopScreenContainer = document.getElementById("screen-content");

// --- Constants & Config ---
const DRACO_DECODER_URL = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";
const LAPTOP_SCENE_CAMERA_INIT_Z_POSITION = window.innerWidth < 768 ? 1100 : 750;

const DEVICE_CONFIG = {
    laptop: {
        file: "./models/laptop.glb",
        init: {
            position: { x: 0, y: -400, z: 0 }, 
            rotation: { x: Math.PI / 20, y: 0, z: 0 },
            scale: { x: 50, y: 50, z: 50 },
            targetY: -70
        },
        lidClosedRotationX: Math.PI / 2,
        lidOpenRotationX: 0,
        hasLid: true,
        screenCSSOffset: { x: 0, y: 0, z: 0 }
    },
    iphone: {
        file: "./models/iphone.glb",
        init: {
            position: { x: 0, y: -500, z: 0 }, 
            rotation: { x: 0, y: Math.PI, z: 0 }, // Rotate 180deg to face forwards
            scale: { x: 250, y: 250, z: 250 }, 
            targetY: 80
        },
        hasLid: false,
        screenCSSOffset: { x: 0, y: -45, z: 0 } // Pull it down to center visually in the bezels
    }
};

// Sequence timing variables (in milliseconds)
// The skeleton runs inside the screen. We animate the Macbook first.
const ANIMATION_START_DELAY = 500;
const ANIMATION_DURATION = 6000;
const SKELETON_VISIBLE_TIME = 2000; 

// --- Three.js State ---
const laptopScene = {
    deviceType: 'laptop', // Determined at runtime
    geometryFile: null,
    container: null,
    mesh: null, // { base, lid, screen }
    scene: null,
    renderer: null,
    camera: null,
};
const laptopScreenScene = {
    container: null,
    mesh: null,
    scene: null,
    renderer: null,
};

let animationStartTime = null;

// --- Audio Setup ---
const startupAudio = new Audio('./audio sounds/startup sound.mp3');
const quoteAudio = new Audio('./audio sounds/initial quote appearance sound.mp3');
const menuAudio = new Audio('./audio sounds/menu open.mp3');
const hoverAudio = new Audio('./audio sounds/button hover.mp3');

// Group audio and lower volume
const allAudio = [startupAudio, quoteAudio, menuAudio, hoverAudio];
allAudio.forEach(a => {
    a.volume = 0.3;
    a.load();
});

// --- Mute Toggle Logic ---
const muteToggleBtn = document.getElementById("muteToggle");
let isMuted = false;

if (muteToggleBtn) {
    muteToggleBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        allAudio.forEach(a => a.volume = isMuted ? 0 : 0.3);
        const icon = muteToggleBtn.querySelector("i");
        if (icon) {
            icon.className = isMuted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
        }
    });
}

// Playback handlers
const playHoverSound = () => {
    hoverAudio.currentTime = 0;
    hoverAudio.play().catch(e => console.log('Audio playback prevented:', e));
};

const playMenuSound = () => {
    menuAudio.currentTime = 0;
    menuAudio.play().catch(e => console.log('Audio playback prevented:', e));
};

// --- Three.js Setup Functions ---

const getWindowSize = () => ({
    height: window.innerHeight,
    width: window.innerWidth,
});

const load3DModels = async () => {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath(DRACO_DECODER_URL);
    gltfLoader.setDRACOLoader(dracoLoader);
    
    laptopScene.deviceType = window.innerWidth < 768 ? "iphone" : "laptop";
    const config = DEVICE_CONFIG[laptopScene.deviceType];

    laptopScene.geometryFile = await gltfLoader.loadAsync(config.file);
};

const setLaptopMeshMaterials = (mesh) => {
    if (mesh.name === "Cube008_2") {
        mesh.material.side = THREE.FrontSide;
    } else if (mesh.name === "keyboard") {
        mesh.material = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 100,
            side: THREE.FrontSide,
        });
    }

    (mesh.children || []).forEach((child) => setLaptopMeshMaterials(child));
};

const createLaptopMesh = (geometryFile) => {
    const base = geometryFile.scene;
    const config = DEVICE_CONFIG[laptopScene.deviceType];

    base.position.set(config.init.position.x, config.init.position.y, config.init.position.z);
    base.rotation.set(config.init.rotation.x, config.init.rotation.y, config.init.rotation.z);
    base.scale.set(config.init.scale.x, config.init.scale.y, config.init.scale.z);
    
    let lid = null;
    let screen = null;

    if (config.hasLid) {
        setLaptopMeshMaterials(base);
        lid = base.children[0];
        screen = lid.children[0].children[2];
        lid.rotation.set(config.lidClosedRotationX, 0, 0); // Start with closed lid
    } else {
        // iPhone specific setup
        screen = base.getObjectByName("Screen");
        
        // If the screen node isn't found exactly by name, fallback to children
        if (!screen && base.children.length > 0) {
            screen = base.children[0];
        }
    }

    return { base, lid, screen };
};

const addCss3dToObject = (container, obj) => {
    const containerClone = container.cloneNode(true);
    container.remove();

    const css3dObject = new CSS3DObject(containerClone);
    obj.css3dObject = css3dObject;
    obj.add(css3dObject);

    // Calculate exact physical dimensions of the screen face for CSS scaling
    const boundingBox = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Dynamically set CSS container scale based on the 3D model bounds
    // We multiply by the mesh scale since the bounds are local
    const baseScale = DEVICE_CONFIG[laptopScene.deviceType].init.scale.x;
    
    // Width is always X. Height is usually Y, but for the laptop lid it's Z since it was rotated.
    const physicalWidth = size.x * baseScale;
    const physicalHeight = (size.y > size.z ? size.y : size.z) * baseScale;
    
    containerClone.style.width = `${Math.floor(physicalWidth)}px`;
    containerClone.style.height = `${Math.floor(physicalHeight)}px`;

    // Invisible plane to block WebGL behind the screen
    obj.material = new THREE.MeshPhongMaterial({
        opacity: 0.15,
        color: new THREE.Color(0x111111),
        blending: THREE.NoBlending,
    });

    const { max, min } = obj.geometry.boundingBox;
    obj.geometry = new THREE.BoxGeometry(
        max.x - min.x,
        max.y - min.y,
        max.z - min.z + 0.2
    );
    
    // update references inside the clone since we removed the original
    const skeletonClone = containerClone.querySelector(".skeleton-loader");
    if (skeletonClone) {
        skeletonClone.id = "skeletonLoaderClone";
    }
};

const initAllScenes = () => {
    const { height, width } = getWindowSize();
    
    // Laptop WebGL Scene
    laptopScene.container = laptopContainer;
    laptopScene.mesh = createLaptopMesh(laptopScene.geometryFile);
    addCss3dToObject(laptopScreenContainer, laptopScene.mesh.screen);

    laptopScene.scene = new THREE.Scene();
    
    laptopScene.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    laptopScene.renderer.setPixelRatio(window.devicePixelRatio);
    laptopScene.renderer.setSize(width, height);
    laptopContainer.appendChild(laptopScene.renderer.domElement);

    laptopScene.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    // Dynamically adjust Z to prevent clipping on mobile screens
    laptopScene.camera.position.set(0, 0, width < 768 ? 1100 : 750);

    const pointLight1 = new THREE.PointLight(0xffffff, 3.5, 0, 0);
    pointLight1.position.set(0, 700, 750);
    const pointLight2 = new THREE.PointLight(0xffffff, 0.05, 0, 0);
    pointLight2.position.set(-300, 100, 100);

    laptopScene.scene.add(pointLight1, pointLight2, laptopScene.mesh.base);

    // Laptop CSS3D Screen Scene
    laptopScreenScene.container = laptopScreen;
    laptopScreenScene.mesh = laptopScene.mesh.screen.css3dObject;
    
    laptopScreenScene.scene = new THREE.Scene();
    laptopScreenScene.renderer = new CSS3DRenderer();
    laptopScreenScene.renderer.setSize(width, height);
    laptopScreenScene.renderer.domElement.style.position = 'absolute';
    laptopScreenScene.renderer.domElement.style.top = 0;
    laptopScreen.appendChild(laptopScreenScene.renderer.domElement);

    laptopScreenScene.scene.add(laptopScreenScene.mesh);
};

const syncLaptopScreen = () => {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    laptopScene.mesh.screen.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    laptopScreenScene.mesh.position.copy(position);
    laptopScreenScene.mesh.quaternion.copy(quaternion);
    
    const config = DEVICE_CONFIG[laptopScene.deviceType];

    // The laptop screen explicitly needs a -PI/2 rotation due to its local mesh space
    if (config.hasLid) {
        laptopScreenScene.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), (Math.PI / 2) * -1);
    }
    
    // Apply optional alignment offsets
    if (config.screenCSSOffset) {
        laptopScreenScene.mesh.translateX(config.screenCSSOffset.x);
        laptopScreenScene.mesh.translateY(config.screenCSSOffset.y);
        laptopScreenScene.mesh.translateZ(config.screenCSSOffset.z);
    }
};


// --- Animation Timeline Logic ---

// Ease Out Cubic function
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
// Ease In Expo function
const easeInExpo = (x) => x === 0 ? 0 : Math.pow(2, 10 * x - 10);
// Ease In Out Quad function
const easeInOutQuad = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

const updateAnimation = (timestamp) => {
    if (!animationStartTime) animationStartTime = timestamp;
    
    const elapsed = timestamp - animationStartTime;
    // Don't start animating until initial delay finishes
    const animationElapsed = Math.max(0, elapsed - ANIMATION_START_DELAY); 
    const progress = Math.min(1, animationElapsed / ANIMATION_DURATION);
    
    // We have different phases inside our animation.
    
    // Phase 1: MacBook rises into view (0 -> 15%)
    const riseProgress = Math.min(1, progress / 0.15);
    const riseEased = easeOutCubic(riseProgress);
    const startY = DEVICE_CONFIG[laptopScene.deviceType].init.position.y;
    const targetY = DEVICE_CONFIG[laptopScene.deviceType].init.targetY; // Center position
    laptopScene.mesh.base.position.y = startY + ((targetY - startY) * riseEased);

    // Phase 2: Lid Opens (15% -> 35%)
    let lidProgress = 0;
    if (progress > 0.15) {
        lidProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.20));
    }
    const lidEased = easeInOutQuad(lidProgress);
    
    const config = DEVICE_CONFIG[laptopScene.deviceType];
    if (config.hasLid && laptopScene.mesh.lid) {
        laptopScene.mesh.lid.rotation.x = config.lidClosedRotationX - ((config.lidClosedRotationX - config.lidOpenRotationX) * lidEased);
    }
    
    // Phase 3: Huge zoom past the layout (60% -> 100%)
    let zoomProgress = 0;
    if (progress > 0.60) {
        zoomProgress = Math.max(0, Math.min(1, (progress - 0.60) / 0.40));
    }
    const zoomEased = easeInExpo(zoomProgress); // slow to start, incredibly fast at the end
    
    // Start at initial Z (normal view), push well past into negatives to pass through face
    const initialZ = window.innerWidth < 768 ? 1100 : 750;
    const currentZ = initialZ - ( initialZ * zoomEased );
    laptopScene.camera.position.z = currentZ;

    // Render loop calls
    laptopScene.renderer.render(laptopScene.scene, laptopScene.camera);
    laptopScreenScene.renderer.render(laptopScreenScene.scene, laptopScene.camera);
    syncLaptopScreen();

    // End condition
    if (progress < 1) {
        requestAnimationFrame(updateAnimation);
    } else {
        // Zoom finished. Camera is resting tightly inside the screen perimeter.
        
        // 1. Start the skeleton loader
        const skeletonClone = document.getElementById("skeletonLoaderClone");
        if (skeletonClone) {
            skeletonClone.classList.add("active");
        }
        
        // 2. Wait for it to 'load'
        setTimeout(() => {
            if (skeletonClone) {
                skeletonClone.classList.add("fade-out");
            }
            
            // 3. Wait for it to fade out (800ms defined in CSS)
            setTimeout(() => {
                // Now hide laptop scenes and show quote
                laptopContainer.style.display = 'none';
                laptopScreen.style.display = 'none';
                
                quoteContainer.classList.add("show");
                quoteAudio.play().catch(e => console.log('Audio playback prevented:', e));
                
                // Let quote sit for 3.5 seconds, then zoom through it
                setTimeout(() => {
                    quoteContainer.classList.add("zoom-into");
                    
                    // Wait for quote zoom out, then bring in hero
                    setTimeout(() => {
                        heroSection.classList.add("show");
                        document.documentElement.style.overflowY = "auto";
                        document.documentElement.style.overflowX = "hidden";
                        document.body.style.overflowY = "auto";
                        document.body.style.overflowX = "hidden";
                        document.documentElement.style.height = "auto";
                        document.body.style.height = "auto";
                        
                        setTimeout(() => {
                            splashScreen.style.display = 'none'; 
                        }, 1500); 
                    }, 1700);
                    
                }, 3500);
            }, 800); 
        }, SKELETON_VISIBLE_TIME); 
    }
};


// --- Initialize ---

const onReadyStateChange = (event) => {
    if (event.target.readyState === "complete") {
        setTimeout(()=>{
            load3DModels().then(() => {
                initAllScenes();
                startupAudio.play().catch(e => console.log('Audio playback prevented:', e));
                requestAnimationFrame(updateAnimation);
            });
        }, 500); // give the page half a second after being ready.
    }
};

document.addEventListener("readystatechange", onReadyStateChange);
// fallback just in case readystatechange misses it
if (document.readyState === "complete") {
  load3DModels().then(() => {
      initAllScenes();
      startupAudio.play().catch(e => console.log('Audio playback prevented:', e));
      requestAnimationFrame(updateAnimation);
  });
}

// Window resize handler
window.addEventListener("resize", () => {
    if (laptopScene.renderer) {
        const { height, width } = getWindowSize();
        
        laptopScene.camera.aspect = width / height;
        // Dynamically adjust initial Z if resized past breakpoint before zoom starts
        if (!heroSection.classList.contains("show")) {
            laptopScene.camera.position.setZ(width < 768 ? 1100 : 750);
        }
        laptopScene.camera.updateProjectionMatrix();
        laptopScene.renderer.setSize(width, height);
        
        laptopScreenScene.renderer.setSize(width, height);
    }
});


// --- Dynamic Greeting Logic ---
function updateGreeting() {
    const greetingElement = document.getElementById("dynamicGreeting");
    if (!greetingElement) return;

    const currentHour = new Date().getHours();
    let greetingText = "Good evening";

    if (currentHour >= 5 && currentHour < 12) {
        greetingText = "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        greetingText = "Good afternoon";
    }

    greetingElement.textContent = greetingText;
}

updateGreeting();

// --- Blur Overlay Logic & Menu Audio ---
const blurOverlay = document.getElementById("blurOverlay");
const sidebarNav = document.querySelector(".sidebar-nav");
const techWrapper = document.querySelector(".tech-carousel-wrapper");

function activateBlur() {
    if (blurOverlay) blurOverlay.classList.add("active");
    playMenuSound();
}

function deactivateBlur() {
    if (blurOverlay) blurOverlay.classList.remove("active");
}

if (sidebarNav) {
    sidebarNav.addEventListener("mouseenter", activateBlur);
    sidebarNav.addEventListener("mouseleave", deactivateBlur);
}

if (techWrapper) {
    techWrapper.addEventListener("mouseenter", activateBlur);
    techWrapper.addEventListener("mouseleave", deactivateBlur);
}

// --- Tech Carousel Hover Slowdown & Tooltips ---
const techTrack = document.querySelector('.tech-track');
if (techTrack) {
    techTrack.addEventListener('mouseenter', () => {
        techTrack.getAnimations().forEach(anim => anim.playbackRate = 0.2);
    });
    techTrack.addEventListener('mouseleave', () => {
        techTrack.getAnimations().forEach(anim => anim.playbackRate = 1);
    });
}

// --- Global Floating Tooltip Logic ---
const globalTooltip = document.getElementById('globalTooltip');
const globalTooltipText = document.getElementById('globalTooltipText');
const techItems = document.querySelectorAll('.tech-item');

if (globalTooltip && techItems.length > 0) {
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const tooltipContent = item.getAttribute('data-tooltip');
            if (tooltipContent) {
                globalTooltipText.textContent = tooltipContent;
                globalTooltip.classList.add('visible');
                
                // Position it explicitly above the hovered item
                const rect = item.getBoundingClientRect();
                globalTooltip.style.top = (rect.top - 10) + 'px';
                globalTooltip.style.left = (rect.left + rect.width / 2) + 'px';
            }
        });
        item.addEventListener('mouseleave', () => {
            globalTooltip.classList.remove('visible');
        });
    });
}

const cvNav = document.querySelector(".cv-nav");
if (cvNav) {
    cvNav.addEventListener("mouseenter", activateBlur);
    cvNav.addEventListener("mouseleave", deactivateBlur);
}

// Bind hover audio to common interactive elements
const interactiveElements = document.querySelectorAll('.nav-link, .tech-item, .theme-toggle');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
});

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    
    if (themeToggleIcon) {
        if (themeName === 'light') {
            themeToggleIcon.className = 'fa-solid fa-sun';
        } else {
            themeToggleIcon.className = 'fa-solid fa-moon';
        }
    }
}

function toggleTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Set up initial theme
const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// --- Scroll Zoom Logic & Timeline Animation ---
const heroScrollRig = document.getElementById("heroScrollRig");
const heroContentGroup = document.getElementById("heroContentGroup");
const aboutSlides = document.querySelectorAll('.about-slide');

window.addEventListener("scroll", () => {
    // 1. Zoom Logic for Hero
    if (heroScrollRig && heroContentGroup) {
        const rigRect = heroScrollRig.getBoundingClientRect();
        const scrollDistance = heroScrollRig.offsetHeight - window.innerHeight;
        
        let scrollProgress = 0;
        if (scrollDistance > 0) {
            scrollProgress = Math.max(0, Math.min(1, -rigRect.top / scrollDistance));
        }

        // By making the scale an exponent of scrollProgress, the perceived zoom velocity remains constant
        // giving the user perfect 1:1 control over the movement without an explosive finish.
        const scaleFactor = Math.pow(81, scrollProgress); 
        
        let opacityProgress = 1;
        // Fade out slightly later (60% to 90%) to keep content visible during the controlled zoom
        if (scrollProgress > 0.6) {
            opacityProgress = 1 - ((scrollProgress - 0.6) / 0.3);
            opacityProgress = Math.max(0, Math.min(1, opacityProgress));
        }

        heroContentGroup.style.transform = `scale(${scaleFactor})`;
        heroContentGroup.style.opacity = opacityProgress;
        
        const techWrapper = document.querySelector('.tech-carousel-wrapper');
        if (techWrapper) {
            let techOpacity = 1 - (scrollProgress * 2.5);
            techWrapper.style.opacity = Math.max(0, techOpacity);
        }
    }

    // 2. Timeline Fill Logic
    if (aboutSlides.length > 0) {
        const viewportHeight = window.innerHeight;
        aboutSlides.forEach(slide => {
            const rect = slide.getBoundingClientRect();
            // Fill based on how far the slide has passed through the center of the viewport
            let fillPercentage = 0;
            // The active zone is when the top of the slide reaches the middle of the screen
            if (rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
                const passedCenterDistance = (viewportHeight / 2) - rect.top;
                fillPercentage = Math.min(100, Math.max(0, (passedCenterDistance / rect.height) * 100));
            } else if (rect.bottom < viewportHeight / 2) {
                fillPercentage = 100; // passed completely into history
            }
            
            const fillEl = slide.querySelector('.timeline-fill');
            if (fillEl) {
                fillEl.style.height = `${fillPercentage}%`;
            }
        });
    }
});
