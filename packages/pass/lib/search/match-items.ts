import type { Item, ItemRevision, ItemType } from '@proton/pass/types';
import { deobfuscate } from '@proton/pass/utils/obfuscate/xor';

import { matchAny } from './match-any';
import type { ItemMatchFunc, ItemMatchFuncMap } from './types';

export const matchesNoteItem: ItemMatchFunc<'note'> = ({ metadata: { name, note } }) =>
    matchAny([name, deobfuscate(note)]);

export const matchesLoginItem: ItemMatchFunc<'login'> = ({
    metadata: { name, note },
    content: { username, urls },
    extraFields,
}) =>
    matchAny([
        name,
        deobfuscate(note),
        deobfuscate(username),
        ...urls,
        ...extraFields.reduce<string[]>((terms, { fieldName, type, data }) => {
            if (type === 'text') terms.push(fieldName, deobfuscate(data.content));
            return terms;
        }, []),
    ]);

export const matchesAliasItem: ItemMatchFunc<'alias'> = ({ metadata: { name, note } }) =>
    matchAny([name, deobfuscate(note)]);

export const matchesCreditCardItem: ItemMatchFunc<'creditCard'> = ({
    metadata: { name, note },
    content: { cardholderName, number },
}) => matchAny([name, deobfuscate(note), cardholderName, deobfuscate(number)]);

/* Each item should expose its own searching mechanism :
 * we may include/exclude certain fields or add extra criteria
 * depending on the type of item we're targeting */
const itemMatchers: ItemMatchFuncMap = {
    login: matchesLoginItem,
    note: matchesNoteItem,
    alias: matchesAliasItem,
    creditCard: matchesCreditCardItem,
};

export const matchItem: ItemMatchFunc = <T extends ItemType>(item: Item<T>) => itemMatchers[item.type](item);

export const searchItems = <T extends ItemRevision>(items: T[], search?: string) => {
    if (!search || search.trim() === '') return items;
    return items.filter((item) => matchItem(item.data)(search));
};
