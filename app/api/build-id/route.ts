import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    buildId: process.env.BUILD_ID || 'development',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
}
