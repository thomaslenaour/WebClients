import { FC } from 'react';

import { c } from 'ttag';

import { Checkbox } from '@proton/components';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

export const General: FC = () => {
    return (
        <div className="my1">
            <strong className="color-norm block mb0-5 block">{c('Label').t`Autofill`}</strong>
            <Checkbox className="mb0" checked disabled>
                <span className="ml0-75">
                    {c('Label').t`Inject ${PASS_APP_NAME} icon into input fields`}
                    <span className="block text-xs">{c('Info')
                        .t`If enabled, you can quickly autofill your credentials by clicking on the ${PASS_APP_NAME} icon. This shortcut will also allow you to generate email aliases & strong passwords on register forms`}</span>
                </span>
            </Checkbox>

            <hr className="my1 bg-weak" />

            <strong className="color-norm block mb0-5 block">{c('Label').t`Autosave`}</strong>
            <Checkbox className="mb0" checked disabled>
                <span className="ml0-75">
                    {c('Label').t`Use ${PASS_APP_NAME} as default autosave manager`}
                    <span className="block text-xs">{c('Info')
                        .t`This will disable your browser's default auto-saving capabilities`}</span>
                </span>
            </Checkbox>
        </div>
    );
};
