import { useEffect, useRef, useState } from 'react'
import { CACHE_TABLE_ENTRY } from './components/Cache_input_table/Cache_input_table'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';
import Settings from './components/Settings/Settings';
import { Toast } from 'primereact/toast';
import { ColorResult, HuePicker } from 'react-color';
import './Laratheme.css'
import './App.css'
import './components/Cache_input_table/Cache_input_table.css'
import { Button } from 'primereact/button';

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
interface CacheBlock {
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

export interface LogEntry {
  address: number;
  hit: boolean;
  cacheEntries: CACHE_TABLE_ENTRY[][]
}



const allAddresses: number[] = []
const availbeAddresses: number[] = []
const NUMSETS = 4 as const;
const BLOCKSIZE = 8 as const;
const LINESPERSET = 1 as const;
const MAXADDRESS = 256 as const;

function App() {
  const [addressBitWidth, setAddressBitWidth] = useState<number>(createRandomNumber(10, 14));

  const [maxAddress, setMaxAddress] = useState<number>(availbeAddresses.length > 0 ? availbeAddresses[availbeAddresses.length - 1] : MAXADDRESS);
  const [address, setAddress] = useState<number>(createRandomNumber(0, maxAddress / BLOCKSIZE) * 8);

  const [cacheShouldBeCold, setCacheShouldBeCold] = useState<boolean>(false);
  const [cache, setCache] = useState<Cache>(initEmptyCache(NUMSETS, BLOCKSIZE, LINESPERSET));
  const totalCacheSize: number = cache.numSets * cache.linesPerSet * cache.blockSize;

  const blockOffset: number = Math.log2(cache.blockSize);
  const setIndex: number = Math.log2(cache.numSets);
  const tag: number = addressBitWidth - (setIndex + blockOffset);
  const lineIndex: number = Math.floor(Math.random() * cache.linesPerSet);

  const addressInBits: string = address.toString(2).padStart(addressBitWidth, '0');
  const blockOffsetBits: string = addressInBits.slice(-blockOffset);
  const setIndexBits: string = addressInBits.slice(tag, -blockOffset);
  const tagBits: string = addressInBits.slice(0, tag);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const diff: number[] = allAddresses.filter((x: number) => !availbeAddresses.includes(x));
    if (diff.length === 0) setAddress(createRandomNumber(0, maxAddress / cache.blockSize) * cache.blockSize);
    else {
      setAddress(diff[Math.floor(Math.random() * diff.length)]);
    }
  }, [addressBitWidth, maxAddress])

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

    setCache(cache_);

  }, [cache.numSets, cache.linesPerSet, cache.blockSize, cacheShouldBeCold])

  useEffect(() => {
    /*     console.log('-----------------------------------')
        console.log('cache', cache)
        console.log('address', address)
        console.log('addressInBits', address.toString(2).padStart(addressBitWidth, '0')) */
    /*     console.log('allAddresses', allAddresses)
        console.log('availbeAddresses', availbeAddresses) */
  });



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
    const index = Math.floor(Math.random() * availbeAddresses.length);
    const address = availbeAddresses[index];
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
        let tagBits_ = generateTagBits(address_, blockSize, numSets);

        let valid_: Bit = 1;
        let tag_: number = Number('0b' + tagBits_);
        let blockSizeStr_: string = `Mem[${address_} - ${address_ + blockSize - 1}]`;

        const existingTag = knownTagsInSet.find(tag => tag.tagBits === tagBits_);
        if (existingTag) {
          let newTagBits: string;
          do {
            ({ address: address_, index: randomIndex } = generateAddress(availbeAddresses));
            newTagBits = generateTagBits(address_, blockSize, numSets);
          } while (knownTagsInSet.some(tag => tag.tagBits === newTagBits));
          tagBits_ = newTagBits;
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

    // Flatten the cache sets into a single array
    console.log('I made a hit')
    const cacheEntry: CacheBlock[] = cache.sets.flatMap(cacheBlock => cacheBlock.lines);
    const randCacheHitAddress = cacheEntry[Math.floor(Math.random() * cacheEntry.length)];
    const cacheHitAddrress = parseInt(randCacheHitAddress.blockSizeStr.slice(4, randCacheHitAddress.blockSizeStr.indexOf('-')));
    console.log("cachehit address in Hit", cacheHitAddrress)
    setAddress(cacheHitAddrress);
  }

  function createCacheMissAssigment() {
    // TODO: Check that the address does not exists in table already
    // Flatten the cache sets into a single array
    console.log('I made a miss')
    const cacheAddresses: number[] = cache.sets.flatMap(cacheBlock => cacheBlock
      .lines
      .map(line => parseInt(line.blockSizeStr
        .slice(4, line.blockSizeStr.indexOf('-')).trim())));

    // Create a new array that only includes addresses not in cache.sets
    const arr = []
    const maximum: number = Math.max(maxAddress, totalCacheSize);
    for (let k = 0; k < maximum; k += cache.blockSize) {
      arr.push(k);
    }

    const cacheMissAddresses = arr.filter(address => !cacheAddresses.includes(address));

    // Select a random address from the available addresses
    const randCacheMissAddress = cacheMissAddresses[Math.floor(Math.random() * cacheMissAddresses.length)];
    setAddress(randCacheMissAddress);

  }

  function isCacheHit(): boolean {
    const cacheBlock = cache.sets[parseInt(setIndexBits, 2)].lines[lineIndex];
    return (cacheBlock.valid === 1 && cacheBlock.tag === parseInt(tagBits, 2))
  }

  function isCacheEmpty(): boolean {
    return cache.sets.every(set => set.lines.every(line => line.empty === 1));
  }

  function insertAddressInCache(): void {
    const set = parseInt(setIndexBits, 2)
    const tag: number = Number('0b' + tagBits);

    setCache(prevState => {
      const newCache = { ...prevState };
      const cacheBlock = newCache.sets[set].lines[lineIndex];

      cacheBlock.tag = tag;
      cacheBlock.valid = 1;
      cacheBlock.empty = 0;
      cacheBlock.blockSizeStr = `Mem[${address}-${address + cache.blockSize - 1}]`;

      return newCache
    })
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
    const wasAHit = isCacheHit();
    const wasAMiss = !wasAHit;

    if (userGuessedHit) {
      if (wasAHit) {
        randomAssignment(probabilityOfGettingACacheHit);
        showSuccess('hit');
        // TODO: add to log
      } else {
        showFailure('hit');
      }
    } else {
      if (wasAMiss) {
        insertAddressInCache();
        //setCacheEntries(cache);
        randomAssignment(probabilityOfGettingACacheHit);
        showSuccess('miss');
        // TODO: add to log

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


  interface Log {
    logs: LogEntry[]

  }
  return (
    <>

      <Settings
        maxAddress={maxAddress}
        setMaxAddress={setMaxAddress}
        assignmentType={''}
        addressBitWidth={addressBitWidth}
        setAddressBitWidth={setAddressBitWidth}
        numSets={cache.numSets}
        setCache={setCache}
        linesPerSet={cache.linesPerSet}
        setCacheShouldBeCold={setCacheShouldBeCold}
      />


      <Toast ref={toast} />
      <div className='logAssignmentWrapper'>
        <div className='input-header'>
          <div className="input-buttons">

            <Button
              severity='warning'
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
          <h3>tag bits:{tag}</h3>
          <h3>set bits:{setIndex}</h3>
          <h3>offset bits:{blockOffset}</h3>
        </div>
        <div className='virtual-wrapper'>
          <div className={`list-item-wrapper`}>
            <button
              onClick={() => handleCacheButtonClick(true)}>
              Cache Hit
            </button>
            <button
              onClick={() => handleCacheButtonClick(false)}>Cache Miss</button>
          </div>

        </div>

        <Cache_visual_table
          cache={cache}
          tag={tag}
        />
      </div>

    </>
  )
}

export default App

