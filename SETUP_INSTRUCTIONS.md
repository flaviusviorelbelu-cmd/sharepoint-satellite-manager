# Complete Setup Instructions

## Your Question Answered: Where to Put the Code

You asked: **"I dont know where to put this code... where do I put it?"**

**Answer:** You put it in a **Script Editor Web Part** on your SharePoint page. This guide shows you exactly how.

---

## Option 1: Script Editor Web Part (RECOMMENDED - Easiest)

### Step 1: Go to Your SharePoint Page

1. Open your SharePoint site
2. Navigate to the page with your "Add New Satellite" dialog
3. Click **Edit** in the top-right corner

### Step 2: Add Script Editor Web Part

1. Click **+ Add a web part** (or **Insert** → **Web Part**)
2. Search for **"Script Editor"**
3. Click to add it
4. Click **EDIT SNIPPET** in the web part

### Step 3: Copy & Paste This Complete Code

Copy this entire code block and paste it into the Script Editor:

```html
<!-- ============================================================ -->
<!-- SATELLITE MANAGER COMPLETE INTEGRATION                      -->
<!-- ============================================================ -->

<!-- Step 1: Load the REST API library -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>

<!-- Step 2: Load the form handler that connects everything -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/form-handler.js"></script>

<!-- Step 3: Animation styles for notifications -->
<style>
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>

<!-- Step 4: Status indicator -->
<div style="padding: 15px; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
    <p style="margin: 0; color: #666; font-size: 14px;">
        <strong>✓ Satellite Manager Integration Active</strong>
    </p>
    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
        Your "Add New Satellite" form will automatically submit data to the Satellite_Fixed list.
    </p>
</div>

<!-- Step 5: Verification script -->
<script>
    // This verifies everything loaded correctly
    document.addEventListener('DOMContentLoaded', function() {
        console.log('=== Satellite Manager Initialization ===');
        console.log('SatelliteManager API:', typeof satelliteManager !== 'undefined' ? '✓ Loaded' : '✗ Not Loaded');
        console.log('Form Handler:', typeof handleSatelliteFormSubmit !== 'undefined' ? '✓ Loaded' : '✗ Not Loaded');
        console.log('Request Digest:', document.getElementById('__REQUESTDIGEST') ? '✓ Present' : '✗ Missing');
        console.log('Status: Ready to process forms');
    });
</script>

<!-- ============================================================ -->
```

### Step 4: Save

1. Click **Save** button in the Script Editor
2. Click **Save** again to save the page

### Step 5: Test It

1. **Open browser DevTools** (Press F12)
2. **Go to Console tab**
3. You should see:
   ```
   === Satellite Manager Initialization ===
   SatelliteManager API: ✓ Loaded
   Form Handler: ✓ Loaded
   Request Digest: ✓ Present
   Status: Ready to process forms
   ```

---

## Option 2: Site Assets Library (For Production)

If you want to host the scripts yourself instead of using GitHub CDN:

### Step 1: Upload Scripts

1. Download from GitHub:
   - `satellite-api.js`
   - `form-handler.js`

2. Go to **Site Assets** library
3. Upload both files

### Step 2: Update URLs in Script Editor

Change the script URLs to your local copies:

```html
<!-- Change FROM: -->
<script src="https://raw.githubusercontent.com/.../satellite-api.js"></script>

<!-- Change TO: -->
<script src="/sites/yoursite/SiteAssets/satellite-api.js"></script>

<!-- Same for form-handler.js -->
<script src="/sites/yoursite/SiteAssets/form-handler.js"></script>
```

---

## What Each Script Does

### satellite-api.js
**What it does:** Handles all communication with SharePoint

```
When you submit a form:
1. Collects the data you entered
2. Creates a properly formatted REST API request
3. Sends it to SharePoint's REST API
4. Gets the response (success or error)
5. Returns the result
```

**Creates:** `satelliteManager` object globally

**Can do:**
- Add satellites (`satelliteManager.addSatellite(data)`)
- Get satellites (`satelliteManager.getSatellites()`)
- Update satellites (`satelliteManager.updateSatellite(id, data)`)
- Delete satellites (`satelliteManager.deleteSatellite(id)`)
- Search satellites (`satelliteManager.searchByNORADId('25544')`)

---

### form-handler.js
**What it does:** Handles your dialog form and coordinates everything

```
When you fill out the form and click Submit:
1. Catches the submit event (prevents page reload)
2. Collects data from all form fields
3. Validates required fields (Title, NORAD ID, COSPAR ID)
4. Shows a loading spinner
5. Calls satelliteManager.addSatellite() to send to SharePoint
6. Shows success or error message
7. Closes the dialog
8. Refreshes the satellite list
```

**Sets up:**
- Automatic form detection
- Submit button handling
- Validation of required fields
- Error handling
- User notifications
- Dialog management
- List refresh

---

## How They Work Together

```
Your Dialog Form
     │
     │ (user clicks Submit)
     ↓
form-handler.js
     │
     ├─ Collect data from form fields
     ├─ Validate fields
     ├─ Show loading indicator
     │
     └─ Call: satelliteManager.addSatellite()
          │
          ↓
    satellite-api.js
          │
          ├─ Format data for SharePoint
          ├─ Get authentication token
          │
          └─ Send REST API request
               │
               ↓
          SharePoint
               │
               → Creates new record
               → Returns success with ID
               │
               ↓
          Back to form-handler.js
               │
               ├─ Hide loading indicator
               ├─ Show success message
               ├─ Reset form fields
               ├─ Close dialog
               └─ Refresh list view
```

