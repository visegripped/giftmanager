# Troubleshooting: Login Stuck on "Loading Profile"

## Issues Fixed

1. ✅ Apache headers module enabled
2. ✅ Composer dependencies installed
3. ✅ Database permissions granted
4. ✅ CORS headers fixed (no duplicates)
5. ✅ `.env.local` created with correct Docker URLs
6. ✅ All services restarted

## Current Status

All services running on correct ports:

- Frontend: http://localhost:5174
- API: http://localhost:8081/api.php ✅ CORS working
- Reporting: http://localhost:8081/reporting.php ✅ Working
- phpMyAdmin: http://localhost:8082 ✅ Working
- MySQL: 3307 ✅ Working

## Next Steps to Fix Your Browser

### Step 1: Hard Refresh Browser

- **Mac**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + R

### Step 2: If Still Stuck, Clear Everything

Open browser console (F12) and run:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Sign In Again

1. Go to http://localhost:5174
2. Click "Sign in" button
3. Sign in with Google
4. Should now load your profile!

## Verify API is Working

In browser console (F12), run:

```javascript
fetch('http://localhost:8081/api.php', {
  method: 'POST',
  body: new FormData(),
})
  .then((r) => r.json())
  .then(console.log);
```

Should see: `{error: "Access token not specified on API request."}`

This proves the API is responding and CORS is working!

## If You Still Have Issues

### Check Environment Variables

In browser console:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Reporting URL:', import.meta.env.VITE_REPORTING_API_URL);
```

Should show:

- `http://localhost:8081/api.php`
- `http://localhost:8081/reporting.php`

If not, you need to rebuild the frontend:

```bash
docker-compose down frontend
docker-compose up -d --build frontend
```

### Check Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Sign in
4. Look for request to `api.php`
5. Check the Response Headers for `Access-Control-Allow-Origin: *`

### Common Solutions

**Problem**: Old production URLs being used
**Solution**:

```bash
# Make sure .env.local exists and has correct values
cat .env.local | grep VITE_API_URL
# Should show: VITE_API_URL=http://localhost:8081/api.php
```

**Problem**: Container not picking up environment
**Solution**:

```bash
docker-compose down
docker-compose up -d
```

**Problem**: Browser caching old config
**Solution**: Clear cache and hard refresh

## Quick Reset (Nuclear Option)

If nothing works:

```bash
# Stop everything
docker-compose down

# Clear browser completely
# Open browser console and run:
# localStorage.clear(); sessionStorage.clear();

# Start fresh
docker-compose up -d

# Wait 30 seconds
sleep 30

# Go to http://localhost:5174
# Sign in
```

## What Changed

The CORS issue was caused by duplicate headers (Apache + PHP both setting them).

Now only PHP scripts set CORS headers, and they properly handle OPTIONS preflight requests.

Try the hard refresh now!
