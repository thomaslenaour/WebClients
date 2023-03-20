import { type VFC, memo } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Header } from '../components/Header/Header';
import { Content } from './Content/Content';
import { Trash } from './Content/Trash';
import { ItemEditContainer } from './Item/ItemEditContainer';
import { ItemNewContainer } from './Item/ItemNewContainer';
import { ItemViewContainer } from './Item/ItemViewContainer';
import { LoadingView } from './LoadingView';
import { Sidebar } from './Sidebar/Sidebar';

import './Main.scss';

const MainRaw: VFC = () => {
    return (
        <div id="main" className="flex flex-column flex-nowrap w100 h100">
            <Header />
            <main className="flex flex-align-items-center flex-justify-center flex-nowrap w100 h100">
                <Switch>
                    <Route path="/trash">
                        <Trash />
                    </Route>
                    <Route>
                        <Content />
                    </Route>
                </Switch>

                <Sidebar>
                    <Switch>
                        <Route exact path={['/share/:shareId/item/:itemId', '/trash/share/:shareId/item/:itemId']}>
                            <ItemViewContainer />
                        </Route>

                        <Route exact path="/share/:shareId/item/:itemId/edit">
                            <ItemEditContainer />
                        </Route>

                        <Route exact path="/item/new/:itemType">
                            <ItemNewContainer />
                        </Route>

                        <Route exact path="/syncing">
                            <LoadingView />
                        </Route>
                    </Switch>
                </Sidebar>
            </main>
        </div>
    );
};

export const Main = memo(MainRaw, () => true);
