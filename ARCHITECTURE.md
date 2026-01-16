# Architecture & Data Flow

This document explains how the different components work together.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SharePoint Online                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Satellite_Fixed List                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │   │
│  │  │   Title    │  │ NORAD_ID   │  │   COSPAR_ID      │   │   │
│  │  ├────────────┤  ├────────────┤  ├──────────────────┤   │   │
│  │  │ ISS        │  │ 25544      │  │ 1998-067A        │   │   │
│  │  │ Hubble     │  │ 20580      │  │ 1990-037B        │   │   │
│  │  │ JWST       │  │ 51463      │  │ 2021-130A        │   │   │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↑                                     │
│                             │                                     │
│                       REST API Calls                              │
│                      (POST, GET, PATCH)                           │
│                             ↑                                     │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Browser / SharePoint Page                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Add New Satellite Dialog Form                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Satellite Name: [_________________]              │  │   │
│  │  │  NORAD ID:       [_________________]              │  │   │
│  │  │  COSPAR ID:      [_________________]              │  │   │
│  │  │  Mission Type:   [_________________]              │  │   │
│  │  │  Status:         [Operational    v]              │  │   │
│  │  │  Orbit Type:     [_________________]              │  │   │
│  │  │  Launch Date:    [_________________]              │  │   │
│  │  │  Sensor Names:   [_________________]              │  │   │
│  │  │                                                    │  │   │
│  │  │                      [ Submit ] [ Cancel ]        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           │                              │   │
│  │                           ↓                              │   │
│  │                  (Submit button clicked)                │   │
│  │                           │                              │   │
│  │                           ↓                              │   │
│  │        ┌──────────────────────────────────┐             │   │
│  │        │   form-handler.js                │             │   │
│  │        │                                  │             │   │
│  │        │  1. Collect form data            │             │   │
│  │        │  2. Validate fields              │             │   │
│  │        │  3. Show loading indicator       │             │   │
│  │        │  4. Call satelliteManager        │             │   │
│  │        │  5. Handle response              │             │   │
│  │        │  6. Show success/error message   │             │   │
│  │        │  7. Close dialog & refresh list  │             │   │
│  │        └──────────────────────────────────┘             │   │
│  │                      │                                  │   │
│  │                      ↓                                  │   │
│  │        ┌──────────────────────────────────┐             │   │
│  │        │   satellite-api.js               │             │   │
│  │        │   (SatelliteManager Class)       │             │   │
│  │        │                                  │             │   │
│  │        │  • addSatellite()                │             │   │
│  │        │  • getSatellites()               │             │   │
│  │        │  • updateSatellite()             │             │   │
│  │        │  • deleteSatellite()             │             │   │
│  │        │  • Error handling                │             │   │
│  │        │  • Request digest management     │             │   │
│  │        └──────────────────────────────────┘             │   │
│  │                      │                                  │   │
│  │                      ↓                                  │   │
│  │             REST API Call                              │   │
│  │        (JSON payload + headers)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Adding a Satellite

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User fills form and clicks Submit                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Satellite Name: "ISS (ZARYA)"                                  │
│  NORAD ID: "25544"                                              │
│  COSPAR ID: "1998-067A"                                          │
│  Status: "Operational"                                          │
│  ...                                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: form-handler.js catches submit event                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  handleSatelliteFormSubmit(event) {                             │
│    event.preventDefault();                                      │
│    ... (prevent page reload)                                    │
│  }                                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Collect data from form inputs                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  collectFormData(form) returns:                                 │
│  {                                                              │
│    title: "ISS (ZARYA)",                                        │
│    noradId: "25544",                                            │
│    cosparId: "1998-067A",                                        │
│    status: "Operational",                                       │
│    ...                                                           │
│  }                                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Validate required fields                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  validateSatelliteData(satelliteData) {                         │
│    if (!satelliteData.title) throw Error(...);                  │
│    if (!satelliteData.noradId) throw Error(...);                │
│    if (!satelliteData.cosparId) throw Error(...);               │
│    // ... more validations                                      │
│  }                                                              │
│                                                                   │
│  Result: ✓ Validation passed                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Show loading indicator                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  showLoadingIndicator(true) {                                   │
│    // Show spinner and "Processing..." message                  │
│  }                                                              │
│                                                                   │
│  ┌────────────────────────┐                                     │
│  │ ⟳                     │                                     │
│  │ Processing satellite  │                                     │
│  │ data...               │                                     │
│  └────────────────────────┘                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Call SatelliteManager.addSatellite()                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  await satelliteManager.addSatellite({                          │
│    title: "ISS (ZARYA)",                                        │
│    noradId: "25544",                                            │
│    ...                                                           │
│  })                                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: SatelliteManager prepares REST API call                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  const payload = {                                              │
│    'Title': 'ISS (ZARYA)',                                      │
│    'NORAD_ID': '25544',                                         │
│    'COSPAR_ID': '1998-067A',                                    │
│    'Status': 'Operational',                                     │
│    ...                                                           │
│  };                                                             │
│                                                                   │
│  const response = await fetch(                                  │
│    '/_api/web/lists/getbytitle(.../items',                     │
│    {                                                            │
│      method: 'POST',                                            │
│      headers: {                                                 │
│        'X-RequestDigest': 'abc123...',                          │
│        'Content-Type': 'application/json'                       │
│      },                                                         │
│      body: JSON.stringify(payload)                              │
│    }                                                            │
│  );                                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
              (Network request to SharePoint)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: SharePoint processes request                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /_api/web/lists/getbytitle('Satellite_Fixed')/items      │
