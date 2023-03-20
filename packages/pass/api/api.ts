import { Api } from '../types';

export let api: Api;

export const initApi = (value: Api) => (api = value);
