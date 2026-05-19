import { Popup } from '../../../../popup.js';
import { confirmationRules } from './rules.js';
import { settings } from './settings.js';
import './types.js';

const extensionName = 'SillyTavern-second-confirmation';
let isRegistered = false;

/** @type {Map<string, WeakSet<Element>>} */
const allowedTargetsByEvent = new Map();
/** @type {Map<string, WeakSet<Element>>} */
const pendingTargetsByEvent = new Map();

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
 * @param {import('./types.js').ConfirmationRule} rule Confirmation rule.
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
 * @param {import('./types.js').ConfirmationRule} rule Confirmation rule.
 * @returns {boolean} True if the event was handled by this rule.
 */
function handleCapturedEvent(event, rule) {
    if (!settings.enabled || !(event.target instanceof Element) || (rule.id && !settings.confirmations[rule.id])) {
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
export function registerConfirmationRules() {
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
