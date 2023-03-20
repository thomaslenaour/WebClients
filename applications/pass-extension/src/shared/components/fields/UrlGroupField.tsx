import { useRef } from 'react';

import { FieldArray, FormikContextType, FormikErrors } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms';
import { Icon, InputFieldTwo, Tooltip } from '@proton/components/';
import { isEmptyString } from '@proton/pass/utils/string';
import { isValidURL } from '@proton/pass/utils/url';

type UrlItem = { url: string; id: string };

export type UrlGroupValues = {
    url: string;
    urls: UrlItem[];
};

type UrlGroupProps<V extends UrlGroupValues = UrlGroupValues> = {
    form: FormikContextType<V>;
};

export const createNewUrl = (url: string) => ({
    id: uniqid(),
    url: isValidURL(url).url,
});

export const validateUrl = <V extends UrlGroupValues>({ url, urls }: V) => {
    if (!isEmptyString(url)) {
        const { valid: validURL, url: safeUrl } = isValidURL(url);
        const urlExists = urls.map(({ url }) => url).includes(safeUrl);

        if (!validURL) {
            return { url: c('Validation').t`Url is invalid` };
        }

        if (urlExists) {
            return { url: c('Validation').t`Url already exists` };
        }
    }

    return {};
};

export const validateUrls = <V extends UrlGroupValues>({ urls }: V) => {
    const urlsErrors = urls.map(({ url }) => {
        const isEmpty = isEmptyString(url);
        const { valid: validURL } = isValidURL(url);

        if (isEmpty) {
            return { url: c('Validation').t`Url cannot be empty` };
        }

        if (!validURL) {
            return { url: c('Validation').t`Url is invalid` };
        }

        return {};
    });

    return (urlsErrors.some(({ url }) => url !== undefined) ? { urls: urlsErrors } : {}) as FormikErrors<V>;
};

const UrlGroup = <V extends UrlGroupValues = UrlGroupValues>({ form }: UrlGroupProps<V>) => {
    const { values, errors, handleChange } = form;
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="field-two-container mb0-75">
            <label className="field-two-label-container flex">
                <span className="field-two-label">{c('Label').t`Websites`}</span>
            </label>

            <FieldArray
                name="urls"
                render={(helpers) => {
                    const handleReplace = (index: number) => (url: string) => {
                        const { id } = values.urls[index];

                        helpers.replace(index, { id, url });
                    };

                    const handleRemove = helpers.handleRemove;

                    const handleAdd = () => {
                        if (!errors.url) {
                            helpers.push(createNewUrl(values.url));
                            form.setFieldValue('url', '');
                        }

                        inputRef.current?.focus();
                    };

                    return (
                        <ul className="unstyled m0">
                            {values.urls.map(({ url, id }, index) => (
                                <li key={id} className="flex flex-nowrap mb0-5">
                                    <InputFieldTwo
                                        dense
                                        className="mr0-5"
                                        value={url}
                                        error={(errors.urls?.[index] as FormikErrors<UrlItem>)?.url}
                                        onValue={handleReplace(index)}
                                        onBlur={() => helpers.replace(index, { id, url: isValidURL(url).url })}
                                    />

                                    <Tooltip title={c('Action').t`Remove`}>
                                        <Button icon shape="ghost" onClick={handleRemove(index)}>
                                            <Icon name="trash" />
                                        </Button>
                                    </Tooltip>
                                </li>
                            ))}

                            <li className="flex flex-nowrap flex-align-items-start">
                                <InputFieldTwo
                                    className="mr0-5"
                                    name="url"
                                    dense
                                    value={values.url}
                                    error={errors.url}
                                    onChange={handleChange}
                                    onBlur={() => !errors.url && form.setFieldValue('url', isValidURL(values.url).url)}
                                    ref={inputRef}
                                />

                                <Tooltip title={c('Action').t`Add`}>
                                    <Button icon shape="outline" onClick={handleAdd}>
                                        <Icon name="plus" />
                                    </Button>
                                </Tooltip>
                            </li>
                        </ul>
                    );
                }}
            />
        </div>
    );
};

export default UrlGroup;
