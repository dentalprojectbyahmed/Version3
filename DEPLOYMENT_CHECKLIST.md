# Deployment Checklist - Abdullah Dental Care

## ✅ Pre-Deployment Checklist

### 1. Google OAuth Setup
- [ ] Go to https://console.cloud.google.com
- [ ] Create project: "Abdullah Dental Care"
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized origins:
  - [ ] http://localhost:5173 (development)
  - [ ] https://your-app.vercel.app (production)
- [ ] Copy Client ID
- [ ] Save Client ID securely

### 2. Environment Configuration
- [ ] Create `.env` file in project root
- [ ] Add: `VITE_GOOGLE_CLIENT_ID=your_client_id_here`
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test login locally

### 3. GitHub Repository
- [ ] Create GitHub account (if needed)
- [ ] Create new repository: "abdullah-dental-care"
- [ ] Set repository to Public or Private
- [ ] Push code to GitHub:
  ```bash
  git remote add origin https://github.com/yourusername/abdullah-dental-care.git
  git branch -M main
  git push -u origin main
  ```

### 4. Vercel Deployment
- [ ] Create Vercel account at https://vercel.com
- [ ] Connect GitHub account
- [ ] Import "abdullah-dental-care" repository
- [ ] Configure project:
  - [ ] Framework: Vite
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
- [ ] Add environment variable:
  - [ ] Key: `VITE_GOOGLE_CLIENT_ID`
  - [ ] Value: (your Google Client ID)
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy deployment URL

### 5. Update Google OAuth
- [ ] Go back to Google Cloud Console
- [ ] Edit OAuth Client ID
- [ ] Add production URL to authorized origins:
  - [ ] https://your-app.vercel.app
- [ ] Save changes

### 6. Test Production Deployment
- [ ] Open production URL
- [ ] Test Google login
- [ ] Create test patient
- [ ] Create test appointment
- [ ] Generate test invoice
- [ ] Download PDF
- [ ] Test offline mode
- [ ] Test on mobile device

### 7. Custom Domain (Optional)
- [ ] Purchase domain (e.g., abdullahdentalcare.com)
- [ ] Add domain in Vercel dashboard
- [ ] Update DNS records
- [ ] Wait for SSL certificate (automatic)
- [ ] Update Google OAuth origins

### 8. Google Sheets Setup (Optional)
- [ ] Open app Settings page
- [ ] Click "Connect Google Sheets"
- [ ] Authorize access
- [ ] Test "Sync Up" button
- [ ] Verify data in Google Sheets
- [ ] Test "Sync Down" button

---

## 🚀 Quick Deploy Commands

### Local Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel (CLI)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Run Tests
```bash
# Run Playwright tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run specific test
npx playwright test tests/complete.spec.js
```

---

## 📋 Post-Deployment Tasks

### 1. Data Migration
- [ ] Export data from old system (if any)
- [ ] Import patients
- [ ] Import appointments
- [ ] Import invoices
- [ ] Verify all data

### 2. User Training
- [ ] Train Dr. Ahmed on all features
- [ ] Train Naveed on user features
- [ ] Create user manual
- [ ] Record demo videos

### 3. Backup Setup
- [ ] Connect Google Sheets
- [ ] Schedule regular syncs
- [ ] Test restore process
- [ ] Document backup procedure

### 4. Monitoring
- [ ] Check Vercel analytics
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Set up uptime monitoring (optional)

### 5. Maintenance
- [ ] Update dependencies monthly
- [ ] Review and update treatments
- [ ] Update exchange rates
- [ ] Check storage usage

---

## 🔧 Troubleshooting

### Problem: "Google Sign-In failed"
**Solution:**
1. Check `.env` file has correct Client ID
2. Verify domain is in Google OAuth authorized origins
3. Clear browser cache and try again

### Problem: "Access Denied" after login
**Solution:**
1. Check email is in authorized list (AuthContext.jsx)
2. Add new emails to AUTHORIZED_USERS array

### Problem: Build fails on Vercel
**Solution:**
1. Check Vercel build logs
2. Verify all dependencies are in package.json
3. Try building locally first
4. Contact Vercel support if needed

### Problem: Data not syncing to Google Sheets
**Solution:**
1. Check Google OAuth scopes include Sheets API
2. Verify spreadsheet ID is saved in settings
3. Check browser console for errors
4. Re-authorize Google access

### Problem: PDFs not generating
**Solution:**
1. Check logo file exists in public/assets/
2. Verify clinic settings are filled
3. Check browser console for errors
4. Test in different browser

---

## 📞 Support Contacts

**Technical Issues:**
- Check documentation in project
- Review error logs in browser console
- Contact: ahmedakg@gmail.com

**Vercel Support:**
- https://vercel.com/support

**Google Cloud Support:**
- https://console.cloud.google.com/support

---

## ✅ Deployment Complete!

Once all checkboxes are ticked:
- ✅ App is live
- ✅ Users can login
- ✅ Data is backed up
- ✅ All features working
- ✅ Mobile responsive
- ✅ Offline capable
- ✅ FREE forever

**Production URL:** https://your-app.vercel.app

**Cost:** $0/month

**Status:** LIVE 🚀
