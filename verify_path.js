const path = require('path');
const fs = require('fs');

const dbPath = 'c:\\moussir26\\commercial_management_system-main\\commercial_management_system-main\\src\\backend';
const urlPath = 'product_6975273932607_1771957664027.png';

const uploadsRoot = path.join(dbPath, 'uploads', 'products');
const finalPath = path.join(uploadsRoot, urlPath);

console.log('Uploads Root:', uploadsRoot);
console.log('Final Path:', finalPath);
console.log('Exists:', fs.existsSync(finalPath));

const dirContent = fs.readdirSync(uploadsRoot);
console.log('Directory Content:', dirContent);
