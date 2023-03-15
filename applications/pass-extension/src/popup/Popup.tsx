import { CSSProperties } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';

import { ErrorBoundary } from '@proton/components';
import { popupMessage } from '@proton/pass/extension/message';

import { ExtensionError, ExtensionWindow } from '../shared/components/extension';
import createClientStore from '../shared/store/client-store';
import { App } from './App';
import { PopupContextProvider, usePopupContext } from './context';
import Lobby from './views/Lobby';

import './Popup.scss';

const POPUP_DIMENSIONS: CSSProperties = {
    width: 600,
    height: 430,
};

const AppOrLobby = () => {
    const { state } = usePopupContext();
    return state.loggedIn ? <App /> : <Lobby />;
};

const Popup = () => {
    return (
        <ExtensionWindow endpoint="popup" style={POPUP_DIMENSIONS} className="anime-fade-in block overflow-hidden">
            {(ready) =>
                ready ? (
                    <ReduxProvider store={createClientStore('popup', popupMessage)}>
                        <Router>
                            <ErrorBoundary component={<ExtensionError />}>
                                <PopupContextProvider>
                                    <AppOrLobby />
                                </PopupContextProvider>
                            </ErrorBoundary>
                        </Router>
                    </ReduxProvider>
                ) : null
            }
        </ExtensionWindow>
    );
};

export default Popup;
