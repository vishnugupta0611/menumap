const fs = require('fs');

function patchImages(file) {
  let data = fs.readFileSync(file, 'utf8');
  // First, remove existing referrerPolicy to avoid duplicates
  data = data.replace(/referrerPolicy="no-referrer"/g, '');
  // Now add it to all <img tags
  data = data.replace(/<img\b/g, '<img referrerPolicy="no-referrer"');
  fs.writeFileSync(file, data);
}

patchImages('components/dummy/DummyHeader.js');
patchImages('components/dummy/DummyProfile.js');
patchImages('components/dummy/DummyMenuList.js');
console.log("Images patched with better regex!");
