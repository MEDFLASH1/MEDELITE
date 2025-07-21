#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validates CSS class usage between HTML and CSS files
 */

function extractCSSClasses(cssContent) {
  const classes = new Set();
  
  // Match CSS class selectors
  const classMatches = cssContent.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
  
  classMatches.forEach(match => {
    // Remove the dot and any pseudo-selectors
    const className = match.substring(1).split(':')[0].split('[')[0];
    if (className && !className.includes('\\')) {
      classes.add(className);
    }
  });
  
  return classes;
}

function extractHTMLClasses(htmlContent) {
  const classes = new Set();
  
  // Match class attributes
  const classMatches = htmlContent.match(/class\s*=\s*["'][^"']*["']/g) || [];
  
  classMatches.forEach(match => {
    // Extract class names from class="..." or class='...'
    const classValue = match.match(/["']([^"']*)["']/)[1];
    const classNames = classValue.split(/\s+/).filter(Boolean);
    
    classNames.forEach(className => {
      if (className && !className.includes('{')) {
        classes.add(className);
      }
    });
  });
  
  return classes;
}

function extractJSClasses(jsContent) {
  const classes = new Set();
  
  // Match className additions, toggles, etc.
  const patterns = [
    /classList\.add\(['"`]([^'"`]+)['"`]\)/g,
    /classList\.toggle\(['"`]([^'"`]+)['"`]\)/g,
    /classList\.remove\(['"`]([^'"`]+)['"`]\)/g,
    /className\s*=\s*['"`]([^'"`]+)['"`]/g,
    /addClass\(['"`]([^'"`]+)['"`]\)/g,
    /removeClass\(['"`]([^'"`]+)['"`]\)/g
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(jsContent)) !== null) {
      const classNames = match[1].split(/\s+/).filter(Boolean);
      classNames.forEach(className => classes.add(className));
    }
  });
  
  return classes;
}

function validateCSSUsage() {
  console.log('🔍 Validating CSS class usage...\n');
  
  // Read all relevant files
  const htmlFiles = ['index.html'];
  const cssFiles = [
    'styles.css',
    'variables.css',
    'layout.css',
    'dashboard.css',
    'responsive.css',
    'footer.css',
    'apple-mobile.css',
    'section-styles.css',
    'dashboard-modern.css',
    'modern-login-styles.css',
    'login-redesign.css',
    'meta-dark-theme.css'
  ];
  const jsFiles = ['app-functional.js', 'dashboard-enhanced.js'];
  
  // Collect all CSS classes
  const allCSSClasses = new Set();
  const cssFileClasses = new Map();
  
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const classes = extractCSSClasses(content);
      cssFileClasses.set(file, classes);
      classes.forEach(cls => allCSSClasses.add(cls));
    }
  });
  
  // Check improved CSS files
  const improvedCSSDir = 'css-improved';
  if (fs.existsSync(improvedCSSDir)) {
    const improvedFiles = fs.readdirSync(improvedCSSDir)
      .filter(file => file.endsWith('.css'));
      
    improvedFiles.forEach(file => {
      const filePath = path.join(improvedCSSDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const classes = extractCSSClasses(content);
      cssFileClasses.set(`${improvedCSSDir}/${file}`, classes);
      classes.forEach(cls => allCSSClasses.add(cls));
    });
  }
  
  // Check improved main CSS
  if (fs.existsSync('styles-improved.css')) {
    const content = fs.readFileSync('styles-improved.css', 'utf-8');
    const classes = extractCSSClasses(content);
    cssFileClasses.set('styles-improved.css', classes);
    classes.forEach(cls => allCSSClasses.add(cls));
  }
  
  // Collect all used classes from HTML and JS
  const allUsedClasses = new Set();
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const classes = extractHTMLClasses(content);
      classes.forEach(cls => allUsedClasses.add(cls));
    }
  });
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const classes = extractJSClasses(content);
      classes.forEach(cls => allUsedClasses.add(cls));
    }
  });
  
  // Find unused CSS classes
  const unusedClasses = [...allCSSClasses].filter(cls => !allUsedClasses.has(cls));
  
  // Find missing CSS classes (used but not defined)
  const missingClasses = [...allUsedClasses].filter(cls => !allCSSClasses.has(cls));
  
  // Report results
  console.log('📊 CSS USAGE VALIDATION REPORT\n');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 STATISTICS:`);
  console.log(`   Total CSS classes defined: ${allCSSClasses.size}`);
  console.log(`   Total classes used in HTML/JS: ${allUsedClasses.size}`);
  console.log(`   Unused CSS classes: ${unusedClasses.length}`);
  console.log(`   Missing CSS classes: ${missingClasses.length}`);
  
  if (unusedClasses.length > 0) {
    console.log(`\n⚠️  UNUSED CSS CLASSES (${unusedClasses.length}):`);
    
    // Group by file for better organization
    cssFileClasses.forEach((classes, file) => {
      const fileUnused = unusedClasses.filter(cls => classes.has(cls));
      if (fileUnused.length > 0) {
        console.log(`\n   📄 ${file}:`);
        fileUnused.slice(0, 10).forEach(cls => {
          console.log(`      - .${cls}`);
        });
        if (fileUnused.length > 10) {
          console.log(`      ... and ${fileUnused.length - 10} more`);
        }
      }
    });
  }
  
  if (missingClasses.length > 0) {
    console.log(`\n❌ MISSING CSS CLASSES (${missingClasses.length}):`);
    missingClasses.slice(0, 20).forEach(cls => {
      console.log(`   - .${cls}`);
    });
    if (missingClasses.length > 20) {
      console.log(`   ... and ${missingClasses.length - 20} more`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  
  if (unusedClasses.length === 0 && missingClasses.length === 0) {
    console.log('✅ Perfect CSS usage! All classes are properly used.');
  } else {
    console.log('💡 RECOMMENDATIONS:');
    
    if (unusedClasses.length > 0) {
      console.log('   - Remove unused CSS classes to reduce file size');
      console.log('   - Consider using PurgeCSS for automatic cleanup');
    }
    
    if (missingClasses.length > 0) {
      console.log('   - Define missing CSS classes or remove unused HTML classes');
      console.log('   - Check for typos in class names');
    }
    
    console.log('   - Use the improved CSS structure for better organization');
  }
  
  // Calculate optimization potential
  const optimizationPotential = Math.round((unusedClasses.length / allCSSClasses.size) * 100);
  if (optimizationPotential > 20) {
    console.log(`\n🎯 OPTIMIZATION POTENTIAL: ${optimizationPotential}%`);
    console.log('   Consider CSS cleanup to improve loading performance');
  }
  
  return {
    totalCSSClasses: allCSSClasses.size,
    totalUsedClasses: allUsedClasses.size,
    unusedClasses: unusedClasses.length,
    missingClasses: missingClasses.length,
    optimizationPotential
  };
}

// Main execution
if (require.main === module) {
  try {
    const results = validateCSSUsage();
    
    // Exit with error code if there are critical issues
    if (results.missingClasses > 10 || results.optimizationPotential > 50) {
      console.log('\n❌ CSS validation failed due to critical issues');
      process.exit(1);
    } else {
      console.log('\n✅ CSS validation completed');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during CSS validation:', error.message);
    process.exit(1);
  }
}

module.exports = { validateCSSUsage };