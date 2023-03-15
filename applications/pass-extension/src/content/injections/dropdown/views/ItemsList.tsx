import React, { useCallback } from 'react';

import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { SafeLoginItem, WorkerMessageType } from '@proton/pass/types';

import { DropdownIframeMessage, DropdownMessageType } from '../../../types';
import { IFrameMessageBroker } from '../../iframe/messages';
import { DropdownItem } from '../components/DropdownItem';
import { DropdownItemsList } from '../components/DropdownItemsList';

export const ItemsList: React.FC<{
    items: SafeLoginItem[];
}> = ({ items }) => {
    const requestAutofill = useCallback(async (shareId: string, itemId: string) => {
        await sendMessage.map(
            contentScriptMessage({
                type: WorkerMessageType.AUTOFILL_SELECT,
                payload: { shareId, itemId },
            }),
            (response) =>
                response.type === 'success' &&
                IFrameMessageBroker.postMessage<DropdownIframeMessage>({
                    sender: 'dropdown',
                    type: DropdownMessageType.AUTOFILL,
                    payload: response,
                })
        );
    }, []);

    return (
        <DropdownItemsList>
            {items.map(({ name, username, shareId, itemId }) => (
                <DropdownItem
                    key={itemId}
                    onClick={() => requestAutofill(shareId, itemId)}
                    title={name}
                    subTitle={username}
                    icon="key"
                />
            ))}
        </DropdownItemsList>
    );
};
