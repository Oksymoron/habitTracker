const fs = require('fs')
const path = require('path')

// Generate version.json at build time
const version = {
  version: process.env.npm_package_version || '1.0.0',
  buildTime: new Date().toISOString(),
  commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'dev',
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
}

const outputPath = path.join(__dirname, '../public/version.json')

fs.writeFileSync(outputPath, JSON.stringify(version, null, 2))

console.log('[Build] Generated version.json:', version)