---

## Testing Your Setup

### Test 1: Scripts Loaded Correctly

1. Open DevTools (F12)
2. Go to **Console** tab
3. Type: `satelliteManager`
4. Press Enter
5. Should see the SatelliteManager class object

**If you see:** `satelliteManager: {constructor: ƒ, ...}`
✅ Script loaded correctly!

**If you see:** `Uncaught ReferenceError: satelliteManager is not defined`
❌ Script didn't load - check URL is correct

---

### Test 2: Form Handler Attached

1. In Console, type: `handleSatelliteFormSubmit`
2. Press Enter
3. Should see the function definition

**If you see:** `handleSatelliteFormSubmit: ƒ(event) { ... }`
✅ Form handler loaded!

**If you see:** `Uncaught ReferenceError: handleSatelliteFormSubmit is not defined`
❌ Form handler didn't load - check URL

---

### Test 3: Request Digest Available

1. In Console, type: `document.getElementById('__REQUESTDIGEST').value`
2. Press Enter
3. Should see a long string like: `0x123ABC...`

**If you see a token:**
✅ SharePoint authentication ready!

**If you see:** `null` or `undefined`
❌ Request digest not found - reload the page

---

### Test 4: Actually Add a Satellite

1. Open your "Add New Satellite" dialog
2. Fill in test data:
   - **Satellite Name**: "Test ISS Copy"
   - **NORAD ID**: "99999"
   - **COSPAR ID**: "2024-001A"
   - Other fields: Optional
3. Click **Submit**
4. Watch the Console

**You should see:**
```
[FormHandler] Form submission started
[FormHandler] Collecting form data...
[FormHandler] Form data collected: {...}
[FormHandler] Validating required fields...
[SatelliteManager] Adding satellite: {...}
[SatelliteManager] Satellite added successfully: {Id: 42, Title: ...}
[FormHandler] Success! Satellite added with ID: 42
```

**Then:**
- Loading spinner appears and disappears
- Success message shows
- Dialog closes
- Page refreshes
- New satellite appears in list

✅ **Everything working!**

---

## Troubleshooting

### Problem: "satelliteManager is not defined"

**Cause:** satellite-api.js didn't load

**Solution:**
1. Check Network tab (F12 → Network)
2. Filter by XHR or Script
3. Look for satellite-api.js
4. If shows red (404 error): URL is wrong
5. If shows 200 (OK): Script loaded but might have error

**Fix:**
```
❌ Wrong: https://raw.github.../satellite-api.js
✅ Right: https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js
```

---

### Problem: Form submits but nothing happens

**Cause:** SharePoint returned an error

**Solution:**
1. Check Console for error messages
2. Look for specific errors like:
   - "403 Forbidden" = User doesn't have permission
   - "400 Bad Request" = Data format wrong
   - "404 Not Found" = List or column name wrong

**Common fixes:**
- Verify user has Edit permissions on Satellite_Fixed list
- Reload page to refresh request digest
- Check column names match exactly: Title, NORAD_ID, COSPAR_ID

---

### Problem: "Cannot find theme color: Light1"

**Don't worry!** This is just a SharePoint theming warning and doesn't affect functionality. It's safe to ignore.

---

### Problem: Form submits but dialog doesn't close

**Why:** Some SharePoint deployments don't support the dialog closing function

**Solutions:**
- Manual close: User can close dialog themselves
- Page reload: Dialog will close when page refreshes
- Custom fix: Add specific code for your SharePoint version

---

## What Should Happen

### Complete Success Scenario

```
1. ✓ User opens "Add New Satellite" dialog
2. ✓ User fills in form fields
3. ✓ User clicks Submit button
4. ✓ Submit button disables (shows "Processing...")
5. ✓ Loading spinner appears
6. ✓ Form data sent to SharePoint
7. ✓ SharePoint creates new record
8. ✓ Loading spinner disappears
9. ✓ Success message appears ("Satellite added successfully!")
10. ✓ Form fields clear
11. ✓ Dialog closes
12. ✓ Page refreshes
13. ✓ New satellite visible in Satellite_Fixed list
```

---

## Next Steps

1. **Follow the instructions above** to add the code
2. **Open DevTools** to verify scripts loaded
3. **Test with a test satellite** before going to production
4. **Check the Satellite_Fixed list** to confirm data appears
5. **Customize** if needed (see FORM_INTEGRATION.md)

---

## Quick Reference

| What | Where |
|------|-------|
| Main API library | `satellite-api.js` |
| Form handler | `form-handler.js` |
| Complete docs | `README.md` |
| Form setup | `FORM_INTEGRATION.md` |
| Architecture | `ARCHITECTURE.md` |
| Examples | `examples.js` |
| This guide | `SETUP_INSTRUCTIONS.md` (you are here) |

---

## Questions?

1. **Check the browser Console** (F12) - it logs everything
2. **Look at Network tab** - see if requests are being sent
3. **Read FORM_INTEGRATION.md** - more detailed examples
4. **Read ARCHITECTURE.md** - understand how everything works

---

**You're all set! 🚀**

Your "Add New Satellite" dialog will now automatically submit data to SharePoint when the user clicks Submit.

**Last Updated:** January 16, 2026
