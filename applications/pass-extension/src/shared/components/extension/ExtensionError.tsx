import { FC } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { IllustrationPlaceholder } from '@proton/components';
import browser from '@proton/pass/globals/browser';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import errorImg from '@proton/styles/assets/img/extension/proton-extension/error.svg';

export const ExtensionError: FC = () => (
    <div className="anime-fade-in" style={{ '--anime-delay': '0s' }}>
        <div className="mauto">
            <IllustrationPlaceholder
                title={c('Error message').t`Oops, something went wrong`}
                illustrationClassName="w150p"
                url={errorImg}
            >
                <>
                    <span>{c('Error').t`Something went wrong. Please reload the ${PASS_APP_NAME} extension`}</span>
                    <Button className="mt2" shape="solid" color="danger" onClick={() => browser.runtime.reload()}>
                        {c('Action').t`Reload the extension`}
                    </Button>
                </>
            </IllustrationPlaceholder>
        </div>
    </div>
);
