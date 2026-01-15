# Form Integration Guide

This guide explains how to integrate the SatelliteManager with your "Add New Satellite" dialog form in SharePoint.

## Problem Overview

You have a dialog form that needs to submit satellite data to the "Satellite_Fixed" list using the REST API instead of traditional SharePoint forms.

## Solution: Using SatelliteManager

### Step 1: Load the Script

Add the script reference to your SharePoint page or Script Editor web part:

```html
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>
```

Or if uploaded to Site Assets:

```html
<script src="/sites/yoursite/SiteAssets/satellite-api.js"></script>
```

### Step 2: Collect Form Data

Your form has these fields:
- Satellite Name → maps to `Title`
- NORAD ID → maps to `NORAD_ID`
- COSPAR ID → maps to `COSPAR_ID`
- Mission Type → maps to `Mission_Type`
- Status → maps to `Status`
- Orbit Type → maps to `Orbit_Type`
- Launch Date → maps to `Launch_Date`
- Sensor Names → maps to `Sensor_Names`

### Step 3: Create Your Form Handler

**Option A: If you're using a dialog box (most likely)**

```javascript
// When the user clicks Submit on your dialog
function submitSatelliteForm() {
    // Get all form values from your dialog
    const satelliteName = document.querySelector('[name="Satellite Name"]')?.value;
    const noradId = document.querySelector('[name="NORAD ID"]')?.value;
    const cosparId = document.querySelector('[name="COSPAR ID"]')?.value;
    const missionType = document.querySelector('[name="Mission Type"]')?.value;
    const status = document.querySelector('[name="Status"]')?.value;
    const orbitType = document.querySelector('[name="Orbit Type"]')?.value;
    const launchDate = document.querySelector('[name="Launch Date"]')?.value;
    const sensorNames = document.querySelector('[name="Sensor Names"]')?.value;

    // Validate required fields
    if (!satelliteName || !noradId || !cosparId) {
        alert('Please fill in Satellite Name, NORAD ID, and COSPAR ID');
        return false;
    }

    // Submit to SharePoint
    submitToSharePoint({
        title: satelliteName,
        noradId: noradId,
        cosparId: cosparId,
        missionType: missionType,
        status: status,
        orbitType: orbitType,
        launchDate: launchDate,
        sensorNames: sensorNames
    });
}

async function submitToSharePoint(formData) {
    try {
        // Show loading indicator
        console.log('Submitting satellite data...');

        // Add the satellite
        const result = await satelliteManager.addSatellite(formData);

        console.log('Success! Satellite added with ID:', result.Id);

        // Success actions
        alert('Satellite added successfully!');
        
        // Close the dialog
        if (window.parent && window.parent.closeDialog) {
            window.parent.closeDialog(true);
        }
        
        // Refresh the list view
        location.reload();

    } catch (error) {
        console.error('Error submitting satellite:', error);
        alert('Error: ' + error.message);
    }
}
```

**Option B: If you're using a standard HTML form**

```html
<!-- Your form -->
<form id="satelliteForm">
    <input type="text" name="Satellite Name" required>
    <input type="text" name="NORAD ID" required>
    <input type="text" name="COSPAR ID" required>
    <input type="text" name="Mission Type">
    <select name="Status">
        <option>Operational</option>
        <option>Retired</option>
        <option>Under Development</option>
    </select>
    <input type="text" name="Orbit Type">
    <input type="date" name="Launch Date">
    <textarea name="Sensor Names"></textarea>
    <button type="submit">Submit</button>
</form>

<script>
document.getElementById('satelliteForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        // Collect form data
        const formData = new FormData(this);
        
        // Submit using SatelliteManager
        const result = await satelliteManager.addSatellite({
            title: formData.get('Satellite Name'),
            noradId: formData.get('NORAD ID'),
            cosparId: formData.get('COSPAR ID'),
            missionType: formData.get('Mission Type'),
            status: formData.get('Status'),
            orbitType: formData.get('Orbit Type'),
            launchDate: formData.get('Launch Date'),
            sensorNames: formData.get('Sensor Names')
        });

        alert('Satellite added successfully! ID: ' + result.Id);
        this.reset();
        location.reload();

    } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
    }
});
</script>
```

### Step 4: Handle Errors Gracefully

