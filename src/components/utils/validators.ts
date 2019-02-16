import * as db from "../db";

export const isValidEthAddress = ( address: string ): boolean => {
    if (/^0x?[0-9A-Fa-f]{40,42}$/.test(address)) return true;
    return false
} 

export const isValidUpdateCode = async ( updateCode: string ): Promise<boolean> => {
    const getRecord = await db.get('SELECT * from backup WHERE phrase="' + updateCode + '"');
    if (getRecord !== undefined) return true;
    return false
}

export const isUsernameFree = async ( username: string ): Promise<boolean> => {
    const getRecord = await db.get('SELECT * from entries where username="' + username + '"');
    console.log('got record for username: ' + getRecord)
    if (getRecord === undefined) return true;
    return false;
}