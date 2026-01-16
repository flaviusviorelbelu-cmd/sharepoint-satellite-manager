/**
 * Satellite Form Handler
 * Complete integration script for the "Add New Satellite" dialog
 * 
 * This script handles form submission and submits data to SharePoint using SatelliteManager
 */

// ============================================================================
// INITIALIZATION - Runs when page loads
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[FormHandler] Initializing satellite form handler');
    
    // Find all forms that might be satellite forms
    const forms = document.querySelectorAll('form');
    console.log(`[FormHandler] Found ${forms.length} form(s) on page`);
    
    forms.forEach(form => {
        // Check if this is likely our satellite form by looking for key fields
        const hasSatelliteFields = (
            form.querySelector('[name*="Satellite"]') || 
            form.querySelector('[name*="NORAD"]') ||
            form.querySelector('[name*="COSPAR"]')
        );
        
        if (hasSatelliteFields) {
            console.log('[FormHandler] Found satellite form, attaching submit handler');
            form.addEventListener('submit', handleSatelliteFormSubmit);
        }
    });
    
    // Also look for submit buttons that might trigger form submission
    const submitButtons = document.querySelectorAll('button[type="submit"], button:contains("Submit"), button:contains("Add")');
    submitButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const form = this.closest('form');
            if (form) {
                handleSatelliteFormSubmit({ target: form, preventDefault: () => {} });
            }
        });
    });
});

// ============================================================================
// MAIN FORM SUBMISSION HANDLER
// ============================================================================

/**
 * Handles the satellite form submission
 * Called when user clicks Submit button on the "Add New Satellite" dialog
 * 
 * @param {Event} event - Form submit event
 */
async function handleSatelliteFormSubmit(event) {
    console.log('[FormHandler] Form submission started');
    
    // Prevent default form submission
    event.preventDefault();
    
    try {
        // Get the form element
        const form = event.target;
        
        // Disable submit button to prevent double-submission
        const submitButton = getSubmitButton(form);
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
        
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            console.log('[FormHandler] Submit button disabled, showing processing state');
        }
        
        // Collect form data
        console.log('[FormHandler] Collecting form data...');
        const satelliteData = collectFormData(form);
        console.log('[FormHandler] Form data collected:', satelliteData);
        
        // Validate required fields
        console.log('[FormHandler] Validating required fields...');
        validateSatelliteData(satelliteData);
        console.log('[FormHandler] Validation passed');
        
        // Show loading indicator (if you have one)
        showLoadingIndicator(true);
        
        // Submit to SharePoint
        console.log('[FormHandler] Submitting to SharePoint...');
        const result = await satelliteManager.addSatellite(satelliteData);
        console.log('[FormHandler] Success! Satellite added with ID:', result.Id);
        
        // Hide loading indicator
        showLoadingIndicator(false);
        
        // Show success message
        showSuccessMessage(`Satellite "${satelliteData.title}" has been added successfully!`);
        
        // Reset form
        form.reset();
        console.log('[FormHandler] Form reset');
        
        // Close dialog if it's a modal dialog
        closeDialogIfNeeded();
        
        // Refresh the satellite list
        refreshSharePointList();
        
    } catch (error) {
        console.error('[FormHandler] Error during form submission:', error);
        
        // Hide loading indicator
        showLoadingIndicator(false);
        
        // Show error message to user
        showErrorMessage(error.message);
        
    } finally {
        // Re-enable submit button
        const submitButton = getSubmitButton(event.target);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            console.log('[FormHandler] Submit button re-enabled');
        }
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Collects data from form inputs
 * Maps form field names to satellite data properties
 * 
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Satellite data object
 */
