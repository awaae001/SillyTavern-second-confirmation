import './types.js';

const extensionName = 'SillyTavern-second-confirmation';
const storageKey = `${extensionName}:settings`;
const defaultSettings = Object.freeze({
    enabled: true,
    confirmations: {
        createBranch: true,
        closeChat: true,
        deleteChat: true,
    },
});

/**
 * Loads extension settings from local storage.
 * @returns {import('./types.js').ExtensionSettings} Extension settings.
 */
function loadSettings() {
    try {
        const rawSettings = localStorage.getItem(storageKey);
        const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};
        if (!parsedSettings || typeof parsedSettings !== 'object') {
            return { ...defaultSettings };
        }

        // Migration from old format
        if (typeof parsedSettings.enabled === 'boolean' && parsedSettings.confirmations === undefined) {
            // Old format only had a single `enabled` flag.
            // We can assume it was for branch creation.
            const oldEnabled = parsedSettings.enabled;
            parsedSettings.confirmations = { ...defaultSettings.confirmations };
            // Let the master switch keep its value, but only keep branch confirmation on.
            parsedSettings.confirmations.createBranch = oldEnabled;
        }


        return { ...defaultSettings, ...parsedSettings };
    } catch (error) {
        console.warn(`[${extensionName}] Failed to load settings. Using defaults.`, error);
        return { ...defaultSettings };
    }
}

/**
 * Saves extension settings to local storage.
 */
function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify(settings));
}

/** @type {import('./types.js').ExtensionSettings} */
export let settings = loadSettings();

/**
 * Syncs the settings page with the current settings.
 */
export function syncSettingsUi() {
    $('#second_confirmation_enabled').prop('checked', settings.enabled);
    $('#second_confirmation_list').find('input[type="checkbox"]').each((_, el) => {
        const key = $(el).data('confirmation-key');
        if (key && settings.confirmations[key] !== undefined) {
            $(el).prop('checked', settings.confirmations[key]);
        }
    });

    // Disable sub-options if master is disabled
    $('#second_confirmation_list').find('input').prop('disabled', !settings.enabled);
}

/**
 * Handles the enabled checkbox changing.
 * @param {JQuery.ChangeEvent} event Change event.
 */
export function onMasterEnabledInput(event) {
    settings.enabled = Boolean($(event.currentTarget).prop('checked'));
    saveSettings();
    syncSettingsUi();
}

/**
 * Handles confirmation-specific checkboxes changing.
 * @param {JQuery.ChangeEvent} event Change event.
 */
export function onConfirmationSettingInput(event) {
    const checkbox = $(event.currentTarget);
    const key = checkbox.data('confirmation-key');
    const value = Boolean(checkbox.prop('checked'));

    if (key && settings.confirmations[key] !== undefined) {
        settings.confirmations[key] = value;
        saveSettings();
    }
}
