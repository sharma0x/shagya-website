# CRITICAL FIX: Firebase API Key Restrictions

## Problem

The Firebase phone authentication is failing with `auth/invalid-recaptcha-token` because the **Firebase Web API Key has HTTP referrer restrictions** that likely don't include `www.shayga.in`.

## Solution: Update API Key Restrictions in Google Cloud Console

### Step-by-Step Instructions

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials?project=shayga-web
   - Make sure you're logged in with: shayga.thesareestudio@gmail.com

2. **Find the Firebase Web API Key**
   - Look for an API key with the value: `AIzaSyBEdNQFql4fQFL1bKM21qs4iJ1H97IkQYI`
   - It might be named something like:
     - "Browser key (auto created by Firebase)"
     - "Web API key"
     - Or just "API key"

3. **Edit the API Key**
   - Click on the API key to open the details
   - Click "EDIT API KEY" button at the top

4. **Update Application Restrictions**
   - Under "Application restrictions", select: **HTTP referrers (web sites)**

5. **Add Website Restrictions**
   - In the "Website restrictions" section, add these referrers:
     ```
     www.shayga.in/*
     shayga.in/*
     localhost/*
     127.0.0.1/*
     shayga-web.firebaseapp.com/*
     shayga-web.web.app/*
     ```

   **Important**: Each line should be on a separate entry. Click "ADD AN ITEM" for each one.

6. **Verify API Restrictions (Optional)**
   - Under "API restrictions", you can leave it as:
     - **Don't restrict key** (recommended for Firebase)
     - OR restrict to only these APIs:
       - Identity Toolkit API
       - Token Service API
       - reCAPTCHA Enterprise API

7. **Save Changes**
   - Click "SAVE" at the bottom
   - Wait 1-2 minutes for changes to propagate

## Verification

After making these changes, test phone authentication on www.shayga.in:

1. Open: https://www.shayga.in/account/login
2. Click "Phone" tab
3. Enter phone number: +917678284684
4. Click "Send OTP"
5. Check browser console for these logs:
   ```
   [Firebase] ✅ reCAPTCHA Enterprise config initialized successfully
   [Phone auth] Initializing reCAPTCHA verifier on www.shayga.in
   [Phone auth] OTP sent successfully
   ```

## Alternative: Check Current Restrictions via gcloud CLI

If you have `gcloud` CLI installed:

```bash
# List all API keys
gcloud services api-keys list --project=shayga-web

# Describe specific key (replace KEY_ID)
gcloud services api-keys describe KEY_ID --project=shayga-web
```

## Why This Fix Works

Firebase SDKs make API calls to Google services using the API key. When you visit `www.shayga.in`:

1. Browser loads the page from `www.shayga.in`
2. Firebase SDK tries to fetch reCAPTCHA config with HTTP Referer: `https://www.shayga.in/`
3. Google's API server checks if `www.shayga.in` is in the allowed referrers list
4. **If NOT allowed**: Request fails → `auth/invalid-recaptcha-token`
5. **If allowed**: Request succeeds → reCAPTCHA works → OTP sent

## Current Status

- ✅ reCAPTCHA Enterprise key configured with both domains (shayga.in and www.shayga.in)
- ✅ Firebase Authentication settings point to correct reCAPTCHA key
- ✅ Code deployed with reCAPTCHA initialization
- ❌ **API key restrictions need to be updated** ← THIS IS THE BLOCKER

---

**Priority**: P0 - CRITICAL
**Action Required**: Update API key restrictions in Google Cloud Console
**Estimated Time**: 5 minutes