function collectFormData(form) {
    const data = {};
    
    // Method 1: Try to find inputs by exact field names
    const satelliteNameInput = form.querySelector('[name="Satellite Name"]') ||
                               form.querySelector('[name="Title"]') ||
                               form.querySelector('input[type="text"]:first-child');
    
    const noradIdInput = form.querySelector('[name="NORAD ID"]') ||
                         form.querySelector('[name="NORAD_ID"]');
    
    const cosparIdInput = form.querySelector('[name="COSPAR ID"]') ||
                          form.querySelector('[name="COSPAR_ID"]');
    
    const missionTypeInput = form.querySelector('[name="Mission Type"]') ||
                             form.querySelector('[name="Mission_Type"]');
    
    const statusInput = form.querySelector('[name="Status"]');
    
    const orbitTypeInput = form.querySelector('[name="Orbit Type"]') ||
                           form.querySelector('[name="Orbit_Type"]');
    
    const launchDateInput = form.querySelector('[name="Launch Date"]') ||
                            form.querySelector('[name="Launch_Date"]') ||
                            form.querySelector('input[type="date"]');
    
    const sensorNamesInput = form.querySelector('[name="Sensor Names"]') ||
                             form.querySelector('[name="Sensor_Names"]') ||
                             form.querySelector('textarea');
    
    // Collect values
    data.title = satelliteNameInput?.value?.trim() || '';
    data.noradId = noradIdInput?.value?.trim() || '';
    data.cosparId = cosparIdInput?.value?.trim() || '';
    data.missionType = missionTypeInput?.value?.trim() || '';
    data.status = statusInput?.value?.trim() || 'Operational';
    data.orbitType = orbitTypeInput?.value?.trim() || '';
    data.launchDate = launchDateInput?.value?.trim() || '';
    data.sensorNames = sensorNamesInput?.value?.trim() || '';
    
    return data;
}

/**
 * Validates that required fields are filled
 * Throws an error if validation fails
 * 
 * @param {Object} satelliteData - Satellite data object
 * @throws {Error} If required fields are missing
 */
function validateSatelliteData(satelliteData) {
    if (!satelliteData.title) {
        throw new Error('Satellite Name is required');
    }
    if (!satelliteData.noradId) {
        throw new Error('NORAD ID is required');
    }
    if (!satelliteData.cosparId) {
        throw new Error('COSPAR ID is required');
    }
    
    // Validate NORAD ID format (should be numeric)
    if (!/^\d+$/.test(satelliteData.noradId)) {
        throw new Error('NORAD ID must be numeric');
    }
    
    // Validate COSPAR ID format (should be YYYY-XXX or YYYY-XXXZ)
    if (!/^\d{4}-\d{3,4}[A-Z]?$/.test(satelliteData.cosparId)) {
        throw new Error('COSPAR ID format should be YYYY-XXX (e.g., 1998-067A)');
    }
    
    // Validate date format if provided
    if (satelliteData.launchDate && !isValidDate(satelliteData.launchDate)) {
        throw new Error('Launch Date must be in YYYY-MM-DD format');
    }
}

/**
 * Validates date format (YYYY-MM-DD)
 * 
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Gets the submit button from the form
 * Tries multiple selectors to find the button
 * 
 * @param {HTMLFormElement} form - The form element
 * @returns {HTMLElement|null} The submit button or null
 */
function getSubmitButton(form) {
    return form.querySelector('button[type="submit"]') ||
           form.querySelector('button:contains("Submit")') ||
           form.querySelector('button:contains("Add")') ||
           form.querySelector('button:contains("Save")') ||
           form.querySelector('button[name="submit"]') ||
           Array.from(form.querySelectorAll('button')).find(btn => 
               btn.textContent.toLowerCase().includes('submit') ||
               btn.textContent.toLowerCase().includes('add') ||
               btn.textContent.toLowerCase().includes('save')
           );
}

/**
 * Shows or hides a loading indicator
 * You can customize this to match your SharePoint theme
 * 
 * @param {boolean} show - True to show, false to hide
 */
