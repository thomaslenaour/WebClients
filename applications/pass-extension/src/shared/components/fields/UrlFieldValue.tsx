import { FC } from 'react';

import { c } from 'ttag';

import { ButtonLike, Href } from '@proton/atoms';
import { Icon, Tooltip } from '@proton/components/components';

const UrlFieldValue: FC<{ children: string }> = ({ children }) => {
    return (
        <div className="flex flex-align-items-center flex-nowrap">
            <div className="mr1 text-ellipsis">
                <Href href={children}>{children}</Href>
            </div>
            <Tooltip title={c('Action').t`Open url`}>
                <ButtonLike
                    className="mlauto flex-item-noshrink"
                    shape="ghost"
                    size="small"
                    icon
                    as={Href}
                    href={children}
                >
                    <Icon name="arrow-out-square" />
                </ButtonLike>
            </Tooltip>
        </div>
    );
};

export default UrlFieldValue;
