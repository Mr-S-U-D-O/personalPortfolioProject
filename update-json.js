const fs = require("fs");

const path = "data/blog.json";
let data = JSON.parse(fs.readFileSync(path, "utf-8"));

const longContent = `<h2>Building Scalable Layouts in Modern Web</h2>
<p>Sed ut unde omnis iste natus sit voluptatem accusantium doloremque laudantium, totam aperiam inventore veritatis et architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.</p>

<h3>The Challenge With Complex Designs</h3>
<p>Many traditional architectures fail when stretched into large components that demand flexibility. We needed to solve the issue of grid expansion and contraction without causing DOM layout thrashing or repaints, rendering it exceptionally fast.</p>

<blockquote>
<p>[!NOTE] The Key to Fluidity</p>
<p>Responsive design is not just breakpoints. It is fluid typography, fractional grid units (<code>fr</code>), variable constraints and CSS container queries.</p>
</blockquote>

<pre><code>// Example of grid flexibility logic
const setupFluidGrid = (containerId) => {
    const grid = document.getElementById(containerId);
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    grid.style.gap = '20px';
};
</code></pre>

<p>I realized that when I started out, the primary blocker for most new developers was simply structural visualization. If you don't know the exact dimensions of your parent boundary, you can't realistically style the children without rigid breakpoints.</p>

<h3>Designing for The Global User Ecosystem</h3>
<p>Not every user is browsing over a fast fiber connection in dark mode. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<p>When engineering for optimal user retention, you have to measure paint cycles, the critical rendering path, and how many bytes of CSS you're actually loading. At LaunchPad Studio, I always prioritize minimizing the main thread blocking time. The result is pure, unadulterated performance.</p>
`;

data = data.map((post) => {
  // Inject the much richer longContent
  post.content = longContent;
  return post;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("done updating blog.json");
