const fs = require('fs');

function patch(file, isMenu) {
  let data = fs.readFileSync(file, 'utf8');
  
  // Replace names
  data = data.replace(/RestaurantHeader/g, 'DummyHeader');
  data = data.replace(/RestaurantProfile/g, 'DummyProfile');
  data = data.replace(/RestaurantMenuList/g, 'DummyMenuList');

  // Replace links in next/link format
  data = data.replace(/href=\{`\/\$\{restaurant\.city\}\/\$\{restaurant\.slug\}`\}/g, 'href={`/dummy?number=${restaurant.phone}`}');
  data = data.replace(/href=\{`\/\$\{restaurant\.city\}\/\$\{restaurant\.slug\}\/menu`\}/g, 'href={`/dummy/menu?number=${restaurant.phone}`}');
  data = data.replace(/href=\{`\/\$\{restaurant\.city\}\/\$\{restaurant\.slug\}\/cart`\}/g, 'href={`/dummy?number=${restaurant.phone}`}');

  // For string cases
  data = data.replace(/`\/\$\{restaurant\.city\}\/\$\{restaurant\.slug\}\/menu`/g, '`/dummy/menu?number=${restaurant.phone}`');
  data = data.replace(/`\/\$\{restaurant\.city\}\/\$\{restaurant\.slug\}\/cart`/g, '`/dummy/menu?number=${restaurant.phone}`');

  // Replace component imports
  data = data.replace(/@\/components\/public\/RestaurantHeader/g, '@/components/dummy/DummyHeader');
  
  fs.writeFileSync(file, data);
}

patch('components/dummy/DummyHeader.js', false);
patch('components/dummy/DummyProfile.js', false);
patch('components/dummy/DummyMenuList.js', true);

console.log("Patched!");
