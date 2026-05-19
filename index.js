// Imports
import { onMasterEnabledInput, onConfirmationSettingInput, syncSettingsUi } from './src/settings.js';
import { registerConfirmationRules } from './src/confirmation.js';
import { confirmationRules } from './src/rules.js';
import './src/types.js'; // Import for JSDoc type recognition

const extensionName = 'SillyTavern-second-confirmation';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

function buildSettingsList() {
    const rules = new Map();
    for (const rule of confirmationRules) {
        if (rule.id && rule.label && !rules.has(rule.id)) {
            rules.set(rule.id, { label: rule.label });
        }
    }

    let html = '';
    for (const [id, { label }] of rules) {
        const elementId = `second_confirmation_${id}`;
        html += `
            <label class="checkbox_label" for="${elementId}">
                <input id="${elementId}" type="checkbox" data-confirmation-key="${id}" />
                <span data-i18n="${label}">${label}</span>
            </label>
        `;
    }
    return html;
}

// jQuery ready handler
jQuery(async () => {
    console.log(`[${extensionName}] Extension loaded successfully.`);
    const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
    $('#extensions_settings').append(settingsHtml);
    $('#second_confirmation_list').html(buildSettingsList());
    $('#second_confirmation_enabled').on('input', onMasterEnabledInput);
    $('#second_confirmation_list').on('input', 'input[type="checkbox"]', onConfirmationSettingInput);
    syncSettingsUi();

    registerConfirmationRules();
});
