/**
 * @typedef {object} ExtensionSettings
 * @property {boolean} enabled Whether confirmation gates are enabled.
 * @property {{[key: string]: boolean}} confirmations Map of which confirmation types are enabled.
 */

/**
 * @typedef {object} ConfirmationRule
 * @property {string} id Unique ID of the rule, used for settings.
 * @property {string} [label] The UI label for this confirmation's setting toggle. Only needed once per unique id.
 * @property {string} selector Element selector whose event should require confirmation.
 * @property {string} event Event name to intercept.
 * @property {() => string} title Popup title.
 * @property {() => string} message Popup body.
 * @property {() => string} okButton Confirmation button text.
 * @property {() => string} cancelButton Cancel button text.
 */

export {};
