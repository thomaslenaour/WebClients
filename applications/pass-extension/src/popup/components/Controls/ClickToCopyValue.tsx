import { FC } from 'react';

import { c } from 'ttag';

import { useNotifications } from '@proton/components';
import { logger } from '@proton/pass/utils/logger';

type Props = {
    value: string;
};

export const ClickToCopyValue: FC<Props> = ({ children, value }) => {
    const { createNotification } = useNotifications();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            createNotification({ type: 'success', text: c('Info').t`Copied to clipboard` });
        } catch (err) {
            createNotification({ type: 'error', text: c('Info').t`Unable to copy to clipboard` });
            logger.error(`[Popup] unable to copy '${value}' to clipboard`);
        }
    };

    return (
        <div className="cursor-pointer overflow-hidden" onClick={copy}>
            {children}
        </div>
    );
};
