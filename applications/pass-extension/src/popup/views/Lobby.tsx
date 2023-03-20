import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { popupMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { BRAND_NAME } from '@proton/shared/lib/constants';

import logo from '../../../public/assets/protonpass-logo.svg';
import { useNavigateToLogin } from '../../shared/hooks';
import { usePopupContext } from '../context';

import './Lobby.scss';

const Lobby = () => {
    const { state, logout } = usePopupContext();

    const busy = ![
        WorkerStatus.READY,
        WorkerStatus.IDLE,
        WorkerStatus.ERROR,
        WorkerStatus.RESUMING_FAILED,
        WorkerStatus.UNAUTHORIZED,
    ].includes(state.status);

    const login = useNavigateToLogin();

    const handleSignInClick = async () =>
        state.status === WorkerStatus.RESUMING_FAILED
            ? sendMessage(popupMessage({ type: WorkerMessageType.WORKER_INIT, payload: { sync: true } }))
            : login();

    return (
        <div className="protonpass-lobby anime-fade-in" style={{ '--anime-delay': '0s' }}>
            <div className="flex flex-column flex-align-items-center relative">
                <img src={logo} className="w300p" alt="" />

                <Button
                    className="mt2"
                    shape="solid"
                    color={'norm'}
                    onClick={handleSignInClick}
                    disabled={busy}
                    loading={busy}
                >
                    {!busy && (
                        <>
                            {state.status === WorkerStatus.RESUMING_FAILED
                                ? c('Action').t`Sign back in`
                                : c('Action').t`Sign in with ${BRAND_NAME}`}
                        </>
                    )}
                    {busy && c('Action').t`Signing you in`}
                </Button>

                {state.status === WorkerStatus.RESUMING_FAILED && (
                    <Button
                        className="mt0-5 absolute bottom-custom"
                        style={{ '--bottom-custom': '-50px' }}
                        shape="ghost"
                        color={'danger'}
                        onClick={() => logout({ soft: true })}
                    >
                        {c('Action').t`Logout`}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Lobby;
