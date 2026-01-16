# Quick Start: Complete Implementation

This guide shows exactly where to put the code in your SharePoint page.

## 🎯 Where to Put the Code

You have 3 options:

### Option 1: Script Editor Web Part (Easiest for SharePoint Online)

1. Go to your SharePoint page with the "Add New Satellite" dialog
2. Click **Edit** (top right)
3. Click **+ Add a web part** (or **Insert** → **Web Part**)
4. Search for and add **Script Editor** web part
5. Click **EDIT SNIPPET** in the web part
6. Paste the code below:

```html
<!-- Step 1: Load the SatelliteManager library -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>

<!-- Step 2: Load the form handler -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/form-handler.js"></script>

<!-- Step 3: Custom CSS (optional, for notifications) -->
<style>
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
</style>

<div id="initialization-message" style="padding: 10px; color: #666;">
    ✓ Satellite Manager loaded and ready!
</div>

<script>
    // Verify both scripts are loaded
    document.addEventListener('DOMContentLoaded', function() {
        const msg = document.getElementById('initialization-message');
        if (typeof satelliteManager !== 'undefined') {
            msg.innerHTML = '✓ Satellite Manager loaded and ready!';
            msg.style.color = '#4caf50';
            console.log('✓ All systems ready!');
        } else {
            msg.innerHTML = '⚠ Satellite Manager not loaded';
            msg.style.color = '#f44336';
            console.error('✗ Satellite Manager not loaded');
        }
    });
</script>
```

7. Click **Save**

---

### Option 2: Add to Master Page (For All Pages)

1. Go to **Site Settings** → **Master pages**
2. Edit your Master Page
3. Add these lines in the `<head>` section:

```html
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/form-handler.js"></script>
```

---

### Option 3: Site Assets Library (Recommended for Production)

**Upload to Site Assets and use local references:**

1. Download both files:
   - `satellite-api.js`
   - `form-handler.js`

2. Upload to **Site Assets** library

3. In your Script Editor web part, use:

```html
<script src="/sites/yoursite/SiteAssets/satellite-api.js"></script>
<script src="/sites/yoursite/SiteAssets/form-handler.js"></script>
```

---

## ✅ Verification Checklist

After adding the code:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **You should see:**
   ```
   [SatelliteManager] Initialized successfully
   [FormHandler] Initializing satellite form handler
   [FormHandler] Found satellite form, attaching submit handler
   ```

4. **If you see errors:**
   - Check that both script URLs are correct
   - Check network tab to see if scripts loaded
   - Make sure SharePoint allows external CDN scripts

---

## 🧪 Test the Integration

### Test Step 1: Open Your Dialog

1. Navigate to your "Add New Satellite" dialog
2. Open DevTools Console (F12)
3. You should see the initialization messages

### Test Step 2: Try Adding a Satellite

1. Fill in the form with test data:
   - **Satellite Name**: "Test Satellite 1"
   - **NORAD ID**: "99999"
   - **COSPAR ID**: "2024-001A"
   - **Mission Type**: "Test"
   - **Status**: "Operational"
   - **Other fields**: Optional

2. Click **Submit**

3. In Console, you should see:
   ```
   [FormHandler] Form submission started
   [FormHandler] Collecting form data...
   [SatelliteManager] Adding satellite: {...}
   [SatelliteManager] Satellite added successfully: {...}
   ```

### Test Step 3: Verify in SharePoint

1. Go to your **Satellite_Fixed** list
2. You should see the new record!

---

## 🐛 Troubleshooting

### Problem: "satelliteManager is not defined"

**Solution:**
- Check that `satellite-api.js` loaded (see Network tab in DevTools)
- Wait for page to fully load before testing
- Check URL is correct and accessible

### Problem: "Form submission started" but no success message

**Solution:**
- Check Console tab for specific error message
- Verify required fields are filled (Title, NORAD ID, COSPAR ID)
- Check user permissions on Satellite_Fixed list
- Check if request digest is valid (might need to reload page)

### Problem: Form submits but dialog doesn't close

**Solution:**
- This is normal for SPFx web parts
- You can manually close the dialog or it will close after page refresh
- Or add custom dialog closing code if needed

### Problem: Loading indicator spins forever

**Solution:**
- Check browser console for errors
- Check Network tab to see if request was sent
- Might be permission issue - check user access to list

---

## 📝 What the Code Does

### `satellite-api.js` (Library)
- Provides `SatelliteManager` class
- Handles REST API calls to SharePoint
- Manages authentication (request digest)
- Validates data before sending

### `form-handler.js` (Integration)
- Automatically finds your form
- Collects form data when submitted
- Validates required fields
- Shows loading indicator
- Submits to SharePoint using SatelliteManager
- Shows success/error messages
- Closes dialog if needed
- Refreshes the list

---

## 🔧 Customization

### Change the Success Message

Find this in `form-handler.js`:

```javascript
function showSuccessMessage(message) {
    alert(message);
}
```

Replace `alert()` with custom UI:

```javascript
function showSuccessMessage(message) {
    showToast(message, 'success');  // Use the built-in toast instead
}
```

### Disable Auto-Refresh

Find this in `form-handler.js`:

```javascript
// Refresh the satellite list
refreshSharePointList();
```

Comment it out:

```javascript
// Refresh the satellite list
// refreshSharePointList();
```

### Change Required Fields

Find this in `form-handler.js`:

```javascript
function validateSatelliteData(satelliteData) {
    if (!satelliteData.title) {
        throw new Error('Satellite Name is required');
    }
    // ... more validations
}
```

Remove any validation you don't need.

---

## 📚 Full Implementation Example

Here's a complete Script Editor snippet ready to copy-paste:

```html
<!-- ===== SATELLITE MANAGER INTEGRATION ===== -->

<!-- Load SatelliteManager API -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>

<!-- Load Form Handler -->
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/form-handler.js"></script>

<!-- Animation Styles -->
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

<div style="padding: 15px; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
    <p style="margin: 0; color: #666; font-size: 14px;">
        ✓ Satellite Form Integration Active
    </p>
    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
        Your form will now submit to the Satellite_Fixed list automatically.
    </p>
</div>

<script>
    console.log('=== Satellite Manager Integration ===');
    console.log('Status: ', typeof satelliteManager !== 'undefined' ? '✓ Ready' : '✗ Not Ready');
    console.log('Form Handler: ', typeof handleSatelliteFormSubmit !== 'undefined' ? '✓ Ready' : '✗ Not Ready');
</script>

<!-- ===== END SATELLITE MANAGER INTEGRATION ===== -->
```

---

## ✨ You're All Set!

Your "Add New Satellite" dialog should now:
- ✅ Collect form data
- ✅ Validate required fields
- ✅ Submit to Satellite_Fixed list
- ✅ Show success/error messages
- ✅ Close dialog automatically
- ✅ Refresh the list view

**Questions?** Check the console for detailed logs (F12 → Console tab).

---

**Last Updated:** January 16, 2026
