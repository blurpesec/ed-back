import * as bip39 from 'bip39';
import * as crypto from 'crypto';

export const generateBackupPhrase = () => {
    const randomBytes = crypto.randomBytes(16);
    const newPhrase = bip39.entropyToMnemonic(randomBytes.toString('hex'));
    return(newPhrase);
}