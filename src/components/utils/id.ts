import { sha3_256 } from 'js-sha3';

export const getID = async(input) => {
  const sha = await sha3_256(input).substring(2,10)
  return sha;
}

