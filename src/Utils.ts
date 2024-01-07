/**
 * Creates a random number between [a, b]
 * @param {number} a - start interval of the random number 
 * @param {number} b - end interval of the random number (included)
 * @returns {number} a random number in the [a, b] interval
 */
export function createRandomNumber(a: number, b: number): number {
    // the b+1 to make [a, b-1] into [a, b]
    return Math.floor(Math.random() * (b + 1 - a)) + a;
}


/**
 * Generates a random number within a range determined by the bit length.
 *
 * @param {number} bitLength - The bit length of the number to generate.
 * @returns {number} - A random number within the range [2^(bitLength-1), 2^bitLength).
 */

export function createRandomNumberWith(bitLength: number): number {

    return createRandomNumber(2 ** (bitLength - 1), 2 ** bitLength)
}


/**
* Creates an array of nulls with a specified length.
*
* @param {number} addressWidth - The length of the array to create.
* @returns {Array<null>} - An array of nulls with the specified length.
*/
export function createNullArr(addressWidth: number): Array<null> {
    return Array(addressWidth).fill(null);
}

/**
 * Generates a random string of bits of a given length.
 *
 * @param {number} numBits - The number of bits to generate.
 * @returns {string} - A string of random bits of the given length.
 */
export function generateRandomBits(numBits: number): string {
    let bits = '';
    for (let i = 0; i < numBits; i++) {
        bits += Math.floor(Math.random() * 2).toString();
    }
    return bits;
}

/**
 * Removes specified keys from an object.
 *
 * @param {Object} obj - The object from which keys should be removed.
 * @param {...string} keysToRemove - The keys to remove from the object.
 * @returns {Object} A new object with the specified keys removed.
 *
 * @example
 * // returns { b: 2 }
 * removeObjectKey({ a: 1, b: 2 }, 'a')
 */
export function removeObjectKey(obj: { [key: string]: any }, ...keysToRemove: string[]): { [key: string]: any } {
    let newObj = { ...obj };
    keysToRemove.forEach(key => {
        const { [key]: _, ...rest } = newObj;
        newObj = rest;
    })

    return newObj;
}

/**
* Performs a deep comparison between two values to determine if they are equivalent.
*
* @param {any} object1 - The first value to compare.
* @param {any} object2 - The second value to compare.
* @returns {boolean} - Returns true if the values are equivalent, false otherwise.
*/
// TODO: FIx all the any types
export function deepEqual(object1: any, object2: any): boolean {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1: any = object1[key];
        const val2: any = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if a value is an object.
 *
 * @param {InputFields} object - The value to check.
 * @returns {boolean} - Returns true if the value is an object, false otherwise.
 */
export function isObject(object: Cache): boolean {
    return object != null && typeof object === 'object';
}


/**
 * 
 * @param str  The string to replace characters in
 * @param start The index to start replacing characters at
 * @param numChars The number of characters to replace
 * @param replacement The string to replace the characters with
 * @returns 
 */
export function replaceChars(str: string, start: number, numChars: number, replacement: string): string {
    const before = str.slice(0, start);
    const after = str.slice(start + numChars);
    return before + replacement + after;
}
