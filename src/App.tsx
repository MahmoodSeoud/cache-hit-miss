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

export function createRandomNumber(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a)) + a;
}

export interface LogEntry {
  address: number;
  hit: boolean;
  cacheEntries: CACHE_TABLE_ENTRY[][]
}

const logOfEntries: LogEntry[] = [];

function App() {
  const [addressBitWidth, setAddressBitWidth] = useState<number>(createRandomNumber(10, 14));
  const [maxAddress, setMaxAddress] = useState<number>(createRandomNumber(0, 256));
  const [address, setAddress] = useState<number>(maxAddress);

  const [cacheShouldBeCold, setCacheShouldBeCold] = useState<boolean>(false);

  const [cache, setCache] = useState<Cache>(initNonEmptyCache(4, 8, 2 ** createRandomNumber(0, 1)));
  const blockOffset: number = Math.log2(cache.blockSize);
  const setIndex: number = Math.log2(cache.numSets);
  const tag: number = addressBitWidth - (setIndex + blockOffset);
  const lineIndex: number = Math.floor(Math.random() * cache.linesPerSet);

  const addressInBits: string = address.toString(2).padStart(addressBitWidth, '0');
  const setIndexBits: string = addressInBits.slice(tag, - blockOffset);
  const tagBits: string = addressInBits.slice(0, tag);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));
  const toast = useRef<Toast>(null);


  useEffect(() => {
    setAddress(createRandomNumber(0, maxAddress));

  }, [addressBitWidth, maxAddress])

  useEffect(() => {
    let cache_;

    if (cacheShouldBeCold) {
      cache_ = initEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet);
    } else {
      cache_ = initNonEmptyCache(cache.numSets, cache.blockSize, cache.linesPerSet);
      setCacheShouldBeCold(false);
    }

    setCache(cache_);

  }, [cache.numSets, cache.linesPerSet, cache.blockSize, cacheShouldBeCold])

  useEffect(() => {
    console.log('-----------------------------------')
    console.log('cache', cache)
    console.log('address', address)
    console.log('addressInBits', address.toString(2).padStart(addressBitWidth, '0'))
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


  // Function to initialize the cache
  function initNonEmptyCache(numSets: number, blockSize: number, linesPerSet: number): Cache {


    const cache: Cache = {
      numSets: numSets,
      blockSize: blockSize,
      linesPerSet: linesPerSet,
      sets: [],
    }

    for (let i = 0; i < numSets; i++) {
      const set: CacheSet = {
        lines: [],
      };

      const address_ = createRandomNumber(0, maxAddress);
      const addressInBits_ = address_.toString(2).padStart(addressBitWidth, '0');
      const tagBits_: string = addressInBits_.slice(0, -(Math.log2(blockSize) + Math.log2(numSets)));

      const valid_: Bit = 1;
      const tag_: number = tagBits_.length
      const blockSizeStr_: string = `Mem[${address_} - ${address_ + blockSize - 1}]`;

      for (let j = 0; j < linesPerSet; j++) {
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
    return cache
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

  function cacheLookUp(assigmentType: string) {
    if (assigmentType === 'hit') {
      const cacheHitBlock = cache.sets[parseInt(setIndexBits, 2)].lines[lineIndex];
      const addressForCacheHitOnLookUp: string = (cacheHitBlock.tag.toString(2) +
        setIndexBits +
        createRandomNumberWith(blockOffset)
          .toString(2))
        .padStart(addressBitWidth, '0');

      const NewAddress = Number("0b" + addressForCacheHitOnLookUp)

      setAddress(NewAddress);
    } else {

      const NewAddress = createRandomNumber(0, maxAddress);
      setAddress(NewAddress);
    }
  }

  function isCacheHit(): boolean {
    const cacheBlock = cache.sets[parseInt(setIndexBits, 2)].lines[lineIndex];
    if (cacheBlock.valid === 1 && cacheBlock.tag === parseInt(tagBits, 2) && cacheBlock.blockSizeStr === 'Mem[' + address + '-' + (address + cache.blockSize - 1) + ']') {
      return true
    }
    return false
  }

  function isCacheEmpty(): boolean {
    return cache.sets.every(set => set.lines.every(line => line.empty === 1));
  }

  // The percentage is for the hit assignment type (20 means 20% for a hit assignment)
  function randomAssignment(probability: number) {
    // If you try to do a hit assignment on a cold cache, it will be a miss
    if (!isCacheEmpty() && Math.random() <= probability / 100) {
      cacheLookUp('hit')
    } else {
      cacheLookUp('miss')
    }
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


  function handleCacheButtonClick(userGuessedHit: boolean) {
    const propability = 50;
    const wasAHit = isCacheHit();
    const wasAMiss = !wasAHit;

    if (userGuessedHit) {
      if (wasAHit) {
        randomAssignment(propability);
        showSuccess('hit');
        // TODO: add to log
      } else {
        showFailure('hit');
      }
    } else {
      if (wasAMiss) {
        insertAddressInCache();
        //setCacheEntries(cache);
        randomAssignment(propability);
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
          setCache={setCache}
          tag={tag}
        />
      </div>

    </>
  )
}

export default App

