import { t } from '../../../../i18n.js';
import './types.js';

/** @type {import('./types.js').ConfirmationRule[]} */
export const confirmationRules = [
    {
        id: 'createBranch',
        label: 'Second confirmation for branch creation',
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
        label: 'Second confirmation for closing chat',
        selector: '#option_close_chat',
        event: 'click',
        title: () => t`Close Chat`,
        message: () => `<p>${t`Close the current chat? Unsaved temporary state, if any, will be lost.`}</p>`,
        okButton: () => t`Close`,
        cancelButton: () => t`Cancel`,
    },
    {
        id: 'deleteChat',
        label: 'Second confirmation for deleting chat',
        selector: '#dialogue_del_mes_ok',
        event: 'click',
        title: () => t`Delete Chat`,
        message: () => `<p>${t`Delete the current chat? `}</p>`,
        okButton: () => t`Close`,
        cancelButton: () => t`Cancel`,
    },
    {
        id: 'regenerateMessage',
        label: 'Second confirmation for regenerating message',
        selector: '#option_regenerate',
        event: 'click',
        title: () => t`Regenerate Message`,
        message: () => `<p>${t`Are you sure you want to regenerate the latest message?`}</p><p>${t`This operation will delete all historical alternative messages.`}</p>`,
        okButton: () => t`Regenerate`,
        cancelButton: () => t`Cancel`,
    },
];
