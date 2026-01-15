/**
 * Usage Examples for SatelliteManager
 * These examples demonstrate how to use the satellite-api.js script
 */

// ============================================================================
// EXAMPLE 1: Add a New Satellite
// ============================================================================
async function addNewSatellite() {
    try {
        const newSatellite = await satelliteManager.addSatellite({
            title: 'ISS (ZARYA)',
            noradId: '25544',
            cosparId: '1998-067A',
            missionType: 'Space Station',
            status: 'Operational',
            orbitType: 'Low Earth Orbit',
            launchDate: '1998-11-20',
            sensorNames: 'Cupola, Destiny Module, Columbus Module'
        });

        console.log('New satellite added:', newSatellite);
        alert('Satellite added successfully! ID: ' + newSatellite.Id);
    } catch (error) {
        console.error('Failed to add satellite:', error.message);
        alert('Error: ' + error.message);
    }
}

// ============================================================================
// EXAMPLE 2: Get All Satellites
// ============================================================================
async function viewAllSatellites() {
    try {
        const satellites = await satelliteManager.getSatellites({ top: 50 });
        
        console.table(satellites.map(s => ({
            ID: s.Id,
            Title: s.Title,
            'NORAD ID': s.NORAD_ID,
            'COSPAR ID': s.COSPAR_ID,
            Status: s.Status
        })));

        return satellites;
    } catch (error) {
        console.error('Failed to fetch satellites:', error.message);
    }
}

// ============================================================================
// EXAMPLE 3: Search by NORAD ID
// ============================================================================
async function findSatelliteByNORAD() {
    try {
        const results = await satelliteManager.searchByNORADId('25544');
        
        if (results.length > 0) {
            console.log('Found satellite:', results[0]);
            return results[0];
        } else {
            console.log('No satellite found with NORAD ID 25544');
        }
    } catch (error) {
        console.error('Search failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 4: Search by Title/Name
// ============================================================================
async function findSatelliteByName() {
    try {
        const results = await satelliteManager.searchByTitle('ISS');
        
        console.log(`Found ${results.length} satellite(s) matching 'ISS'`);
        results.forEach(sat => {
            console.log(`- ${sat.Title} (NORAD: ${sat.NORAD_ID})`);
        });

        return results;
    } catch (error) {
        console.error('Search failed:', error.message);
    }
}

// ============================================================================
// EXAMPLE 5: Get Specific Satellite by SharePoint ID
// ============================================================================
async function getSingleSatellite() {
    try {
        const satellite = await satelliteManager.getSatelliteById(1);
        console.log('Satellite details:', satellite);
        return satellite;
    } catch (error) {
        console.error('Failed to fetch satellite:', error.message);
    }
}

// ============================================================================
// EXAMPLE 6: Update a Satellite
// ============================================================================
async function updateSatelliteStatus() {
    try {
        // First, find the satellite
        const satellites = await satelliteManager.searchByNORADId('25544');
        
        if (satellites.length === 0) {
            console.log('Satellite not found');
            return;
        }

        const satId = satellites[0].Id;

        // Update specific fields
        await satelliteManager.updateSatellite(satId, {
            'Status': 'Under Maintenance',
            'Sensor_Names': 'Cupola, Destiny Module, Columbus Module, Observational Equipment'
        });

        console.log('Satellite updated successfully');
    } catch (error) {
        console.error('Failed to update satellite:', error.message);
    }
}

// ============================================================================
// EXAMPLE 7: Delete a Satellite
// ============================================================================
async function deleteSatelliteRecord() {
    try {
        const confirmation = confirm('Are you sure you want to delete this satellite?');
        
        if (!confirmation) {
            console.log('Deletion cancelled');
            return;
        }

        // Delete satellite with ID 5
        await satelliteManager.deleteSatellite(5);
        console.log('Satellite deleted successfully');
    } catch (error) {
        console.error('Failed to delete satellite:', error.message);
    }
}

// ============================================================================
// EXAMPLE 8: Batch Add Multiple Satellites
// ============================================================================
async function addMultipleSatellites() {
    const satellitesToAdd = [
        {
            title: 'Hubble Space Telescope',
            noradId: '20580',
            cosparId: '1990-037B',
            missionType: 'Space Telescope',
            status: 'Operational',
            launchDate: '1990-04-24'
        },
        {
            title: 'James Webb Space Telescope',
            noradId: '51463',
            cosparId: '2021-130A',
            missionType: 'Space Telescope',
            status: 'Operational',
            launchDate: '2021-12-25'
        },
        {
            title: 'Landsat 9',
            noradId: '49260',
            cosparId: '2021-088A',
            missionType: 'Earth Observation',
            status: 'Operational',
            launchDate: '2021-09-27'
        }
    ];

    const results = [];
    for (const satellite of satellitesToAdd) {
        try {
            console.log(`Adding ${satellite.title}...`);
            const result = await satelliteManager.addSatellite(satellite);
            results.push({ success: true, satellite: satellite.title, id: result.Id });
        } catch (error) {
            results.push({ success: false, satellite: satellite.title, error: error.message });
        }
    }

    console.table(results);
    return results;
}

// ============================================================================
// EXAMPLE 9: Get Satellites with Status Filter
// ============================================================================
async function getOperationalSatellites() {
    try {
        const filter = "Status eq 'Operational'";
        const satellites = await satelliteManager.getSatellites({ 
            filter: filter,
            top: 100 
        });

        console.log(`Found ${satellites.length} operational satellites`);
        satellites.forEach(sat => {
            console.log(`- ${sat.Title}`);
        });

        return satellites;
    } catch (error) {
        console.error('Failed to fetch satellites:', error.message);
    }
}

// ============================================================================
// EXAMPLE 10: Handle Form Submission (From Your Dialog)
// ============================================================================
async function handleSatelliteFormSubmit(formData) {
    try {
        // Assuming formData is from your Add New Satellite modal
        const result = await satelliteManager.addSatellite({
            title: formData.satelliteName,
            noradId: formData.noradId,
            cosparId: formData.cosparId,
            missionType: formData.missionType,
            status: formData.status,
            orbitType: formData.orbitType,
            launchDate: formData.launchDate,
            sensorNames: formData.sensorNames
        });

        console.log('Satellite added successfully');
        // Close dialog, refresh list, show success message
        return result;
    } catch (error) {
        console.error('Form submission error:', error.message);
        // Show error message to user
        throw error;
    }
}

// ============================================================================
// HOW TO USE IN YOUR SHAREPOINT PAGE:
// ============================================================================
// 
// 1. Add the script reference to your SharePoint page:
//    <script src="/sites/yoursite/SiteAssets/satellite-api.js": 