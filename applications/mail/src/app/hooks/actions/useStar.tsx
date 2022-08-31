import { useCallback } from 'react';
import { useApi, useEventManager } from '@proton/components';
import { useDispatch } from 'react-redux';
import { labelMessages, unlabelMessages } from '@proton/shared/lib/api/messages';
import { labelConversations, unlabelConversations } from '@proton/shared/lib/api/conversations';
import { MAILBOX_LABEL_IDS } from '@proton/shared/lib/constants';
import { Element } from '../../models/element';
import { useOptimisticApplyLabels } from '../optimistic/useOptimisticApplyLabels';
import { isMessage as testIsMessage } from '../../helpers/elements';
import { backendActionFinished, backendActionStarted } from '../../logic/elements/elementsActions';

export const useStar = () => {
    const api = useApi();
    const { call, stop, start } = useEventManager();
    const optimisticApplyLabels = useOptimisticApplyLabels();
    const dispatch = useDispatch();

    const star = useCallback(async (elements: Element[], value: boolean) => {
        if (!elements.length) {
            return;
        }

        const isMessage = testIsMessage(elements[0]);
        const labelAction = isMessage ? labelMessages : labelConversations;
        const unlabelAction = isMessage ? unlabelMessages : unlabelConversations;
        const action = value ? labelAction : unlabelAction;

        let rollback = () => {};

        try {
            // Stop the event manager to prevent race conditions
            stop();
            dispatch(backendActionStarted());
            rollback = optimisticApplyLabels(elements, { [MAILBOX_LABEL_IDS.STARRED]: value });
            await api(action({ LabelID: MAILBOX_LABEL_IDS.STARRED, IDs: elements.map((element) => element.ID) }));
        } catch (error: any) {
            rollback();
            throw error;
        } finally {
            dispatch(backendActionFinished());
            start();
            await call();
        }
    }, []);

    return star;
};