│                                                                   │
│  Response 201 Created:                                          │
│  {                                                              │
│    "Id": 42,                                                    │
│    "Title": "ISS (ZARYA)",                                      │
│    "NORAD_ID": "25544",                                         │
│    "COSPAR_ID": "1998-067A",                                    │
│    ...                                                           │
│  }                                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: Form handler receives response                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  const result = await response.json();                          │
│  console.log('Success! Satellite ID:', result.Id); // 42       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: Hide loading indicator                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  showLoadingIndicator(false);                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 11: Show success message                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  showSuccessMessage(                                            │
│    'Satellite "ISS (ZARYA)" has been added successfully!'     │
│  );                                                             │
│                                                                   │
│  ┌─────────────────────────────────────────┐                   │
│  │ ✓ Satellite "ISS (ZARYA)" has been   │                   │
│  │   added successfully!                  │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 12: Reset form                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  form.reset(); // Clear all input fields                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 13: Close dialog                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  window.parent.closeDialog(true);                               │
│  // OR                                                          │
│  window.parent.SP.UI.ModalDialog.commonModalDialogClose(...)   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 14: Refresh list view                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  location.reload(); // Reload page to show new item             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## File Responsibilities

### satellite-api.js
**Responsibility:** REST API Communication

```
┌─────────────────────────────────────┐
│   satellite-api.js                  │
│                                     │
│  SatelliteManager Class             │
│  ├─ Constructor                     │
│  ├─ getRequestDigest()              │
│  ├─ addSatellite() ────→ POST       │
│  ├─ getSatellites() ───→ GET        │
│  ├─ updateSatellite() → PATCH       │
│  ├─ deleteSatellite() → DELETE      │
│  └─ searchByNORADId()               │
│                                     │
│  ↓                                  │
│  REST API Calls to SharePoint       │
│                                     │
└─────────────────────────────────────┘
```

### form-handler.js
**Responsibility:** Form Handling & User Interaction

