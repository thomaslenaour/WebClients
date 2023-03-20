import { State } from '../types';

export const selectEventId = ({ events: { eventId } }: State) => eventId;
