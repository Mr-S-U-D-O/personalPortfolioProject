const fs = require("fs");

function getHtmlFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (
      item.isDirectory() &&
      item.name !== "node_modules" &&
      !item.name.startsWith(".")
    ) {
      files = files.concat(getHtmlFiles(`${dir}/${item.name}`));
    } else if (item.isFile() && item.name.endsWith(".html")) {
      files.push(`${dir}/${item.name}`);
    }
  }
  return files;
}

const allFiles = getHtmlFiles(".");

allFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // In root index.html
  if (file === "./index.html") {
    content = content.replace(/href="blog\.html"/g, 'href="#blog"');
  } else {
    // Any other root html file
    if (file.split("/").length === 2 && file !== "./blog.html") {
      content = content.replace(/href="blog\.html"/g, 'href="index.html#blog"');
    } else {
      // Nested files
      content = content.replace(
        /href="\.\.\/blog\.html"/g,
        'href="../index.html#blog"',
      );
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated links in ${file}`);
  }
});
