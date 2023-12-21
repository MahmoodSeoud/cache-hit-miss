import { useEffect, useRef, useState } from 'react'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';
import Cache_input_table from './components/Cache_input_table/Cache_input_table';
import Settings from './components/Settings/Settings';
import { Toast } from 'primereact/toast';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { ColorResult, HuePicker } from 'react-color';
import { Button } from 'primereact/button';
import Log from './components/Log/Log';

import './Laratheme.css'
import './components/Cache_input_table/Cache_input_table.css'
import './App.css'
import 'primeicons/primeicons.css';

export const InputFieldsMap = {
  /*   VirtualAddress: 'VirtualAddress',
    Offset: 'Offset',
    Index: 'Index',
    Tag: 'Tag',
    Valid: 'Valid', */
  Hit: 'Hit',
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
  valid: Bit;  // Whether this block is valid
  empty: Bit;  // Whether this block is empty
  tag: number;     // The tag of this block
  blockSizeStr: string; // The Mem[x - y] string
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
export type InputField = typeof InputFieldsMap[keyof typeof InputFieldsMap];
export type Result = Pick<typeof InputFieldsMap, 'Hit'>[keyof Pick<typeof InputFieldsMap, 'Hit'>];
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

const allAddresses: number[] = []
const availbeAddresses: number[] = []
const NUMSETS = 4 as const;
const BLOCKSIZE = 8 as const;
const LINESPERSET = 1 as const;
const MAXADDRESS = 8192 as const;

const log_: LogHistory = { logEntries: [] };
function App() {

  const [maxAddress, _] = useState<number>(MAXADDRESS);
  const [addressBitWidth, setAddressBitWidth] = useState<number>(maxAddress.toString(2).padStart(14, '0').length);
  const [address, setAddress] = useState<number>(createRandomNumber(0, maxAddress / BLOCKSIZE) * BLOCKSIZE);

  const [cacheShouldBeCold, setCacheShouldBeCold] = useState<boolean>(false);
  const [cache, setCache] = useState<Cache>(initEmptyCache(NUMSETS, BLOCKSIZE, LINESPERSET));
  const totalCacheSize: number = cache.numSets * cache.linesPerSet * cache.blockSize; // S X L X B
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

  /**
   * The value of the bits that represent the tag
   * @type {number}
   */
  const tagValue: number = parseInt(tagBits, 2);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));
  const toast = useRef<Toast>(null);
  const [changedSet, setChangedSet] = useState<number | null>(null);
  const [changedLine, setChangedLine] = useState<number | null>(null);

  const cacheOptions: string[] = ['guess', 'input'];
  const [cacheValue, setCacheValue] = useState<string>(cacheOptions[0]);
  const [log, setLog] = useState<LogHistory>(log_)



  useEffect(() => {
    createCacheMissAssigment();
  }, [0]);

  useEffect(() => {
    const diff: number[] = allAddresses.filter((x: number) => !availbeAddresses.includes(x));
    if (diff.length === 0) setAddress(createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize);
    else {
      setAddress(diff[Math.floor(Math.random() * diff.length)]);
    }
  }, [addressBitWidth])

  useEffect(() => {
    const maximum: number = Math.max(maxAddress, totalCacheSize);
    for (let k = 0; k < maximum; k += cache.blockSize) {
      availbeAddresses.push(k);
      allAddresses.push(k);
    }

    let cache_;

    if (cacheShouldBeCold) {
      cache_ = initEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet);
    } else {
      cache_ = initNonEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet, availbeAddresses);
      setCacheShouldBeCold(false);
    }
    log_.logEntries.length = 0;
    setLog(log_);
    setCache(cache_);
    setAddress(createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize);

  }, [cache.numSets, cache.linesPerSet, cache.blockSize, cacheShouldBeCold])


  /**
  * Displays a success toast notification.
  */
  function showSuccess(cacheAssignmentType: string): void {
    toast.current?.show({
      severity: 'success',
      summary: 'Correct!',
      detail: 'Correct! The address: ' + address.toString(2).padStart(addressBitWidth, '0') + '\nwas a cache ' + cacheAssignmentType + ' assignment',
      life: 3000
    });
  }

  /**
  * Displays a failure toast notification.
  */
  function showFailure(cacheAssignmentType: string): void {
    toast.current?.show({
      severity: 'error',
      summary: 'Wrong',
      detail: 'Not right, The address: ' + address.toString(2).padStart(addressBitWidth, '0') + '\nwas a cache ' + cacheAssignmentType + ' assignment',
      life: 3000
    });
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
          tag: 0,
          valid: 0,
          empty: 1,
          blockSizeStr: '',
        };
        set.lines.push(block);
      }

      cache.sets.push(set);
    }

    return cache;
  }


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
        let tag_: number = Number('0b' + tagBits_);
        let blockSizeStr_: string = `Mem[${address_} - ${address_ + blockSize - 1}]`;

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
          tag_ = Number('0b' + tagBits_);
          blockSizeStr_ = `Mem[${address_} - ${address_ + blockSize - 1}]`;
        }

        knownTagsInSet.push({ tagBits: tagBits_, valid: valid_ });
        availbeAddresses.splice(randomIndex, 1); // Remove the used address from the array

        const block: CacheBlock = {
          tag: tag_,
          valid: valid_,
          empty: 0,
          blockSizeStr: blockSizeStr_,
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

  function createCacheHitAssignment() {


    function getCacheBlocks(cache: Cache, checkTag: boolean) {
      return cache
        .sets
        .filter((_, index) => index !== setValue)
        .flatMap(cacheBlock => cacheBlock.lines)
        .filter(line => line.valid === 1 && (!checkTag || line.tag === tagValue));
    }

    // First try to get a cache block with the same tag
    let cacheBlocks: CacheBlock[] = getCacheBlocks(cache, true);

    if (cacheBlocks.length === 0) {
      // If there are no cache blocks with the same tag, get any cache block that are valid
      cacheBlocks = getCacheBlocks(cache, false);
    }

    console.log('I made a hit')

    const cacheHitBlock = cacheBlocks[Math.floor(Math.random() * cacheBlocks.length)];
    //const set_ = cache.sets.findIndex(set => set.lines.includes(cacheHitBlock));
    //const line_ = cache.sets[set_].lines.findIndex(line => line === cacheHitBlock);
    const cacheHitAddress = parseInt(cacheHitBlock.blockSizeStr.slice(4, cacheHitBlock.blockSizeStr.indexOf('-')));


    setAddress(cacheHitAddress);
  }

  // TODO: For future reference, this is how you add two numbers in binary. When you got time you can implement this
  // const addToBitsTogether = (a: number, b: number) => (a << Math.ceil(Math.log2(b)) + 1) + b;

  function createCacheMissAssigment() {
    //const set_ = parseInt(setIndexBits, 2);
    //const tag_: number = parseInt(tagBits, 2);
    //const line_ = randomLineIndex;

    // Create a new array that only includes addresses not in cache.sets
    const allAddressePossible = [];
    for (let k = 0; k < maxAddress; k++) {
      allAddressePossible.push(k);
    }

    const allTags: Set<number> = new Set(
      [...allAddressePossible]
        .map(address => parseInt(address.toString(2)
          .padStart(addressBitWidth, '0')
          .slice(1, tag), 2)
        ));

    // Flatten the cache sets into a single array
    const cacheTags: number[] = cache
      .sets
      .flatMap(cacheBlock => cacheBlock.lines.map(line => line.tag));

    const availableTags = Array
      .from(allTags)
      .filter((tag) => !cacheTags.includes(tag));

    const randomAvailableTag = availableTags[Math.floor(Math.random() * availableTags.length)];
    if (randomAvailableTag === undefined) debugger;

    let randomAvailableAddress = (createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize)
      .toString(2)
      .padStart(addressBitWidth, '0');

    // Calculate the address corresponding to the selected tag
    randomAvailableAddress =
      replaceChars(randomAvailableAddress,
        0,
        tag,
        randomAvailableTag
          .toString(2)
          .padStart(tag, '0'));


    console.log('I made a miss')

    setAddress(parseInt(randomAvailableAddress, 2) / cache.blockSize);
  }

  function isCacheHit(): [boolean, number | null] {

    const isCacheHit = cache.sets[setValue].lines.some(line => line.tag === tagValue && line.valid === 1)
    const cacheBlock = cache.sets[setValue].lines.findIndex(line => line.tag === tagValue && line.valid === 1);

    return [isCacheHit, cacheBlock];
  }

  function isCacheEmpty(): boolean {
    return cache.sets.every(set => set.lines.every(line => line.empty === 1));
  }

  function insertAddressInCache(): void {

    const newCache = JSON.parse(JSON.stringify(cache));
    const cacheBlock = newCache.sets[setValue].lines[randomLineIndex];
    console.log('I insert')

    cacheBlock.tag = tagValue;
    cacheBlock.valid = 1;
    cacheBlock.empty = 0;
    cacheBlock.blockSizeStr = `Mem[${address}-${address + cache.blockSize - 1}]`;

    setCache(newCache);
  }

  function highlightBlock(set: number, line: number): void {
    setChangedSet(set);
    setChangedLine(line);
  }

  // The percentage is for the hit assignment type (20 means 20% for a hit assignment)
  function randomAssignment(probability: number) {
    // If you try to do a hit assignment on a cold cache, it will be a miss
    if (!isCacheEmpty() && Math.random() <= probability / 100) {
      createCacheHitAssignment();
    } else {
      createCacheMissAssigment();
    }
  }

  function handleCacheButtonClick(userGuessedHit: boolean) {
    const probabilityOfGettingACacheHit = 70;
    const [wasAHit, lineIndex] = isCacheHit();
    const wasAMiss = !wasAHit;

    const newCache = JSON.parse(JSON.stringify(cache));
    if (userGuessedHit) {
      if (wasAHit) {
        showSuccess('hit');
        highlightBlock(setValue, lineIndex!);
        randomAssignment(probabilityOfGettingACacheHit);
        // Updating the log

        const newobj: LogEntry = {
          address: address,
          hit: true,
          cache: newCache,
          setIndexed: setValue,
          lineIndexed: lineIndex!
        }

        log_.logEntries.push(newobj);
        setLog(log_);


      } else {
        showFailure('hit');
      }
    } else {
      if (wasAMiss) {
        showSuccess('miss');
        insertAddressInCache();
        highlightBlock(setValue, randomLineIndex);
        randomAssignment(probabilityOfGettingACacheHit);

        const newobj: LogEntry = {
          address: address,
          hit: false,
          cache: JSON.parse(JSON.stringify(cache)),
          setIndexed: setValue,
          lineIndexed: randomLineIndex
        }
        log_.logEntries.push(newobj);
        setLog(log_);
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


  function handleCacheValueChange(e: SelectButtonChangeEvent) {
    setCacheValue(e.value);
    if (e.target.value === 'guess') {
      setCache(initNonEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet, availbeAddresses));
    } else {
      setCache(initEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet));
    }
    log_.logEntries.length = 0;
    setLog(log_);
  }

  return (
    <>
      <Toast ref={toast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <Settings
          assignmentType={''}
          addressBitWidth={addressBitWidth}
          setAddressBitWidth={setAddressBitWidth}
          numSets={cache.numSets}
          setCache={setCache}
          linesPerSet={cache.linesPerSet}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>tag bits: {tag}</h3>
          <h3>set bits: {setIndex}</h3>
          <h3>offset bits: {blockOffset}</h3>
        </div>
        <div className='virtual-wrapper'>
          <SelectButton value={cacheValue}
            onChange={(e: SelectButtonChangeEvent) => handleCacheValueChange(e)}
            options={cacheOptions}
          />
          {cacheValue === 'guess' &&
            <div className={`list-item-wrapper`}>
              <Button
                onClick={() => handleCacheButtonClick(true)}
                severity='success'
                label='Cache Hit'
              />
              <Button
                onClick={() => handleCacheButtonClick(false)}
                severity='danger'
                label='Cache Miss'
              />
            </div>
          }

        </div>


        {cacheValue === 'guess' ?
          <Cache_visual_table
            cache={cache}
            tag={tag}
            changedSet={changedSet}
            changedLine={changedLine}
          />
          :
          <Cache_input_table
            cache={cache}
            tag={tag}
            setCache={setCache}
          />
        }
      </div>

    </>
  )
}

export default App

