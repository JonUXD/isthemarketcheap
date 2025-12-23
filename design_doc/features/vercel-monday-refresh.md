// FILE: pages/api/monday.js
// PURPOSE: Automatic Monday morning refresh to fix weekend stale data
// DEPLOY: Copy this file to your project, then deploy to Vercel

/**
 * Vercel Cron Job for Monday Morning Refresh
 * 
 * PROBLEM: Your current 24h ISR can leave stale weekend data showing on Monday morning
 * SOLUTION: This cron forces a fresh data fetch every Monday at market open time
 * 
 * HOW IT WORKS:
 * 1. Every Monday at 2 PM UTC (9 AM Eastern), Vercel calls this endpoint
 * 2. res.revalidate('/') forces Next.js to rebuild your homepage
 * 3. During rebuild, getStaticProps() fetches fresh data from Yahoo/CoinGecko
 * 4. Next visitor sees fresh Monday data instead of stale weekend data
 * 
 * SCHEDULE OPTIONS (cron format):
 * - Monday 9:30 AM Eastern = 13:30 UTC = schedule: '30 13 * * 1'
 * - Monday 10:00 AM Eastern = 14:00 UTC = schedule: '0 14 * * 1'  ← RECOMMENDED
 * - Monday 10:30 AM Eastern = 14:30 UTC = schedule: '30 14 * * 1'
 * - Monday 11:00 AM Eastern = 15:00 UTC = schedule: '0 15 * * 1'
 * 
 * YOUR CURRENT SETUP STAYS THE SAME:
 * - pages/index.js with revalidate: 86400 (24h) continues working
 * - This just adds a Monday-specific refresh on top
 * - No UI changes needed, no user buttons
 */

export default async function handler(req, res) {
  console.log('🔄 Monday refresh triggered at:', new Date().toISOString());
  
  try {
    // This is the magic line - forces Next.js to rebuild homepage
    await res.revalidate('/');
    console.log('✅ Successfully refreshed homepage');
    
    return res.json({ 
      success: true,
      message: 'Monday market refresh completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Monday refresh failed:', error);
    return res.status(500).json({ 
      error: 'Revalidation failed',
      details: error.message 
    });
  }
}

// Vercel Cron configuration - CHANGE TIME IF NEEDED
export const config = {
  type: 'experimental-scheduled',
  schedule: '0 14 * * 1', // ← Monday at 2 PM UTC (9 AM Eastern)
};

// ============================================================================
// DEPLOYMENT INSTRUCTIONS:
// 1. Copy this entire file
// 2. Create file at: your-project/pages/api/monday.js
// 3. Deploy to Vercel: git push or vercel --prod
// 4. Wait for next Monday to see it work
// 
// TO TEST IMMEDIATELY (without waiting for Monday):
// 1. Deploy first: vercel --prod
// 2. Get your URL: https://your-project.vercel.app
// 3. Manually trigger: curl https://your-project.vercel.app/api/monday
// 4. Visit your site to see fresh data
// 
// TO MONITOR:
// 1. Go to Vercel dashboard → your project
// 2. Click "Functions" tab
// 3. Look for "monday" function
// 4. Check logs for execution times
// ============================================================================