function showLoadingIndicator(show) {
    let indicator = document.getElementById('satelliteLoadingIndicator');
    
    if (show) {
        if (!indicator) {
            // Create loading indicator if it doesn't exist
            indicator = document.createElement('div');
            indicator.id = 'satelliteLoadingIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                background: white;
                padding: 20px 40px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                text-align: center;
                font-family: Arial, sans-serif;
            `;
            indicator.innerHTML = `
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s linear infinite;"></div>
                <p style="margin: 0; color: #333;">Submitting satellite data...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    } else {
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
}

/**
 * Shows a success message to the user
 * 
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    console.log('[FormHandler] Success:', message);
    
    // Method 1: Use browser alert (simple, always works)
    alert(message);
    
    // Method 2: Show toast notification (uncomment if you want fancy UI)
    // showToast(message, 'success');
    
    // Method 3: Show custom notification div
    // showCustomNotification(message, 'success');
}

/**
 * Shows an error message to the user
 * 
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    console.error('[FormHandler] Error:', message);
    
    // Method 1: Use browser alert (simple, always works)
    alert('Error: ' + message);
    
    // Method 2: Show toast notification (uncomment if you want fancy UI)
    // showToast(message, 'error');
    
    // Method 3: Show custom notification div
    // showCustomNotification(message, 'error');
}

/**
 * Shows a toast notification (optional fancy UI)
 * Uncomment this function and use it in showSuccessMessage/showErrorMessage for better UX
 * 
 * @param {string} message - Message to show
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `satellite-toast satellite-toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        font-family: Arial, sans-serif;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set colors based on type
    if (type === 'success') {
        toast.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#f44336';
    } else {
        toast.style.backgroundColor = '#2196f3';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Closes the dialog if it's a SharePoint modal dialog
 * Handles both modern and classic SharePoint
 */
function closeDialogIfNeeded() {
    try {
        // Modern SharePoint (SPFx)
        if (window.parent && window.parent.closeDialog) {
            console.log('[FormHandler] Closing modal dialog (SPFx)');
            window.parent.closeDialog(true);
            return;
        }
        
        // Classic SharePoint
        if (window.parent && window.parent.SP && window.parent.SP.UI && window.parent.SP.UI.ModalDialog) {
            console.log('[FormHandler] Closing modal dialog (Classic SharePoint)');
            window.parent.SP.UI.ModalDialog.commonModalDialogClose(
                window.parent.SP.UI.DialogResult.OK,
                true
            );
            return;
        }
        
        // If no dialog found, just log it
        console.log('[FormHandler] No modal dialog detected, not closing anything');
        
    } catch (error) {
        console.warn('[FormHandler] Could not close dialog:', error);
    }
}

/**
 * Refreshes the SharePoint list view
 * Attempts multiple methods to refresh
 */
function refreshSharePointList() {
    try {
        console.log('[FormHandler] Attempting to refresh SharePoint list');
        
        // Method 1: Try to use SP.ListOperation.Selection.getSelectedItems()
        if (window._spBodyOnLoadFunctions) {
            console.log('[FormHandler] Reloading page');
            location.reload();
            return;
        }
        
        // Method 2: Look for list refresh method
        if (window.parent && window.parent.location) {
            console.log('[FormHandler] Reloading parent page');
            window.parent.location.reload();
            return;
        }
        
        // Method 3: Default reload
        console.log('[FormHandler] Reloading current page');
        location.reload();
        
    } catch (error) {
        console.warn('[FormHandler] Error refreshing list:', error);
        // Fallback: just reload
        location.reload();
    }
}

// ============================================================================
// OPTIONAL: Custom Notification Component
// ============================================================================

/**
 * Shows a custom notification div (more modern than alert)
 * Can be styled to match your SharePoint theme
 * 
 * @param {string} message - Notification message
 * @param {string} type - 'success', 'error', or 'warning'
 */
function showCustomNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `satellite-notification satellite-notification-${type}`;
    
    // Styling
    const bgColor = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    }[type] || '#2196f3';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background-color: ${bgColor};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================================================
// LOGGING AND DEBUG INFO
// ============================================================================

console.log('[FormHandler] Script loaded successfully');
console.log('[FormHandler] SatelliteManager available:', typeof satelliteManager !== 'undefined');
