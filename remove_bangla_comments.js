const fs = require('fs');
const path = require('path');

const bengaliRegex = /[\u0980-\u09F2\u09F4-\u09FF]/; // Excluding ৳ (09F3)

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove single line comments containing Bengali
    content = content.replace(/\/\/.*[\u0980-\u09F2\u09F4-\u09FF].*$/gm, '');

    // Remove multi-line comments containing Bengali
    // Note: this regex might not perfectly match all multi-line comments if they are nested, but should work for standard cases.
    content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        if (bengaliRegex.test(match)) {
            return '';
        }
        return match;
    });

    // Remove JSX comments containing Bengali: {/* ... */}
    content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => {
        if (bengaliRegex.test(match)) {
            return '';
        }
        return match;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed:', filePath);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
            processFile(fullPath);
        }
    }
}

walkDir('./storefront');
walkDir('./admin-dashboard');
walkDir('./enterprise-backend');
console.log('Done');
