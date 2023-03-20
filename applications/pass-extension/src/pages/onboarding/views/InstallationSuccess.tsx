import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { ProtonLogo } from '@proton/components';
import { BRAND_NAME, PASS_APP_NAME } from '@proton/shared/lib/constants';

import extensionMenu from '../../../../public/assets/extension-menu.svg';
import extensionPin from '../../../../public/assets/extension-pin.svg';
import extensionLogo from '../../../../public/assets/protonpass-icon.svg';
import { ExtensionHead } from '../../../shared/components/page/ExtensionHead';
import { useNavigateToLogin } from '../../../shared/hooks';

const InstallationSuccess = () => {
    const login = useNavigateToLogin();

    const steps = [
        {
            key: 'open',
            icon: extensionMenu,
            description: c('Info').t`Open the Extensions menu`,
        },
        {
            key: 'pin',
            icon: extensionPin,
            description: c('Info').t`Pin ${PASS_APP_NAME} to your toolbar`,
        },
        {
            key: 'access',
            icon: extensionLogo,
            description: c('Info').t`Access ${PASS_APP_NAME} via this icon`,
        },
    ];

    return (
        <>
            <ExtensionHead title={c('Title').t`Thank you for installing ${PASS_APP_NAME}`} />
            <div className="w100 h100v flex mw">
                <div className="mauto w100 text-center p4">
                    <img src={extensionLogo} className="w90p mxauto mb2" alt="" />
                    <h2 className="mb2">{c('Title').t`Thank you for installing ${PASS_APP_NAME}`}</h2>
                    <h5 className="mb3">{c('Info')
                        .t`Follow these simple steps to get the best experience using ${PASS_APP_NAME}`}</h5>

                    <div className="mxauto flex flex-justify-center mb2">
                        <div>
                            {steps.map(({ key, icon, description }, idx) => (
                                <div key={key} className="flex mb2 flex-align-items-center">
                                    <div className="protonpass-install--dot bg-primary rounded-50 text-center mr1">
                                        {idx + 1}
                                    </div>
                                    <div className="w40p mr1">
                                        <img
                                            src={icon}
                                            className="h-custom"
                                            style={{ '--height-custom': '24px' }}
                                            alt={BRAND_NAME}
                                        />
                                    </div>

                                    <div className="flex-item-fluid text-left">{description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="max-w-custom w100"
                        size="large"
                        shape="outline"
                        color="norm"
                        onClick={login}
                        style={{ '--max-width-custom': '480px' }}
                    >
                        <ProtonLogo variant="glyph-only" size={16} className="mb0-25 mr1" />
                        <span>{c('Action').t`Log in with ${BRAND_NAME}`}</span>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default InstallationSuccess;
