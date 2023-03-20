import { useEffect, useState } from 'react';

export const alphabeticChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const digits = '0123456789';
export const specialChars = '!#$%&()*+.:;<=>?@[]^';

export enum CharType {
    Alphabetic,
    Digit,
    Special,
}

export const generatePassword = (options: { useSpecialChars: boolean; length: number }) => {
    const chars = Array.from(alphabeticChars + digits + (options.useSpecialChars ? specialChars : ''));
    const randomValues = window.crypto.getRandomValues(new Uint8Array(options.length));

    const passwordChars = Array.from(randomValues).map((n) => {
        const rangeBoundMaxIndex = n % chars.length;
        return chars[rangeBoundMaxIndex];
    });

    return passwordChars.join('');
};

const DEFAULT_PASSWORD_LENGTH = 16;

export const usePasswordGenerator = () => {
    const [useSpecialChars, setUseSpecialChars] = useState(true);
    const [numberOfChars, setNumberOfChars] = useState(DEFAULT_PASSWORD_LENGTH);
    const [password, setPassword] = useState(() => generatePassword({ useSpecialChars, length: numberOfChars }));

    const regeneratePassword = () => {
        setPassword(generatePassword({ useSpecialChars, length: numberOfChars }));
    };

    useEffect(regeneratePassword, [useSpecialChars, numberOfChars]);

    return {
        useSpecialChars,
        password,
        numberOfChars,
        setUseSpecialChars,
        setNumberOfChars,
        setPassword,
        regeneratePassword,
    };
};

export type PasswordGeneratorContextValue = ReturnType<typeof usePasswordGenerator>;