```javascript
async function handleFormSubmit(formData) {
    try {
        // Validate input
        if (!formData.title?.trim()) {
            throw new Error('Satellite Name is required');
        }
        if (!formData.noradId?.trim()) {
            throw new Error('NORAD ID is required');
        }
        if (!formData.cosparId?.trim()) {
            throw new Error('COSPAR ID is required');
        }

        // Disable submit button to prevent double-submission
        const submitBtn = document.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Submit
        const result = await satelliteManager.addSatellite(formData);

        // Success
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = false;
        
        alert('Satellite added successfully!');
        return result;

    } catch (error) {
        // Re-enable button
        const submitBtn = document.querySelector('[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';

        // Show error
        console.error('Submission error:', error);
        alert('Error: ' + error.message);
        
        throw error;
    }
}
```

## Complete Example: Dialog Form Handler

If your dialog has an ID like `satelliteForm`, here's a complete implementation:

```javascript
// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('satelliteForm');
    if (form) {
        form.addEventListener('submit', handleSatelliteFormSubmit);
    }
});

// Handle form submission
async function handleSatelliteFormSubmit(event) {
    event.preventDefault();

    // Get form element
    const form = event.target;

    try {
        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        // Collect values from form inputs
        const satelliteData = {
            title: form.querySelector('[name="Satellite Name"]').value,
            noradId: form.querySelector('[name="NORAD ID"]').value,
            cosparId: form.querySelector('[name="COSPAR ID"]').value,
            missionType: form.querySelector('[name="Mission Type"]').value || '',
            status: form.querySelector('[name="Status"]').value || 'Operational',
            orbitType: form.querySelector('[name="Orbit Type"]').value || '',
            launchDate: form.querySelector('[name="Launch Date"]').value || '',
            sensorNames: form.querySelector('[name="Sensor Names"]').value || ''
        };

        // Validate required fields
        if (!satelliteData.title.trim()) {
            throw new Error('Satellite Name is required');
        }
        if (!satelliteData.noradId.trim()) {
            throw new Error('NORAD ID is required');
        }
        if (!satelliteData.cosparId.trim()) {
            throw new Error('COSPAR ID is required');
        }

        // Submit to SharePoint
        console.log('Submitting satellite data...', satelliteData);
        const result = await satelliteManager.addSatellite(satelliteData);

        // Success response
        console.log('Satellite added successfully with ID:', result.Id);
        
        // Show success message
        alert(`Success! Satellite "${satelliteData.title}" has been added.`);

        // Reset form
        form.reset();

        // Close dialog if using SharePoint dialog
        if (window.parent && window.parent.SP && window.parent.SP.UI.ModalDialog) {
            window.parent.SP.UI.ModalDialog.commonModalDialogClose(
                window.parent.SP.UI.DialogResult.OK,
                true
            );
        } else {
            // Fallback: reload or navigate
            location.reload();
        }

    } catch (error) {
        console.error('Form submission error:', error);
        alert('Error: ' + error.message);
        
        // Re-enable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}
```

## Date Handling

If you're using an HTML date input, it returns YYYY-MM-DD format which is perfect for SharePoint:

```javascript
// From: <input type="date" name="Launch Date">
const launchDate = form.querySelector('[name="Launch Date"]').value;
// Value will be: "2021-12-25" (already ISO format)

// If using a different format, convert it:
const date = new Date(launchDate);
const isoDate = date.toISOString().split('T')[0]; // "2021-12-25"
```

## Testing Your Integration

### 1. Check Browser Console

Open DevTools (F12) → Console and look for:

```
[SatelliteManager] Initialized successfully
[SatelliteManager] Adding satellite: {...}
[SatelliteManager] Satellite added successfully: {...}
```

### 2. Verify in SharePoint

Go to your Satellite_Fixed list and check if the new record appears.

### 3. Test Error Scenarios

- Leave required fields empty
- Use invalid date formats
- Check network errors in F12 → Network tab

## Troubleshooting

### Problem: "Cannot find theme color: Light1"

This is a SharePoint theming warning - it's safe to ignore.

### Problem: "Element not found: id: 'satelliteForm'"

The form doesn't exist with that ID. Either:
- Give your form an ID: `<form id="satelliteForm">`
- Or update the selector in your code

### Problem: 403 Forbidden Error

Your user account doesn't have permission to edit the list. Check list permissions.

### Problem: Form submits but nothing happens

Check:
1. Browser console for errors
2. Request digest is valid (reload page)
3. SharePoint list columns match exactly
4. User has Edit permissions on the list

## Next Steps

1. Copy the form handler code to your SharePoint page
2. Test with the browser console open
3. Verify data appears in your list
4. Add success/error notifications as needed
5. Deploy to production

## Additional Resources

- [SharePoint REST API Documentation](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service)
- [OData Query Filter Examples](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests)
- [Main README](./README.md)
- [Code Examples](./examples.js)
