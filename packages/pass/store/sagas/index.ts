import { all } from 'redux-saga/effects';

import { WorkerRootSagaOptions } from '../types';
import aliasDetailsRequest from './alias-details-request.saga';
import aliasOptionsRequest from './alias-options-request.saga';
import boot from './boot.saga';
import cache from './cache.saga';
import events from './events.saga';
import itemsImport from './import.saga';
import itemCreation from './item-creation.saga';
import itemDelete from './item-delete.saga';
import itemEdit from './item-edit.saga';
import itemRestore from './item-restore.saga';
import itemTrash from './item-trash.saga';
import itemsRequest from './items-request.saga';
import notification from './notification.saga';
import sessionLockDisable from './session-lock-disable';
import sessionLockEnable from './session-lock-enable';
import sessionUnlock from './session-unlock';
import signout from './signout.saga';
import sync from './sync.saga';
import trashDelete from './trash-delete.saga';
import trashRestore from './trash-restore.saga';
import vaultCreation from './vault-creation.saga';
import vaultDelete from './vault-delete.saga';
import vaultEdit from './vault-edit.saga';
import wakeup from './wakeup.saga';

export function* workerRootSaga(options: WorkerRootSagaOptions) {
    yield all(
        [
            aliasOptionsRequest,
            aliasDetailsRequest,
            boot,
            cache,
            events,
            itemsRequest,
            itemCreation,
            itemEdit,
            itemTrash,
            itemDelete,
            itemRestore,
            itemsImport,
            trashDelete,
            trashRestore,
            notification,
            sessionLockDisable,
            sessionLockEnable,
            sessionUnlock,
            signout,
            sync,
            vaultCreation,
            vaultEdit,
            vaultDelete,
            wakeup,
        ].map((saga) => saga(options))
    );
}
