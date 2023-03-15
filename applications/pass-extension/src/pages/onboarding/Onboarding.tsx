import { FC } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { CircleLoader } from '@proton/atoms/CircleLoader';

import { ExtensionWindow } from '../../shared/components/extension';
import InstallationSuccess from './views/InstallationSuccess';
import ResumeSession from './views/ResumeSession';

export const Onboarding: FC = () => (
    <ExtensionWindow endpoint="page">
        {(ready) =>
            ready ? (
                <HashRouter>
                    <Switch>
                        <Route path="/resume">
                            <ResumeSession />
                        </Route>
                        <Route path="/success">
                            <InstallationSuccess />
                        </Route>
                    </Switch>
                </HashRouter>
            ) : (
                <CircleLoader />
            )
        }
    </ExtensionWindow>
);
