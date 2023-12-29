import { useEffect, useRef, useState } from 'react'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';
import Cache_input_table from './components/Cache_input_table/Cache_input_table';
import Settings from './components/Settings/Settings';
import { Toast } from 'primereact/toast';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { ColorResult, HuePicker } from 'react-color';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import Log from './components/Log/Log';

import 'primereact/resources/themes/lara-light-teal/theme.css';
import './components/Cache_input_table/Cache_input_table.css'
import './App.css'
import 'primeicons/primeicons.css';

export const CacheInputFieldsMap = {
  blockStart: 'blockStart',
  blockEnd: 'blockEnd',
  valid: 'valid',
  tag: 'tag',
} as const;

const baseConversionMap = {
  Binary: 2,
  Decimal: 10,
  Hexadecimal: 16,
} as const;

const addressPrefixMap = {
  Binary: '0b',
  Decimal: '',
  Hexadecimal: '0x'
} as const;

const bitMap = {
  Zero: 0,
  One: 1
} as const;


// Cache block structure
export interface CacheBlock {
  blockStart: string; // The full address
  blockEnd: string; // The full address  + the block size
  tag: string;     // The tag of this block
  valid: Bit;  // Whether this block is valid
  empty: Bit;  // Whether this block is empty
}

// Cache set structure
export interface CacheSet {
  lines: CacheBlock[];  // The cache blocks in this set
}

// Cache structure
export interface Cache {
  numSets: number;   // The number of sets in the cache
  blockSize: number;
  linesPerSet: number;
  sets: CacheSet[];  // The sets in the cache
}

export type BaseConversion = typeof baseConversionMap[keyof typeof baseConversionMap];
export type AddressPrefix = typeof addressPrefixMap[keyof typeof addressPrefixMap];
export type InputField = typeof CacheInputFieldsMap[keyof typeof CacheInputFieldsMap];
export type Bit = typeof bitMap[keyof typeof bitMap];

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 *
 * @param {any} object1 - The first value to compare.
 * @param {any} object2 - The second value to compare.
 * @returns {boolean} - Returns true if the values are equivalent, false otherwise.
 */

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
 * Creates a random number between [a, b]
 * @param {number} a - start interval of the random number 
 * @param {number} b - end interval of the random number (included)
 * @returns {number} a random number in the [a, b] interval
 */
export function createRandomNumber(a: number, b: number): number {
  // the b+1 to make [a, b-1] into [a, b]
  return Math.floor(Math.random() * (b + 1 - a)) + a;
}

function replaceChars(str: string, start: number, numChars: number, replacement: string): string {
  const before = str.slice(0, start);
  const after = str.slice(start + numChars);
  return before + replacement + after;
}

interface LogEntry {
  address: number;
  hit: boolean;
  cache: Cache
  setIndexed: number;
  lineIndexed: number;
}

export interface LogHistory {
  logEntries: LogEntry[]
}

let allAddresses: number[] = []
let availbeAddresses: number[] = []
const NUMSETS = 4 as const;
const BLOCKSIZE = 8 as const;
const LINESPERSET = 1 as const;
const BYTE = 8 as const;
const TOTALCACHESIZE = NUMSETS * LINESPERSET * BLOCKSIZE * BYTE;

const log_: LogHistory = { logEntries: [] };

