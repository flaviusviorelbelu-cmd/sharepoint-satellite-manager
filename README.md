# SharePoint Satellite Manager

A production-ready JavaScript library for managing satellite records in SharePoint's "Satellite_Fixed" list using the REST API.

## 🚀 Features

- ✅ **Create** - Add new satellite records
- ✅ **Read** - Retrieve satellites (all, by ID, or filtered)
- ✅ **Update** - Modify existing satellite data
- ✅ **Delete** - Remove satellite records
- ✅ **Search** - Find satellites by NORAD ID or name
- ✅ **Error Handling** - Comprehensive error management with logging
- ✅ **Security** - Automatic request digest handling for SharePoint authentication
- ✅ **Type Safety** - JSDoc documentation for better IDE support

## 📋 Prerequisites

- SharePoint Online or SharePoint 2019+
- Access to a SharePoint site with the "Satellite_Fixed" list
- JavaScript enabled in browser
- Request digest element (`__REQUESTDIGEST`) on the page (standard in SharePoint)

## 📦 Installation

### Option 1: Download and Upload to SharePoint

1. Clone or download this repository
2. Upload `satellite-api.js` to your SharePoint Site Assets library
3. Reference it in your SharePoint page or script editor web part

### Option 2: Direct CDN Reference

Add the following to your SharePoint page HTML:

```html
<script src="https://raw.githubusercontent.com/flaviusviorelbelu-cmd/sharepoint-satellite-manager/main/satellite-api.js"></script>
```

## 🔧 Quick Start

Once the script is loaded, the `satelliteManager` object is automatically initialized.

### Add a New Satellite

```javascript
await satelliteManager.addSatellite({
    title: 'ISS (ZARYA)',
    noradId: '25544',
    cosparId: '1998-067A',
    missionType: 'Space Station',
    status: 'Operational',
    orbitType: 'Low Earth Orbit',
    launchDate: '1998-11-20',
    sensorNames: 'Cupola, Destiny Module, Columbus Module'
});
```

### Get All Satellites

```javascript
const satellites = await satelliteManager.getSatellites({ top: 50 });
console.log(satellites);
```

### Search by NORAD ID

```javascript
const results = await satelliteManager.searchByNORADId('25544');
console.log(results);
```

### Update a Satellite

```javascript
await satelliteManager.updateSatellite(1, {
    'Status': 'Under Maintenance',
    'Sensor_Names': 'Updated sensor list'
});
```

### Delete a Satellite

```javascript
await satelliteManager.deleteSatellite(1);
```

## 📖 API Reference

### SatelliteManager Class

#### Constructor

```javascript
const manager = new SatelliteManager(siteUrl);
```

**Parameters:**
- `siteUrl` (string, optional): SharePoint site URL. Defaults to current site.

---

#### addSatellite(satelliteData)

Adds a new satellite record to the Satellite_Fixed list.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | Satellite name |
| `noradId` | string | ✅ Yes | NORAD catalog number |
| `cosparId` | string | ✅ Yes | COSPAR designation |
| `missionType` | string | ❌ No | Mission type (e.g., "Earth Observation") |
| `status` | string | ❌ No | Operational status (default: "Operational") |
| `orbitType` | string | ❌ No | Orbit classification |
| `launchDate` | string | ❌ No | Launch date (ISO format: YYYY-MM-DD) |
| `sensorNames` | string | ❌ No | Comma-separated sensor list |

**Returns:** Promise<Object> - The created item with SharePoint ID

**Example:**

```javascript
const newSat = await satelliteManager.addSatellite({
    title: 'Hubble Space Telescope',
    noradId: '20580',
    cosparId: '1990-037B',
    missionType: 'Space Telescope',
    launchDate: '1990-04-24'
});
console.log('Added satellite with ID:', newSat.Id);
```

---

#### getSatellites(options)

Retrieves satellites from the list with optional filtering.

**Parameters:**

```javascript
{
    top: 100,              // Number of items to retrieve
    filter: "Status eq 'Operational'"  // OData filter
}
```

**Returns:** Promise<Array> - Array of satellite objects

**Examples:**

```javascript
// Get first 50 satellites
const all = await satelliteManager.getSatellites({ top: 50 });

// Get only operational satellites
const operational = await satelliteManager.getSatellites({ 
    filter: "Status eq 'Operational'" 
});

// Get satellites by mission type
const earth = await satelliteManager.getSatellites({ 
    filter: "Mission_Type eq 'Earth Observation'" 
});
```

---

#### getSatelliteById(itemId)

Retrieves a specific satellite by SharePoint item ID.

**Parameters:**
- `itemId` (number): SharePoint list item ID

**Returns:** Promise<Object> - Single satellite record

**Example:**

```javascript
const satellite = await satelliteManager.getSatelliteById(1);
console.log(satellite.Title);
```

---

#### updateSatellite(itemId, satelliteData)

Updates an existing satellite record.

**Parameters:**
- `itemId` (number): SharePoint list item ID
- `satelliteData` (Object): Fields to update

**Returns:** Promise<boolean> - True if successful

**Example:**

```javascript
await satelliteManager.updateSatellite(1, {
    'Status': 'Under Maintenance',
    'Sensor_Names': 'Updated sensors'
});
```

---

#### deleteSatellite(itemId)

Deletes a satellite record from the list.

**Parameters:**
- `itemId` (number): SharePoint list item ID

**Returns:** Promise<boolean> - True if successful

