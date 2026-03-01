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

// --- Constants ---
const LAPTOP_FILE = "./models/laptop.glb";
const DRACO_DECODER_URL = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";
const LAPTOP_INIT = {
    position: { x: 0, y: -400, z: 0 }, 
    rotation: { x: Math.PI / 20, y: 0, z: 0 },
    scale: { x: 50, y: 50, z: 50 },
};
const LAPTOP_LID_ROTATION_X_CLOSED = Math.PI / 2;
const LAPTOP_LID_ROTATION_X_OPEN = 0;
const LAPTOP_SCENE_CAMERA_INIT_Z_POSITION = 750;

// Sequence timing variables (in milliseconds)
// The skeleton runs inside the screen. We animate the Macbook first.
const ANIMATION_START_DELAY = 500;
const ANIMATION_DURATION = 6000;
const SKELETON_VISIBLE_TIME = 2000; 

// --- Three.js State ---
const laptopScene = {
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

    laptopScene.geometryFile = await gltfLoader.loadAsync(LAPTOP_FILE);
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
    setLaptopMeshMaterials(base);

    const lid = base.children[0];
    const screen = lid.children[0].children[2];

    base.position.set(LAPTOP_INIT.position.x, LAPTOP_INIT.position.y, LAPTOP_INIT.position.z);
    base.rotation.set(LAPTOP_INIT.rotation.x, LAPTOP_INIT.rotation.y, LAPTOP_INIT.rotation.z);
    base.scale.set(LAPTOP_INIT.scale.x, LAPTOP_INIT.scale.y, LAPTOP_INIT.scale.z);
    
    // Start with closed lid
    lid.rotation.set(LAPTOP_LID_ROTATION_X_CLOSED, 0, 0);

    return { base, lid, screen };
};

const addCss3dToObject = (container, obj) => {
    const containerClone = container.cloneNode(true);
    container.remove();

    const css3dObject = new CSS3DObject(containerClone);
    obj.css3dObject = css3dObject;
    obj.add(css3dObject);

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
    laptopScene.camera.position.set(0, 0, LAPTOP_SCENE_CAMERA_INIT_Z_POSITION);

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
    laptopScreenScene.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), (Math.PI / 2) * -1);
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
    const startY = LAPTOP_INIT.position.y;
    const targetY = -70; // Center position
    laptopScene.mesh.base.position.y = startY + ((targetY - startY) * riseEased);

    // Phase 2: Lid Opens (15% -> 35%)
    let lidProgress = 0;
    if (progress > 0.15) {
        lidProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.20));
    }
    const lidEased = easeInOutQuad(lidProgress);
    laptopScene.mesh.lid.rotation.x = LAPTOP_LID_ROTATION_X_CLOSED - ((LAPTOP_LID_ROTATION_X_CLOSED - LAPTOP_LID_ROTATION_X_OPEN) * lidEased);
    
    // Phase 3: Huge zoom past the layout (60% -> 100%)
    let zoomProgress = 0;
    if (progress > 0.60) {
        zoomProgress = Math.max(0, Math.min(1, (progress - 0.60) / 0.40));
    }
    const zoomEased = easeInExpo(zoomProgress); // slow to start, incredibly fast at the end
    
    // Start at 750 (normal view), push well past into negatives to pass through face
    const currentZ = LAPTOP_SCENE_CAMERA_INIT_Z_POSITION - (700 * zoomEased);
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
                
                // Let quote sit for 3 seconds, then zoom through it
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
                    
                }, 3000);
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
      requestAnimationFrame(updateAnimation);
  });
}

// Window resize handler
window.addEventListener("resize", () => {
    if (laptopScene.renderer) {
        const { height, width } = getWindowSize();
        
        laptopScene.camera.aspect = width / height;
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

// --- Blur Overlay Logic ---
const blurOverlay = document.getElementById("blurOverlay");
const sidebarNav = document.querySelector(".sidebar-nav");
const techTrack = document.querySelector(".tech-track");

function activateBlur() {
    if (blurOverlay) blurOverlay.classList.add("active");
}

function deactivateBlur() {
    if (blurOverlay) blurOverlay.classList.remove("active");
}

if (sidebarNav) {
    sidebarNav.addEventListener("mouseenter", activateBlur);
    sidebarNav.addEventListener("mouseleave", deactivateBlur);
}

if (techTrack) {
    techTrack.addEventListener("mouseenter", activateBlur);
    techTrack.addEventListener("mouseleave", deactivateBlur);
}

const cvNav = document.querySelector(".cv-nav");
if (cvNav) {
    cvNav.addEventListener("mouseenter", activateBlur);
    cvNav.addEventListener("mouseleave", deactivateBlur);
}

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

// --- Scroll Zoom Logic ---
const heroScrollRig = document.getElementById("heroScrollRig");
const heroContentGroup = document.getElementById("heroContentGroup");

window.addEventListener("scroll", () => {
    if (!heroScrollRig || !heroContentGroup) return;

    const rigRect = heroScrollRig.getBoundingClientRect();
    const scrollDistance = heroScrollRig.offsetHeight - window.innerHeight;
    
    let scrollProgress = 0;
    if (scrollDistance > 0) {
        scrollProgress = Math.max(0, Math.min(1, -rigRect.top / scrollDistance));
    }

    // Scale up to 81x. Keep translateZ for hardware acceleration, 
    // but without will-change: transform it should re-rasterize or keep crispness.
    const scaleFactor = 1 + Math.pow(scrollProgress, 3) * 80; 
    
    // Opacity fades out towards the end (from 50% scroll to 80% scroll)
    let opacityProgress = 1;
    if (scrollProgress > 0.5) {
        opacityProgress = 1 - ((scrollProgress - 0.5) / 0.3);
        opacityProgress = Math.max(0, Math.min(1, opacityProgress));
    }

    heroContentGroup.style.transform = `scale(${scaleFactor})`;
    heroContentGroup.style.opacity = opacityProgress;
    
    // Optional: Hide the tech scroller fully before max scale to avoid ugly stretching
    const techWrapper = document.querySelector('.tech-carousel-wrapper');
    if (techWrapper) {
        let techOpacity = 1 - (scrollProgress * 2.5); // fades out by 40% scroll depth
        techWrapper.style.opacity = Math.max(0, techOpacity);
    }
});
