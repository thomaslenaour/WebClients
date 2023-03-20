import { ItemRevision } from '../data';

export enum AutoSaveType {
    NEW,
    UPDATE,
}

export type AutoSavePromptOptions =
    | { shouldPrompt: false }
    | {
          shouldPrompt: true;
          data: { action: AutoSaveType.NEW } | { action: AutoSaveType.UPDATE; item: ItemRevision<'login'> };
      };

export type WithAutoSavePromptOptions<T, U = boolean> = T & {
    autosave: Extract<AutoSavePromptOptions, { shouldPrompt: U }>;
};