// TODO: For future reference, this is how you add two numbers in binary. When you got time you can implement this
// const addToBitsTogether = (a: number, b: number) => (a << Math.ceil(Math.log2(b)) + 1) + b;
let facit: any = null;
let assignmentType: string = 'miss';
function App() {
  const [maxAddress, _] = useState<number>(TOTALCACHESIZE);
  const [addressBitWidth, __] = useState<number>(maxAddress.toString(2).padStart(12, '0').length);
  const [address, setAddress] = useState<number>(createRandomNumber(0, maxAddress / BLOCKSIZE) * BLOCKSIZE);

  const [cacheShouldBeCold, setCacheShouldBeCold] = useState<boolean>(false);
  const [cache, setCache] = useState<Cache>(initEmptyCache(NUMSETS, BLOCKSIZE, LINESPERSET));
  const totalCacheSize: number = cache.numSets * cache.linesPerSet * cache.blockSize * BYTE; // S X L X B
  /*   console.log('facit', facit)
    console.log('cache', cache)
    console.log('---------------') */

  const [userGuessedHit, setUserGuessedHit] = useState<boolean>(false);

  /**
   * The number of block offset bits
   * @type {number}
   */
  const blockOffset: number = Math.log2(cache.blockSize);

  /**
   * The number of set index bits
   * @type {number}
   */
  const setIndex: number = Math.log2(cache.numSets);

  /**
   * The number of tag bits
   * @type {number}
   */
  const tag: number = addressBitWidth - (setIndex + blockOffset);

  /**
   * The random line index
   * @type {number}
   */
  const randomLineIndex: number = Math.floor(Math.random() * cache.linesPerSet);

  /**
   * The address in bits
   * @type {string}
   */
  const addressInBits: string = address.toString(2).padStart(addressBitWidth, '0');

  /**
   * The set index bits
   * @type {string}
   */
  const setIndexBits: string = addressInBits.slice(tag, -blockOffset);

  /**
   * The tag bits
   * @type {string}
   */
  const tagBits: string = addressInBits.slice(0, tag);

  /**
   * The value of the bits that represent the set index
   * @type {number}
   */
  const setValue: number = parseInt(setIndexBits, 2);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));
  const toast = useRef<Toast>(null);
  const [changedSet, setChangedSet] = useState<number | null>(null);
  const [changedLine, setChangedLine] = useState<number | null>(null);

  const cacheOptions: string[] = ['guess', 'input'];
  const [cacheValue, setCacheValue] = useState<string>(cacheOptions[0]);
  //const [wasAHit, lineIndex] = readCache(cache);
  const [log, setLog] = useState<LogHistory>(log_)
  const toastFacit = useRef<Toast | null>(null);

  useEffect(() => {
    assignmentType = createCacheMissAssigment(cache);
  }, [0]);

  useEffect(() => {
    facit = createFacit(cache);
  }, [address])


  /*   useEffect(() => {
      const diff: number[] = allAddresses.filter((x: number) => !availbeAddresses.includes(x));
      if (diff.length === 0) setAddress(createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize);
      else {
        setAddress(diff[Math.floor(Math.random() * diff.length)]);
      }
    }, [addressBitWidth]) */

  useEffect(() => {
    allAddresses.length = 0;
    availbeAddresses.length = 0;
    for (let k = 0; k < totalCacheSize; k += cache.blockSize) {
      availbeAddresses.push(k);
      allAddresses.push(k);
    }

    let cache_;

    if (cacheShouldBeCold || cacheValue === 'input') {
      cache_ = initEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet);
    } else {
      cache_ = initNonEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet, availbeAddresses);
      setCacheShouldBeCold(false);
    }

    log_.logEntries.length = 0;
    setLog(log_);
    setCache(cache_);
    setAddress(createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize);

    facit = createFacit(cache_);

  }, [
    cache.numSets,
    cache.linesPerSet,
    cache.blockSize,
    cacheShouldBeCold,
    cacheValue
  ])


  /**
  * Displays a success toast notification.
  */
  function showSuccess(cacheAssignmentType: string): void {
    toast.current?.show({
      severity: 'success',
      summary: 'Correct!',
      detail: 'Correct! The address: ' + address.toString(2).padStart(addressBitWidth, '0') + '\nwas a cache ' + cacheAssignmentType + ' assignment',
      life: 1500
    });
  }

  /**
  * Displays a failure toast notification.
  */
  function showFailure(cacheAssignmentType: string, extraErrorMsg?: string): void {
    toast.current?.show({
      severity: 'error',
      summary: 'Wrong',
      detail: 'Not right, The address: ' + address.toString(2).padStart(addressBitWidth, '0') +
        '\nwas a cache ' +
        cacheAssignmentType + ' assignment' + '\n' + extraErrorMsg,
      life: 1500
    });
  }

  function showFacitFilled(): void {
    toast.current!.show({
      severity: 'info',
      detail: 'Filled the cache with the facit',
      life: 1500
    });
  };

  function generateAddress(availbeAddresses: number[]): { address: number, index: number } {
    let index;
    let address;
    index = Math.floor(Math.random() * availbeAddresses.length);
    address = availbeAddresses[index];
    return { address, index };
  }

  function generateTagBits(address: number, blockSize: number, numSets: number): string {
    const addressInBits = address.toString(2).padStart(addressBitWidth, '0');
    return addressInBits.slice(0, -(Math.log2(blockSize) + Math.log2(numSets)));
  }


  // Function to initialize the cache
  function initEmptyCache(numSets: number, blockSize: number, linesPerSet: number): Cache {
    const cache: Cache = {
      numSets: numSets,
      blockSize: blockSize,
      linesPerSet: linesPerSet,
      sets: [],
    };

    for (let i = 0; i < numSets; i++) {
      const set: CacheSet = {
        lines: [],
      };

      for (let j = 0; j < linesPerSet; j++) {
        const block: CacheBlock = {
          valid: 0,
          empty: 1,
          tag: '',
          blockStart: '',
          blockEnd: '',
        };
        set.lines.push(block);
      }

      cache.sets.push(set);
    }

    return cache;
  }


  function initNonEmptyCache(numSets: number, blockSize: number, linesPerSet: number, availbeAddresses: number[]): Cache {
    const cache: Cache = {
      numSets: numSets,
      blockSize: blockSize,
      linesPerSet: linesPerSet,
      sets: [],
    }

    for (let i = 0; i < numSets; i++) {
      const set: CacheSet = { lines: [] };
      const knownTagsInSet: { tagBits: string, valid: Bit }[] = [];


      for (let j = 0; j < linesPerSet; j++) {
        let { address: address_, index: randomIndex } = generateAddress(availbeAddresses);

        const setIndexBits_ = i.toString(2).padStart(setIndex, '0');
        let addressInBits = address_.toString(2).padStart(addressBitWidth, '0');
        // Replace the set index bits with the set index bits of the current set
        addressInBits = replaceChars(addressInBits, tag, setIndex, setIndexBits_);
        address_ = parseInt(addressInBits, 2);
        let tagBits_ = generateTagBits(address_, blockSize, numSets);
        let valid_: Bit = 1;
        let tag_: string = tagBits_;

        let blockStart_: string = address_.toString();
        let blockEnd_: string = (address_ + blockSize - 1).toString();
        let empty_: Bit = 0;

        const existingTag = knownTagsInSet.find(tag => tag.tagBits === tagBits_);
        if (existingTag) {
          let newTagBits: string;
          do {
            ({ address: address_, index: randomIndex } = generateAddress(availbeAddresses));
            const setIndexBits_ = i.toString(2).padStart(setIndex, '0');
            addressInBits = address_.toString(2).padStart(addressBitWidth, '0');
            // Replace the set index bits with the set index bits of the current set
            addressInBits = replaceChars(addressInBits, tag, setIndex, setIndexBits_);
            address_ = parseInt(addressInBits, 2);
            tagBits_ = generateTagBits(address_, blockSize, numSets);

          } while (knownTagsInSet.some(tag => tag.tagBits === newTagBits));
          valid_ = 1;
          tag_ = tagBits_;
          blockStart_ = address_.toString();
          blockEnd_ = (address_ + blockSize - 1).toString();
          empty_ = 0;
        }

        knownTagsInSet.push({ tagBits: tagBits_, valid: valid_ });
        availbeAddresses.splice(randomIndex, 1); // Remove the used address from the array

        const block: CacheBlock = {
          tag: tag_,
          valid: valid_,
          empty: empty_,
          blockStart: blockStart_,
          blockEnd: blockEnd_,
        };
        set.lines.push(block);
      }
      cache.sets.push(set);
    }
    return cache;
  }


  /**
 * Handles the mouse enter event on an element.
 *
 * @param {React.MouseEvent} e - The mouse event object.
 */
  function handleMouseDown(e: React.MouseEvent) {
    setIsMouseDown(true);
    const pTagWithIndex = e.currentTarget as HTMLElement;
    const isHighligted = pTagWithIndex.classList.contains('highlight');

    if (isHighligted) {
      pTagWithIndex.classList.remove('highlight');
      // Setting the color the the one selected in the color picker
      pTagWithIndex.style.backgroundColor = "";
    } else {

      // Apply highlight to the current div
      pTagWithIndex.classList.add('highlight');
      // Setting the color the the one selected in the color picker
      pTagWithIndex.style.backgroundColor = color;

    }
  }

  /**
   * Handles the mouse up event.
   */
  function handleMouseUp() {
    setIsMouseDown(false);
  };

  /**
 
* Handles the mouse enter event on an element.
*
* @param {React.MouseEvent} e - The mouse event object.
*/
  function handleMouseEnter(e: React.MouseEvent) {
    if (isMouseDown) {
      // Apply highlight to the current div
      const pTagWithIndex = e.currentTarget as HTMLElement;
      pTagWithIndex.classList.add('highlight');

      // Setting the color the the one selected in the color picker
      pTagWithIndex.style.backgroundColor = color;
    }
  };


  function createCacheHitAssignment(cache: Cache): string {

    function getValidCacheBlocks(cache: Cache): CacheBlock[] {
      return cache
        .sets
        .flatMap(cacheBlock => cacheBlock.lines)
        .filter(line => line.valid === 1);
    }

    // First try to get a cache block with the same tag
    let cacheBlocks: CacheBlock[] = getValidCacheBlocks(cache);

    
    const cacheHitBlock = cacheBlocks[Math.floor(Math.random() * cacheBlocks.length)];
    const cacheHitAddress = parseInt(cacheHitBlock.blockStart);
    
    if (cacheHitAddress === null || cacheHitAddress === undefined) {
      return createCacheMissAssigment(cache);
    } else {
      console.log('I made a hit')
      setAddress(cacheHitAddress);
      debugger
      return 'hit';
    }
  }


  function createCacheMissAssigment(cache: Cache): string {
    const allPossibleAddresses: string[] = [];
    for (let k = 0; k < maxAddress; k += cache.blockSize) {
      allPossibleAddresses.push(k.toString(2).padStart(addressBitWidth, '0'));
    }

    console.log('cache', cache)

    const allTagsPossible: string[] = allPossibleAddresses.map(address => address.slice(0, tag));
    const cacheTags = cache.sets.flatMap(set => set.lines.map(line => line.tag));
    const availableTags = allTagsPossible.filter(tag => !cacheTags.includes(tag));

    // Select a random tag from the available tags
    const randomAvailableTag = availableTags[Math.floor(Math.random() * availableTags.length)];

    // Find the corresponding address for the selected tag
    const randomAvailableAddresses = allPossibleAddresses.filter(address => address.slice(0, tag) === randomAvailableTag);
    const randomAvailableAddress = randomAvailableAddresses[Math.floor(Math.random() * randomAvailableAddresses.length)];

    if (randomAvailableAddress === null || randomAvailableAddress === undefined ) {
      return createCacheHitAssignment(cache)
    } else {
      console.log('I made a miss')
      // If a corresponding address was found, set it
      const newAddress = parseInt(randomAvailableAddress, 2);
      debugger
      setAddress(newAddress);
      return 'miss';
    }
  }

  function readCache(cache: Cache): [boolean, number | null] {

    const isCacheHit = cache.sets[setValue].lines.some(line => line.tag === tagBits && line.valid === 1);
    const cacheBlock = cache.sets[setValue].lines.findIndex(line => line.tag === tagBits && line.valid === 1);

    debugger
    return [isCacheHit, cacheBlock];
  }

  function isCacheEmpty(): boolean {
    return cache.sets.every(set => set.lines.every(line => line.empty === 1));
  }

  function writeToCache(cache: Cache): Cache {

    const newCache = JSON.parse(JSON.stringify(cache));
    const cacheBlock = newCache.sets[setValue].lines[randomLineIndex];
    console.log('I insert')

    cacheBlock.tag = tagBits;
    cacheBlock.valid = 1;
    cacheBlock.empty = 0;
    cacheBlock.blockStart = address.toString();
    cacheBlock.blockEnd = (address + cache.blockSize - 1).toString();
    console.log("newCache:", newCache)
    setCache(newCache);
    return newCache
  }

  function markCacheBlock(set: number, line: number): void {
    setChangedSet(set);
    setChangedLine(line);
  }

  // The percentage is for the hit assignment type (20 means 20% for a hit assignment)
  function generateRandomAssignment(cache: Cache, probability: number): string {
    // If you try to do a hit assignment on a cold cache, it will be a miss
    if (!isCacheEmpty() && Math.random() <= probability / 100) {
      return createCacheHitAssignment(cache);
    } else {
      return createCacheMissAssigment(cache);
    }
  }

  function handleVisualCacheButtonClick(cache: Cache, userGuessedHit: boolean) {

    const probabilityOfGettingACacheHit = 50;
    const [isCacheHit, lineIndex] = readCache(cache);
    const newCache = JSON.parse(JSON.stringify(cache));


    if (userGuessedHit && isCacheHit) {
      showSuccess('hit');
      markCacheBlock(setValue, lineIndex!);
      assignmentType = generateRandomAssignment(cache, probabilityOfGettingACacheHit);
      // Updating the log

      const newLogEntry: LogEntry = {
        address: address,
        hit: true,
        cache: newCache,
        setIndexed: setValue,
        lineIndexed: lineIndex!
      }

      log_.logEntries.push(newLogEntry);
      setLog(log_);

    } else if (!userGuessedHit && !isCacheHit) {
      showSuccess('miss');
      const writtenCache: Cache = writeToCache(newCache);
      markCacheBlock(setValue, randomLineIndex);
      assignmentType = generateRandomAssignment(writtenCache,probabilityOfGettingACacheHit);

      const newLogEntry: LogEntry = {
        address: address,
        hit: false,
        cache: JSON.parse(JSON.stringify(cache)),
        setIndexed: setValue,
        lineIndexed: randomLineIndex
      }
      log_.logEntries.push(newLogEntry);
      setLog(log_);
    } else {
      if (userGuessedHit) {
        showFailure('hit');
      } else {
        showFailure('miss');
      }
    }
  }

  /**
 * Handles changes in color selection.
 *
 * @param {ColorResult} color - The new color selected by the user.
 */
  function handleColorChange(color: ColorResult): void {
    setColor(color.hex)
  }


  /**
* Resets the colors of all highlighted elements to their initial state.
*/
  function resetColors(): void {
    const bitElements = document.getElementsByClassName('input-text') as HTMLCollectionOf<HTMLElement>;
    const textElements = document.getElementsByClassName('exercise-label') as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < bitElements.length; i++) {
      const isHighligted = bitElements && bitElements[i] && bitElements[i].classList.contains('highlight');

      if (isHighligted) {
        bitElements[i].classList.remove('highlight');
        bitElements[i].style.backgroundColor = '';
      }
    }

    for (let i = 0; i < bitElements.length; i++) {
      const isHighligted = textElements && textElements[i] && textElements[i].classList.contains('highlight');

      if (isHighligted) {
        textElements[i].classList.remove('highlight');
        textElements[i].style.backgroundColor = '';
      }
    }
  }


  /**
 * Creates an array of nulls with a specified length.
 *
 * @param {number} addressWidth - The length of the array to create.
 * @returns {Array<null>} - An array of nulls with the specified length.
 */
  function createNullArr(addressWidth: number): Array<null> {
    return Array(addressWidth).fill(null);
  }


  function handleAssignmentTypeSwitch(e: SelectButtonChangeEvent) {
    // If the user tries to click it the same btn again, do nothing
    if (e.value === null || e.value === undefined) return

    setCacheValue(e.value);
    if (e.target.value === 'guess') {
      setCache(initNonEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet, availbeAddresses));
    } else {
      setCache(initEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet));
    }

    log_.logEntries.length = 0;
    setLog(log_);
  }


  function createFacit(cache: Cache): Cache {
    //const [cacheHit, _] = readCache(cache);
    const cacheHit = assignmentType === 'hit';
    const newCache = JSON.parse(JSON.stringify(cache));

    if (!cacheHit) {
      const cacheBlock = newCache.sets[setValue].lines[randomLineIndex];

      cacheBlock.tag = tagBits;
      cacheBlock.valid = 1;
      cacheBlock.empty = 0;
      cacheBlock.blockStart = address.toString();
      cacheBlock.blockEnd = (address + cache.blockSize - 1).toString();

      // Update the cache
      newCache.sets[setValue].lines[randomLineIndex] = cacheBlock;
    }

    return newCache
  }

  function validateCacheMiss(cache: Cache, facit: Cache): boolean {
    return deepEqual(cache, facit);
  }

  function validateCacheHit(cache: Cache, facit: Cache): boolean {
    // Create a deep copy of the cache and facit objects
    const cacheCopy = JSON.parse(JSON.stringify(cache));
    const facitCopy = JSON.parse(JSON.stringify(facit));

    // Removing the blockStart and blocKEnd keys from the cache
    cacheCopy.sets = cacheCopy.sets.map((set: CacheSet) => {
      return {
        ...set,
        lines: set.lines.map((line: CacheBlock) => removeObjectKey(line, 'blockStart', 'blockEnd'))
      };
    });

    // Removing the blockStart and blocKEnd keys from the facit
    facitCopy.sets = facitCopy.sets.map((set: CacheSet) => {
      return {
        ...set,
        lines: set.lines.map(line => removeObjectKey(line, 'blockStart', 'blockEnd'))
      };
    });

    return deepEqual(cacheCopy, facitCopy);
  }

  function removeObjectKey(obj: { [key: string]: any }, ...keysToRemove: string[]): { [key: string]: any } {
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
  function deepEqual(object1: any, object2: any): boolean {
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
  function isObject(object: Cache): boolean {
    return object != null && typeof object === 'object';
  }

  function handleSubmitClick(cache: Cache, userGuessedHit: boolean) {
    const probabilityOfGettingACacheHit = 50;
    const isValidCacheInsertion = validateCacheMiss(cache, facit);
    const isValidCacheHit = validateCacheHit(cache, facit);

    const wasAHit = assignmentType === 'hit';
    if (userGuessedHit && wasAHit && isValidCacheHit) {
      assignmentType = generateRandomAssignment(cache, probabilityOfGettingACacheHit);
      const newLogEntry: LogEntry = {
        address: address,
        hit: true,
        cache: cache,
        setIndexed: setValue,
        lineIndexed: randomLineIndex
      }

      log_.logEntries.push(newLogEntry);
      setLog(log_);
      showSuccess('hit');
    } else if (!userGuessedHit && !wasAHit && isValidCacheInsertion) {
      assignmentType = generateRandomAssignment(cache, probabilityOfGettingACacheHit);
      const newLogEntry: LogEntry = {
        address: address,
        hit: false,
        cache: cache,
        setIndexed: setValue,
        lineIndexed: randomLineIndex
      }

      log_.logEntries.push(newLogEntry);
      setLog(log_);
      showSuccess('miss');
    } else {
      const errMsg = 'Either you guessed wrong or the cache is not valid'
      if (userGuessedHit) {
        showFailure('miss', errMsg);
      } else {
        showFailure('hit', errMsg);
      }
    }
  }

  function handleFillWithFacit() {
    const wasAHit = assignmentType === 'hit';
    setUserGuessedHit(wasAHit);
    showFacitFilled();
    const userGuessedHit = wasAHit;
    handleSubmitClick(facit, userGuessedHit);
    setCache(facit);
  }

  return (
    <>
      <Toast ref={toast} />
      <Toast ref={toastFacit} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <Settings
          numSets={cache.numSets}
          linesPerSet={cache.linesPerSet}
          blockSize={cache.blockSize}
          setCache={setCache}
          setCacheShouldBeCold={setCacheShouldBeCold}
        />

        <Log
          log={log}
          tag={tag}
          addressBitWidth={addressBitWidth}
        />
      </div>

      <h1>Cache Assignment</h1>
      <div className='logAssignmentWrapper'>
        <div className='input-header'>
          <div className="input-buttons">

            <Button
              severity='danger'
              onClick={resetColors}
              style={{ margin: '1rem' }}
            >
              Reset the colors
            </Button>

          </div>
          <HuePicker
            width={'200px'}
            color={color}
            onChange={handleColorChange}
          />
          <h4>Click and drag to highlight bits or labels <br /> </h4>
          <div className={`list-item-bit-input-wrapper `}>
            {createNullArr(addressBitWidth).map((_, index) => (
              <div
                key={index}
                className='input-wrapper'
                onMouseUp={handleMouseUp}
              // TODO: Maybe change the coloring to appear when clicking on this div aswell
              >
                <p
                  id='vbit-index'
                  className="input-text"
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                >
                  {addressBitWidth - index - 1}
                </p>
                <div
                  id='vbit'
                  autoFocus={false}
                  autoCapitalize='off'
                  className={'vbit-input'}
                >
                  {addressInBits[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Block offset bits: {blockOffset}</h3>
          <h3>Set bits: {setIndex}</h3>
          <h3>Tag bits: {tag}</h3>
          <h3>Block size: {cache.blockSize}</h3>
        </div>
        <div className='virtual-wrapper'>
          <SelectButton
            value={cacheValue}
            onChange={(e: SelectButtonChangeEvent) => handleAssignmentTypeSwitch(e)}
            options={cacheOptions}

          />

          {cacheValue === 'input' ?
            <div>
              <h3>Cache hit?</h3>
              <InputSwitch
                checked={userGuessedHit}
                onChange={(e) => setUserGuessedHit(e.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                <Button
                  label="Submit"
                  severity='success'
                  onClick={() => handleSubmitClick(cache, userGuessedHit)}
                  style={{ marginRight: '1rem' }}
                />
                <Button
                  onClick={() => handleFillWithFacit()}
                  label='Fill with facit'
                  severity='help'
                />
              </div>
            </div>
            :
            <div className={`list-item-wrapper`}>

              <Button
                onClick={() => handleVisualCacheButtonClick(cache, true)}
                severity='success'
                label='Cache Hit'
              />
              <Button
                onClick={() => handleVisualCacheButtonClick(cache, false)}
                severity='danger'
                label='Cache Miss'
              />
            </div>
          }
        </div>

        {cacheValue === 'input' ?
          <Cache_input_table
            cache={cache}
            tag={tag}
            setCache={setCache}
            maxAddress={maxAddress}
            userGuessHit={userGuessedHit}
          />
          :
          <Cache_visual_table
            cache={cache}
            tag={tag}
            changedSet={changedSet}
            changedLine={changedLine}
          />
        }
      </div>
    </>
  )
}

export default App


