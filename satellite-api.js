/**
 * SharePoint Satellite Manager
 * REST API Client for Satellite_Fixed List
 * 
 * This script provides functions to create, read, update, and delete satellite records
 * in the SharePoint 'Satellite_Fixed' list using the REST API.
 */

class SatelliteManager {
    constructor(siteUrl = _spPageContextInfo.webAbsoluteUrl) {
        this.siteUrl = siteUrl;
        this.listName = 'Satellite_Fixed';
        this.listRestUrl = `${this.siteUrl}/_api/web/lists/getbytitle('${this.listName}')/items`;
    }

    /**
     * Get Request Digest for POST/PATCH/DELETE operations
     * @returns {string} The request digest value
     */
    getRequestDigest() {
        const digest = document.getElementById('__REQUESTDIGEST');
        if (!digest) {
            throw new Error('Request digest not found. Ensure this script runs on a SharePoint page.');
        }
        return digest.value;
    }

    /**
     * Add a new satellite to the Satellite_Fixed list
     * @param {Object} satelliteData - Satellite information
     * @param {string} satelliteData.title - Satellite name (required)
     * @param {string} satelliteData.noradId - NORAD ID (required)
     * @param {string} satelliteData.cosparId - COSPAR ID (required)
     * @param {string} satelliteData.missionType - Mission type (e.g., Earth Observation)
     * @param {string} satelliteData.status - Status (e.g., Operational)
     * @param {string} satelliteData.orbitType - Orbit type
     * @param {string} satelliteData.launchDate - Launch date (ISO format: YYYY-MM-DD)
     * @param {string} satelliteData.sensorNames - Comma-separated sensor names
     * @returns {Promise<Object>} Response from SharePoint API
     */
    async addSatellite(satelliteData) {
        try {
            // Validate required fields
            if (!satelliteData.title || !satelliteData.noradId || !satelliteData.cosparId) {
                throw new Error('Required fields missing: title, noradId, cosparId');
            }

            const payload = {
                'Title': satelliteData.title,
                'NORAD_ID': satelliteData.noradId,
                'COSPAR_ID': satelliteData.cosparId,
                'Mission_Type': satelliteData.missionType || '',
                'Status': satelliteData.status || 'Operational',
                'Orbit_Type': satelliteData.orbitType || '',
                'Launch_Date': satelliteData.launchDate || null,
                'Sensor_Names': satelliteData.sensorNames || ''
            };

            console.log('[SatelliteManager] Adding satellite:', payload);

            const response = await fetch(this.listRestUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-RequestDigest': this.getRequestDigest()
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`SharePoint API error: ${error.error?.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('[SatelliteManager] Satellite added successfully:', result);
            return result;

        } catch (error) {
            console.error('[SatelliteManager] Error adding satellite:', error);
            throw error;
        }
    }

    /**
     * Get all satellites from the list
     * @param {Object} options - Query options
     * @param {number} options.top - Number of items to retrieve (default: 100)
     * @param {string} options.filter - OData filter query
     * @returns {Promise<Array>} Array of satellite records
     */
    async getSatellites(options = {}) {
        try {
            const top = options.top || 100;
            let url = `${this.listRestUrl}?$top=${top}`;

            if (options.filter) {
                url += `&$filter=${encodeURIComponent(options.filter)}`;
            }

            console.log('[SatelliteManager] Fetching satellites from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch satellites: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('[SatelliteManager] Retrieved satellites:', result.value.length);
            return result.value;

        } catch (error) {
            console.error('[SatelliteManager] Error fetching satellites:', error);
            throw error;
        }
    }

    /**
     * Get a specific satellite by ID
     * @param {number} itemId - SharePoint item ID
     * @returns {Promise<Object>} Satellite record
     */
    async getSatelliteById(itemId) {
        try {
            const url = `${this.listRestUrl}(${itemId})`;
            console.log('[SatelliteManager] Fetching satellite:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch satellite: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('[SatelliteManager] Retrieved satellite:', result);
            return result;

        } catch (error) {
            console.error('[SatelliteManager] Error fetching satellite:', error);
            throw error;
        }
    }

    /**
     * Update an existing satellite
     * @param {number} itemId - SharePoint item ID
     * @param {Object} satelliteData - Fields to update
     * @returns {Promise<void>}
     */
    async updateSatellite(itemId, satelliteData) {
        try {
            const url = `${this.listRestUrl}(${itemId})`;
            console.log('[SatelliteManager] Updating satellite:', url);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-RequestDigest': this.getRequestDigest(),
                    'If-Match': '*'
                },
                body: JSON.stringify(satelliteData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to update satellite: ${error.error?.message || response.statusText}`);
            }

            console.log('[SatelliteManager] Satellite updated successfully');
            return true;

        } catch (error) {
            console.error('[SatelliteManager] Error updating satellite:', error);
            throw error;
        }
    }

    /**
     * Delete a satellite record
     * @param {number} itemId - SharePoint item ID
     * @returns {Promise<void>}
     */
    async deleteSatellite(itemId) {
        try {
            const url = `${this.listRestUrl}(${itemId})`;
            console.log('[SatelliteManager] Deleting satellite:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-RequestDigest': this.getRequestDigest(),
                    'If-Match': '*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete satellite: ${response.statusText}`);
            }

            console.log('[SatelliteManager] Satellite deleted successfully');
            return true;

        } catch (error) {
            console.error('[SatelliteManager] Error deleting satellite:', error);
            throw error;
        }
    }

    /**
     * Search satellites by NORAD ID
     * @param {string} noradId - NORAD ID to search
     * @returns {Promise<Array>} Matching satellite records
     */
    async searchByNORADId(noradId) {
        const filter = `NORAD_ID eq '${noradId}'`;
        return this.getSatellites({ filter });
    }

    /**
     * Search satellites by title/name
     * @param {string} title - Satellite name or partial name
     * @returns {Promise<Array>} Matching satellite records
     */
    async searchByTitle(title) {
        const filter = `substringof('${title}', Title)`;
        return this.getSatellites({ filter });
    }
}

// Initialize the manager when script loads
const satelliteManager = new SatelliteManager();
console.log('[SatelliteManager] Initialized successfully');