**Example:**

```javascript
if (confirm('Delete this satellite?')) {
    await satelliteManager.deleteSatellite(1);
}
```

---

#### searchByNORADId(noradId)

Searches for satellites by NORAD ID.

**Parameters:**
- `noradId` (string): NORAD catalog number

**Returns:** Promise<Array> - Matching satellite records

**Example:**

```javascript
const iss = await satelliteManager.searchByNORADId('25544');
console.log(iss[0].Title); // "ISS (ZARYA)"
```

---

#### searchByTitle(title)

Searches for satellites by name (substring match).

**Parameters:**
- `title` (string): Satellite name or partial name

**Returns:** Promise<Array> - Matching satellite records

**Example:**

```javascript
const results = await satelliteManager.searchByTitle('ISS');
console.log(`Found ${results.length} satellites matching 'ISS'`);
```

## 🎯 Integration with Your Form Dialog

To integrate with your "Add New Satellite" dialog form:

### Step 1: Reference the Script

Add to your SharePoint page or Master Page:

```html
<script src="/sites/yoursite/SiteAssets/satellite-api.js"></script>
```

### Step 2: Handle Form Submission

```javascript
// Get your form data from the dialog
const satelliteData = {
    title: document.querySelector('[name="Satellite Name"]').value,
    noradId: document.querySelector('[name="NORAD ID"]').value,
    cosparId: document.querySelector('[name="COSPAR ID"]').value,
    missionType: document.querySelector('[name="Mission Type"]').value,
    status: document.querySelector('[name="Status"]').value,
    orbitType: document.querySelector('[name="Orbit Type"]').value,
    launchDate: document.querySelector('[name="Launch Date"]').value,
    sensorNames: document.querySelector('[name="Sensor Names"]').value
};

// Submit to SharePoint
try {
    const result = await satelliteManager.addSatellite(satelliteData);
    console.log('Success! Satellite ID:', result.Id);
    // Close dialog, refresh list, etc.
} catch (error) {
    console.error('Error:', error.message);
    // Show error to user
}
```

### Step 3: Submit Button Handler

```javascript
document.getElementById('submitBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    
    try {
        // Collect form data
        const formData = new FormData(document.getElementById('satelliteForm'));
        const data = Object.fromEntries(formData);
        
        // Submit
        const result = await satelliteManager.addSatellite({
            title: data['Satellite Name'],
            noradId: data['NORAD ID'],
            cosparId: data['COSPAR ID'],
            missionType: data['Mission Type'],
            status: data['Status'],
            orbitType: data['Orbit Type'],
            launchDate: data['Launch Date'],
            sensorNames: data['Sensor Names']
        });
        
        alert('Satellite added successfully!');
        // Close dialog, refresh SharePoint list, etc.
        location.reload();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
```

## 🔍 OData Filter Examples

When using `getSatellites()` with filters, use OData syntax:

```javascript
// By status
"Status eq 'Operational'"

// By mission type
"Mission_Type eq 'Earth Observation'"

// By launch date range
"Launch_Date ge '1990-01-01' and Launch_Date le '2000-12-31'"

// Contains text (case-sensitive)
"substringof('ISS', Title)"

// Multiple conditions
"Status eq 'Operational' and Mission_Type eq 'Space Telescope'"

// Not equals
"Status ne 'Retired'"
```

## 📊 SharePoint List Column Mapping

This script maps to the following Satellite_Fixed list columns:

| Variable | SharePoint Column | Type | Notes |
|----------|------------------|------|-------|
| `title` | `Title` | Text | Required, unique |
| `noradId` | `NORAD_ID` | Text | International catalog number |
| `cosparId` | `COSPAR_ID` | Text | Designation ID |
| `missionType` | `Mission_Type` | Text | e.g., Earth Observation |
| `status` | `Status` | Choice | Operational, Retired, etc. |
| `orbitType` | `Orbit_Type` | Text | LEO, GEO, etc. |
| `launchDate` | `Launch_Date` | Date | ISO format |
| `sensorNames` | `Sensor_Names` | Text | Comma-separated |

## ⚠️ Error Handling

All methods throw errors that can be caught:

```javascript
try {
    await satelliteManager.addSatellite(data);
} catch (error) {
    if (error.message.includes('Required fields')) {
        console.log('Missing required fields');
    } else if (error.message.includes('SharePoint API error')) {
        console.log('SharePoint error:', error.message);
    } else {
        console.log('Unexpected error:', error);
    }
}
```

## 🔐 Security Considerations

1. **Request Digest**: Automatically handled by the library
2. **CORS**: SharePoint same-origin policy is respected
3. **User Permissions**: Only users with list permissions can perform operations
4. **Data Validation**: Validate input before sending to SharePoint

```javascript
// Always validate critical fields
if (!satelliteData.noradId || satelliteData.noradId.trim() === '') {
    throw new Error('NORAD ID is required');
}
```

## 🐛 Debugging

The library logs all operations to the console:

```
[SatelliteManager] Adding satellite: {...}
[SatelliteManager] Satellite added successfully: {...}
```

Open browser DevTools (F12) → Console tab to see all activity.

## 📝 License

MIT License - Feel free to use in your projects

## 🤝 Contributing

Contributions welcome! Please submit issues or pull requests.

## 📞 Support

For issues or questions, check:
1. Browser console for error messages
2. SharePoint list for permission issues
3. REST API documentation: [Microsoft Docs](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service)

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
