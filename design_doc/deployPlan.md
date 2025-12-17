# Vercel Production Deployment Plan

## Phase 1: Pre-Deployment (Local)
1. Fix API timeout risk in `lib/price-service.js`
2. Create `.env.local` with any API keys
3. Create `next.config.js` with basic config
4. Test `npm run build` locally

## Phase 2: Vercel Setup
5. Connect GitHub repo at vercel.com
6. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
7. Add environment variables in Vercel dashboard

## Phase 3: Deployment
8. Deploy first version (auto from GitHub)
9. Verify ISR working (24h revalidation)

## Phase 4: Post-Deployment
10. Add monitoring (Vercel Analytics)
11. Set up custom domain (optional)

## Time: 30-60 minutes