import { put, select, takeEvery } from 'redux-saga/effects';

import { settingsEditFailure, settingsEditIntent, settingsEditSuccess } from '@proton/pass/store/actions';
import type { WithSenderAction } from '@proton/pass/store/actions/with-receiver';
import type { ProxiedSettings } from '@proton/pass/store/reducers/settings';
import { selectProxiedSettings } from '@proton/pass/store/selectors';
import type { RootSagaOptions } from '@proton/pass/store/types';
import { partialMerge } from '@proton/pass/utils/object/merge';

function* settingsEditWorker(
    { onSettingsUpdated, onLocaleUpdated }: RootSagaOptions,
    { meta, payload }: WithSenderAction<ReturnType<typeof settingsEditIntent>>
) {
    try {
        const settings: ProxiedSettings = yield select(selectProxiedSettings);
        /* `disallowedDomains` update should act as a setter */
        if ('disallowedDomains' in payload) settings.disallowedDomains = {};

        if (payload.locale) onLocaleUpdated?.(payload.locale);
        yield onSettingsUpdated?.(partialMerge(settings, payload));

        yield put(settingsEditSuccess(meta.request.id, payload, meta.request.data.silent, meta.sender?.endpoint));
    } catch (e) {
        yield put(settingsEditFailure(meta.request.id, e, meta.sender?.endpoint));
    }
}

export default function* watcher(options: RootSagaOptions) {
    yield takeEvery(settingsEditIntent.match, settingsEditWorker, options);
}
