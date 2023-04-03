import { VFC } from 'react';

import { c } from 'ttag';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleHeader,
    CollapsibleHeaderIconButton,
    Icon,
} from '@proton/components';

type Props = {
    items: { label: string; values: string[] }[];
};

export const MoreInfoDropdown: VFC<Props> = ({ items }) => {
    return (
        <Collapsible>
            <CollapsibleHeader
                disableFullWidth
                className="pt-2 text-sm"
                suffix={
                    <CollapsibleHeaderIconButton className="p-0">
                        <Icon name="chevron-down" className="color-weak" />
                    </CollapsibleHeaderIconButton>
                }
            >
                <span className="flex flex-align-items-center color-weak text-semibold">
                    <Icon className="mr-2" name="info-circle" />
                    <span>{c('Button').t`More info`}</span>
                </span>
            </CollapsibleHeader>
            <CollapsibleContent className="color-weak pt-4 pl-4 text-sm">
                {items.map(({ label, values }) => (
                    <div className="flex mb-2" key={label}>
                        <div className="mr-4 w20">{`${label}:`}</div>
                        <div>
                            {values.map((value) => (
                                <div key={value}>{value}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
};
