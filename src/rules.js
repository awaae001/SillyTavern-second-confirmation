import { t } from '../../../../i18n.js';
import './types.js';

/** @type {import('./types.js').ConfirmationRule[]} */
export const confirmationRules = [
    {
        id: 'createBranch',
        label: 'Confirm branch creation',
        selector: '.mes_create_branch',
        event: 'click',
        title: () => t`Create Branch`,
        message: () => `<p>${t`Create a new branch from this message?`}</p>`,
        okButton: () => t`Create`,
        cancelButton: () => t`Cancel`,
    },
    {
        id: 'createBranch',
        selector: '.swipe_picker_branch',
        event: 'click',
        title: () => t`Create Branch`,
        message: () => `<p>${t`Create a new branch from this message?`}</p>`,
        okButton: () => t`Create`,
        cancelButton: () => t`Cancel`,
    },
    {
        id: 'closeChat',
        label: 'Confirm closing chat',
        selector: '#option_close_chat',
        event: 'click',
        title: () => t`Close Chat`,
        message: () => `<p>${t`Close the current chat? Unsaved temporary state may be lost.`}</p>`,
        okButton: () => t`Close`,
        cancelButton: () => t`Cancel`,
    },
    {
        id: 'deleteChat',
        label: 'Confirm deleting chat',
        selector: '#dialogue_del_mes_ok',
        event: 'click',
        title: () => t`Delete Chat`,
        message: () => `<p>${t`Delete the current chat? `}</p>`,
        okButton: () => t`Close`,
        cancelButton: () => t`Cancel`,
    },
];
