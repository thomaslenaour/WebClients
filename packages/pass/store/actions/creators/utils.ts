import { AnyAction } from 'redux';

import { or } from '@proton/pass/utils/fp';

import { itemCreationIntent, itemEditIntent } from './item';

export const SYNCHRONOUS_ACTIONS = [itemEditIntent, itemCreationIntent];
export const isSynchronous = (action: AnyAction) => or(...SYNCHRONOUS_ACTIONS.map((action) => action.match))(action);
