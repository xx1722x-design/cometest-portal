const fs = require('fs');
const https = require('https');
const path = require('path');

function fetchGitTree(owner, repo, branch = 'master') {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      headers: {
        'User-Agent': 'Portal-Deep-Catalog-Generator/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.tree) {
            resolve(json.tree);
          } else if (json.message) {
            console.error(`API Error for ${owner}/${repo}: ${json.message}`);
            resolve([]);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error(`Parse error for ${owner}/${repo}:`, e.message);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error(`Network error for ${owner}/${repo}:`, err.message);
      resolve([]);
    });
  });
}

function extractCategory(filePath) {
  const parts = filePath.split('/');
  if (parts.length > 1) {
    return parts[0];
  }
  return 'root';
}

function extractItemName(filePath) {
  const fileName = filePath.split('/').pop();
  return fileName.replace(/\.[^/.]+$/, '');
}

function inferGenre(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.includes('game') || lower.includes('phaser')) return '2D Game';
  if (lower.includes('physics') || lower.includes('cloth') || lower.includes('particle')) return '3D Physics';
  if (lower.includes('shader') || lower.includes('glsl')) return 'Shaders';
  if (lower.includes('particle') || lower.includes('effect')) return 'Particle Effects';
  if (lower.includes('animation') || lower.includes('morph')) return 'Animation';
  if (lower.includes('light') || lower.includes('shadow')) return 'Lighting';
  if (lower.includes('fluid') || lower.includes('water') || lower.includes('ocean')) return '3D Fluid';
  if (lower.includes('planet') || lower.includes('star') || lower.includes('space')) return '3D Space';
  if (lower.includes('neural') || lower.includes('network')) return 'Data Visualization';
  if (lower.includes('volumetric') || lower.includes('voxel')) return '3D Volume Rendering';
  if (lower.includes('react') || lower.includes('r3f')) return 'React Three Fiber';
  if (lower.includes('three')) return '3D Graphics';

  return 'Interactive 3D';
}

async function generateDeepCatalog() {
  const csvRows = [];
  csvRows.push('Repository,Category,Item_Name,File_Path,Estimated_Genre,Description');

  const repos = [
    { owner: 'phaserjs', repo: 'examples', branch: 'master' },
    { owner: 'mrdoob', repo: 'three.js', branch: 'master' },
    { owner: 'pmndrs', repo: 'react-three-examples', branch: 'main' }
  ];

  for (const { owner, repo, branch } of repos) {
    console.log(`\n📥 Fetching ${owner}/${repo} (recursive tree)...`);

    try {
      const tree = await fetchGitTree(owner, repo, branch);

      if (!tree || tree.length === 0) {
        console.log(`   ⚠️  No tree data returned (trying alternate branch...)`);

        // Fallback: try 'main' if 'master' fails
        const altBranch = branch === 'master' ? 'main' : 'master';
        const altTree = await fetchGitTree(owner, repo, altBranch);
        if (altTree && altTree.length > 0) {
          console.log(`   ✓ Successfully fetched from branch '${altBranch}'`);
          processTree(owner, repo, altTree, csvRows);
        }
        continue;
      }

      processTree(owner, repo, tree, csvRows);
    } catch (err) {
      console.error(`Error processing ${owner}/${repo}:`, err.message);
    }
  }

  // Write CSV
  const csvContent = csvRows.join('\n');
  const outputPath = path.join(__dirname, 'repository_catalog_full.csv');

  try {
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`\n✅ Deep catalog created: ${outputPath}`);
    console.log(`📊 Total entries: ${csvRows.length - 1}`);
    console.log(`\n--- First 15 entries ---`);
    console.log(csvRows.slice(0, 15).join('\n'));
    console.log(`\n--- Last 5 entries ---`);
    console.log(csvRows.slice(-5).join('\n'));
    return true;
  } catch (err) {
    console.error(`❌ Error writing CSV: ${err.message}`);
    return false;
  }
}

function processTree(owner, repo, tree, csvRows) {
  const validExtensions = ['.js', '.ts', '.tsx', '.html'];
  let count = 0;

  // Filter only blobs (files) with valid extensions
  const files = tree.filter(item => {
    return item.type === 'blob' && validExtensions.some(ext => item.path.endsWith(ext));
  });

  console.log(`   ✓ Found ${files.length} source files`);

  for (const file of files) {
    const category = extractCategory(file.path);
    const itemName = extractItemName(file.path);
    const genre = inferGenre(file.path);
    const description = `${owner}/${repo} - ${file.path}`;

    csvRows.push(`${owner}/${repo},${category},${itemName},${file.path},${genre},"${description}"`);
    count++;
  }

  console.log(`   📝 Added ${count} entries to catalog`);
}

generateDeepCatalog().then(success => {
  process.exit(success ? 0 : 1);
});