```
┌─────────────────────────────────────┐
│   form-handler.js                   │
│                                     │
│  Event Listeners                    │
│  ├─ Form Submit Events              │
│  └─ DOMContentLoaded                │
│                                     │
│  Main Functions                     │
│  ├─ handleSatelliteFormSubmit()     │
│  ├─ collectFormData()               │
│  ├─ validateSatelliteData()         │
│  └─ getSubmitButton()               │
│                                     │
│  User Feedback                      │
│  ├─ showLoadingIndicator()          │
│  ├─ showSuccessMessage()            │
│  ├─ showErrorMessage()              │
│  └─ showToast()                     │
│                                     │
│  UI Actions                         │
│  ├─ closeDialogIfNeeded()           │
│  ├─ refreshSharePointList()         │
│  └─ Form reset                      │
│                                     │
│  ↑                                  │
│  Uses SatelliteManager              │
│                                     │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
                      Form Submission
                            ↓
          ┌─────────────────────────────────┐
          │ Collect Form Data               │
          └────────┬────────────────────────┘
                   ↓
          ┌─────────────────────────────────┐
          │ Validate Required Fields        │
          └────────┬────────────┬───────────┘
                   │            │
              VALID │            │ INVALID
                   ↓            ↓
          ┌──────────────┐  ┌─────────────────────────┐
          │ Submit Data  │  │ Show Error Message      │
          │ to SharePoint│  │ "Title is required"     │
          └────┬─────────┘  │ Enable Submit Button    │
               │            │ Highlight Error Fields  │
        SUCCESS │ FAILURE   └─────────────────────────┘
          ┌─────┴──────┐
          ↓            ↓
      ┌────────┐  ┌─────────────────────┐
      │ Show   │  │ Show Error Message   │
      │Success │  │ "Network error"     │
      │Message │  │ Enable Submit Button │
      │        │  │ Retry Option        │
      └────────┘  └─────────────────────┘
          ↓
       Reset Form
       Close Dialog
       Refresh List
```

## Integration Points

### Where Your Code Goes

```
SharePoint Page
│
├─ Script Editor Web Part (or Master Page)
│  │
│  ├─ <script src="satellite-api.js"></script>
│  │  │ Creates: SatelliteManager class
│  │  │
│  │  └─ Globally available as: satelliteManager
│  │
│  ├─ <script src="form-handler.js"></script>
│  │  │ Creates: Form submit handlers
│  │  │
│  │  └─ Automatically attaches to forms
│  │
│  └─ Your Dialog Form
│     │
│     └─ [Submit Button]
│        │ On click:
│        ├─ handleSatelliteFormSubmit() called
│        ├─ collectFormData()
│        ├─ validateSatelliteData()
│        ├─ satelliteManager.addSatellite()
│        │  │
│        │  └─ REST API Call
│        │
│        └─ Show success/error
```

## Data Transformation

```
Form Input Fields          SharePoint Column Names
─────────────────────────────────────────────────────
Satellite Name       ───→  Title
NORAD ID            ───→  NORAD_ID
COSPAR ID           ───→  COSPAR_ID
Mission Type        ───→  Mission_Type
Status              ───→  Status
Orbit Type          ───→  Orbit_Type
Launch Date         ───→  Launch_Date
Sensor Names        ───→  Sensor_Names


JavaScript Object      REST API JSON
─────────────────────────────────────────
{
  title: "ISS",  ────→ "Title": "ISS",
  noradId: "25544", → "NORAD_ID": "25544",
  cosparId: "1998-067A" → "COSPAR_ID": "1998-067A",
  ...
}
```

## Dependencies

```
form-handler.js
  ↓
  Depends on: SatelliteManager (from satellite-api.js)
  │
  ├─ window.satelliteManager
  │
  └─ Requires: Request Digest (__REQUESTDIGEST)
      │
      └─ Provided by: SharePoint (_spPageContextInfo)


satellite-api.js
  ↓
  Depends on: REST API endpoints
  │
  ├─ SharePoint Site URL
  │
  └─ List: Satellite_Fixed
      │
      └─ Columns: Title, NORAD_ID, COSPAR_ID, etc.
```

---

**For more information, see:**
- [README.md](./README.md) - Complete API reference
- [QUICK_START.md](./QUICK_START.md) - Implementation guide
- [FORM_INTEGRATION.md](./FORM_INTEGRATION.md) - Form setup guide
