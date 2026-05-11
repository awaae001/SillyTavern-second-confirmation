import { t } from '../../../i18n.js';
import { Popup } from '../../../popup.js';

const extensionName = 'SillyTavern-second-confirmation';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const storageKey = `${extensionName}:settings`;
const defaultSettings = Object.freeze({
    enabled: true,
});

/**
 * @typedef {object} ExtensionSettings
 * @property {boolean} enabled Whether confirmation gates are enabled.
 */

/**
 * @typedef {object} ConfirmationRule
 * @property {string} selector Element selector whose event should require confirmation.
 * @property {string} event Event name to intercept.
 * @property {() => string} title Popup title.
 * @property {() => string} message Popup body.
 * @property {() => string} okButton Confirmation button text.
 * @property {() => string} cancelButton Cancel button text.
 */

/** @type {ExtensionSettings} */
let settings = loadSettings();
let isRegistered = false;

/** @type {ConfirmationRule[]} */
const confirmationRules = [
    {
        selector: '.mes_create_branch',
        event: 'click',
        title: () => t`Create Branch`,
        message: () => `<p>${t`Create a new branch from this message?`}</p>`,
        okButton: () => t`Create`,
        cancelButton: () => t`Cancel`,
    },
    {
        selector: '.swipe_picker_branch',
        event: 'click',
        title: () => t`Create Branch`,
        message: () => `<p>${t`Create a new branch from this message?`}</p>`,
        okButton: () => t`Create`,
        cancelButton: () => t`Cancel`,
    },
];

/** @type {Map<string, WeakSet<Element>>} */
const allowedTargetsByEvent = new Map();
/** @type {Map<string, WeakSet<Element>>} */
const pendingTargetsByEvent = new Map();

/**
 * Loads extension settings from local storage.
 * @returns {ExtensionSettings} Extension settings.
 */
function loadSettings() {
    try {
        const rawSettings = localStorage.getItem(storageKey);
        const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};
        if (!parsedSettings || typeof parsedSettings !== 'object') {
            return { ...defaultSettings };
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

/**
 * Syncs the settings page with the current settings.
 */
function syncSettingsUi() {
    $('#second_confirmation_enabled').prop('checked', settings.enabled);
}

/**
 * Handles the enabled checkbox changing.
 * @param {JQuery.ChangeEvent} event Change event.
 */
function onEnabledInput(event) {
    settings.enabled = Boolean($(event.currentTarget).prop('checked'));
    saveSettings();
}

/**
 * Gets the set of targets that should bypass one intercepted event.
 * @param {string} eventName Event name.
 * @returns {WeakSet<Element>} Bypass target set.
 */
function getAllowedTargets(eventName) {
    if (!allowedTargetsByEvent.has(eventName)) {
        allowedTargetsByEvent.set(eventName, new WeakSet());
    }

    return allowedTargetsByEvent.get(eventName);
}

/**
 * Gets the set of targets that are currently waiting for confirmation.
 * @param {string} eventName Event name.
 * @returns {WeakSet<Element>} Pending target set.
 */
function getPendingTargets(eventName) {
    if (!pendingTargetsByEvent.has(eventName)) {
        pendingTargetsByEvent.set(eventName, new WeakSet());
    }

    return pendingTargetsByEvent.get(eventName);
}

/**
 * Consumes a one-shot bypass for a target.
 * @param {string} eventName Event name.
 * @param {Element} target Target element.
 * @returns {boolean} Whether the event should bypass confirmation.
 */
function consumeAllowedTarget(eventName, target) {
    const allowedTargets = getAllowedTargets(eventName);

    if (!allowedTargets.has(target)) {
        return false;
    }

    allowedTargets.delete(target);
    return true;
}

/**
 * Replays the intercepted mouse event after confirmation.
 * @param {MouseEvent} event Original mouse event.
 * @param {Element} target Target element to replay the event on.
 * @param {string} eventName Event name.
 */
function replayMouseEvent(event, target, eventName) {
    getAllowedTargets(eventName).add(target);

    target.dispatchEvent(new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
        composed: event.composed,
        view: window,
        detail: event.detail,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        button: event.button,
        buttons: event.buttons,
        relatedTarget: event.relatedTarget,
    }));
}

/**
 * Asks for confirmation for the given rule.
 * @param {ConfirmationRule} rule Confirmation rule.
 * @returns {Promise<boolean>} True if the user confirmed.
 */
async function confirmRule(rule) {
    const result = await Popup.show.confirm(rule.title(), rule.message(), {
        okButton: rule.okButton(),
        cancelButton: rule.cancelButton(),
    });

    return Boolean(result);
}

/**
 * Handles a captured event and conditionally gates it behind a confirmation popup.
 * @param {MouseEvent} event Captured event.
 * @param {ConfirmationRule} rule Confirmation rule.
 * @returns {boolean} True if the event was handled by this rule.
 */
function handleCapturedEvent(event, rule) {
    if (!settings.enabled || !(event.target instanceof Element)) {
        return false;
    }

    const target = event.target.closest(rule.selector);
    if (!target) {
        return false;
    }

    if (consumeAllowedTarget(rule.event, target)) {
        return true;
    }

    const pendingTargets = getPendingTargets(rule.event);
    event.preventDefault();
    event.stopImmediatePropagation();

    if (pendingTargets.has(target)) {
        return true;
    }

    pendingTargets.add(target);
    confirmRule(rule)
        .then(confirmed => {
            if (confirmed && target.isConnected) {
                replayMouseEvent(event, target, rule.event);
            }
        })
        .catch(error => console.error(`[${extensionName}] Confirmation failed.`, error))
        .finally(() => pendingTargets.delete(target));

    return true;
}

/**
 * Registers all configured confirmation gates.
 */
function registerConfirmationRules() {
    if (isRegistered) {
        return;
    }

    const eventNames = new Set(confirmationRules.map(rule => rule.event));

    for (const eventName of eventNames) {
        document.addEventListener(eventName, event => {
            if (!(event instanceof MouseEvent)) {
                return;
            }

            for (const rule of confirmationRules) {
                if (rule.event === eventName && handleCapturedEvent(event, rule)) {
                    break;
                }
            }
        }, true);
    }

    isRegistered = true;
}

jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
    $('#extensions_settings').append(settingsHtml);
    $('#second_confirmation_enabled').on('input', onEnabledInput);
    syncSettingsUi();
    registerConfirmationRules();
});
