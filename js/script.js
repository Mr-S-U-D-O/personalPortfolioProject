document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splashScreen");
    const skeletonLoader = document.getElementById("skeletonLoader");
    const quoteContainer = document.getElementById("quoteContainer");
    const heroSection = document.getElementById("heroSection");

    // Sequence timing variables (in milliseconds)
    const SKELETON_VISIBLE_TIME = 2000; 
    const QUOTE_IN_DELAY = SKELETON_VISIBLE_TIME + 800; // Start quote after skeleton fades
    const QUOTE_READ_TIME = 3000; // How long quote stays on screen
    const QUOTE_OUT_DELAY = QUOTE_IN_DELAY + QUOTE_READ_TIME; 
    const HERO_IN_DELAY = QUOTE_OUT_DELAY + 400; // Hero appears slightly after quote starts zooming

    // 1. Fade out skeleton
    setTimeout(() => {
        skeletonLoader.classList.add("fade-out");
    }, SKELETON_VISIBLE_TIME);

    // 2. Show quote (Rise up and fade in)
    setTimeout(() => {
        skeletonLoader.style.display = 'none'; // remove from layout
        quoteContainer.classList.add("show");
    }, QUOTE_IN_DELAY);

    // 3. Zoom INTO quote (Quote gets massive and fades)
    setTimeout(() => {
        quoteContainer.classList.add("zoom-into");
    }, QUOTE_OUT_DELAY);

    // 4. Show Hero Section & clean up splash overlay
    setTimeout(() => {
        heroSection.classList.add("show");
        document.body.style.overflow = "auto"; // Allow scrolling again
        
        // Remove splash container completely after transition finishes
        setTimeout(() => {
            splashScreen.style.display = 'none'; 
        }, 1500); 
    }, HERO_IN_DELAY);
});
