import { api } from '../api';
import { ResponseCodeSuccess } from '../types';

/**
 * The lock check endpoint will throw if the session
 * is locked - if the session is unlocked we'll get the
 * a { Code: 1000 } response
 */
export const isSessionLocked = async () => {
    try {
        const { Code } = await api({ url: 'pass/v1/user/session/lock/check', method: 'get' });
        return Code !== ResponseCodeSuccess.ProtonResponseCode_1000;
    } catch (e: any) {
        return e?.name === 'LockedSession';
    }
};

export const lockSessionImmediate = async (): Promise<void> => {
    await api({
        url: 'pass/v1/user/session/lock/force_lock',
        method: 'post',
    });
};

export const lockSession = async (LockCode: string, UnlockedSecs: number): Promise<string> =>
    (
        await api({
            url: 'pass/v1/user/session/lock',
            method: 'post',
            data: { LockCode, UnlockedSecs },
        })
    ).LockData!.StorageToken;

export const deleteSessionLock = async (LockCode: string): Promise<string> =>
    (
        await api({
            url: 'pass/v1/user/session/lock',
            method: 'delete',
            data: { LockCode },
        })
    ).LockData!.StorageToken;

export const unlockSession = async (LockCode: string): Promise<string> =>
    (
        await api({
            url: 'pass/v1/user/session/lock/unlock',
            method: 'post',
            data: { LockCode },
        })
    ).LockData!.StorageToken;
