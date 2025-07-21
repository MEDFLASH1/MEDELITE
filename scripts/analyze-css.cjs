#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Analyzes CSS files for potential issues and improvements
 */

const CSS_FILES = [
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
  'meta-dark-theme.css',
  'styles-improved.css'
];

function analyzeCSSFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const analysis = {
    file: path.basename(filePath),
    size: Buffer.byteLength(content, 'utf8'),
    lines: lines.length,
    selectors: (content.match(/[^{}]+\s*{/g) || []).length,
    properties: (content.match(/\s*[a-z-]+\s*:/g) || []).length,
    colors: (content.match(/#[0-9a-fA-F]{3,6}/g) || []).length,
    important: (content.match(/!important/g) || []).length,
    variables: (content.match(/--[a-z-]+/g) || []).length,
    mediaQueries: (content.match(/@media/g) || []).length,
    keyframes: (content.match(/@keyframes/g) || []).length,
    issues: []
  };

  // Check for potential issues
  if (analysis.important > 5) {
    analysis.issues.push(`High !important usage: ${analysis.important} instances`);
  }

  if (analysis.size > 50000) {
    analysis.issues.push(`Large file size: ${Math.round(analysis.size / 1024)}KB`);
  }

  // Check for duplicate color values
  const colorMatches = content.match(/#[0-9a-fA-F]{3,6}/g) || [];
  const uniqueColors = [...new Set(colorMatches)];
  if (colorMatches.length > uniqueColors.length * 1.5) {
    analysis.issues.push('Potential duplicate colors detected');
  }

  // Check for very long selectors
  const longSelectors = content.match(/[^{}]{60,}(?=\s*{)/g);
  if (longSelectors && longSelectors.length > 0) {
    analysis.issues.push(`${longSelectors.length} overly specific selectors found`);
  }

  return analysis;
}

function generateReport(analyses) {
  console.log('\n📊 CSS ANALYSIS REPORT\n');
  console.log('=' .repeat(50));

  let totalSize = 0;
  let totalSelectors = 0;
  let totalProperties = 0;
  let totalIssues = 0;

  analyses.forEach(analysis => {
    if (!analysis) return;

    totalSize += analysis.size;
    totalSelectors += analysis.selectors;
    totalProperties += analysis.properties;
    totalIssues += analysis.issues.length;

    console.log(`\n📄 ${analysis.file}`);
    console.log(`   Size: ${Math.round(analysis.size / 1024)}KB`);
    console.log(`   Lines: ${analysis.lines}`);
    console.log(`   Selectors: ${analysis.selectors}`);
    console.log(`   Properties: ${analysis.properties}`);
    console.log(`   CSS Variables: ${analysis.variables}`);
    console.log(`   Media Queries: ${analysis.mediaQueries}`);
    console.log(`   Animations: ${analysis.keyframes}`);
    console.log(`   !important: ${analysis.important}`);

    if (analysis.issues.length > 0) {
      console.log(`   ⚠️  Issues:`);
      analysis.issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    } else {
      console.log(`   ✅ No issues found`);
    }
  });

  console.log('\n' + '=' .repeat(50));
  console.log('📈 SUMMARY:');
  console.log(`   Total CSS Size: ${Math.round(totalSize / 1024)}KB`);
  console.log(`   Total Selectors: ${totalSelectors}`);
  console.log(`   Total Properties: ${totalProperties}`);
  console.log(`   Total Issues: ${totalIssues}`);

  if (totalIssues === 0) {
    console.log('\n✅ No critical issues found in CSS files!');
  } else {
    console.log(`\n⚠️  Found ${totalIssues} issues that should be addressed.`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (totalSize > 100000) {
    console.log('   - Consider CSS optimization and minification');
    console.log('   - Remove unused CSS with PurgeCSS');
  }

  if (totalIssues > 10) {
    console.log('   - Review and refactor CSS for better maintainability');
    console.log('   - Consider adopting a CSS methodology like BEM');
  }

  console.log('   - Use the improved CSS structure in css-improved/ folder');
  console.log('   - Run CSS linting with: npm run lint:css');
  console.log('   - Consider using CSS custom properties for better theming');
}

// Main execution
console.log('🔍 Analyzing CSS files...');

const analyses = CSS_FILES.map(file => {
  const filePath = path.join(process.cwd(), file);
  return analyzeCSSFile(filePath);
}).filter(Boolean);

// Also analyze the improved CSS files
const improvedCSSDir = path.join(process.cwd(), 'css-improved');
if (fs.existsSync(improvedCSSDir)) {
  const improvedFiles = fs.readdirSync(improvedCSSDir)
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(improvedCSSDir, file);
      return analyzeCSSFile(filePath);
    })
    .filter(Boolean);
    
  analyses.push(...improvedFiles);
}

generateReport(analyses);

console.log('\n🎯 To use the improved CSS structure:');
console.log('   1. Replace styles.css import with styles-improved.css in index.html');
console.log('   2. Remove redundant CSS file imports');
console.log('   3. Test the application thoroughly');
console.log('   4. Run CSS validation with: npm run css:validate');