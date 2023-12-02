import { useEffect, useRef, useState } from 'react'
import { CACHE_TABLE_ENTRY, InputFields } from './components/Cache_input_table/Cache_input_table'
import './App.css'
import './components/Cache_input_table/Cache_input_table.css'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';
import Settings from './components/Settings/Settings';
import { Toast } from 'primereact/toast';
import { ColorResult, HuePicker } from 'react-color';
import './Laratheme.css'


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
function isObject(object: InputFields): boolean {
  return object != null && typeof object === 'object';
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


export function createRandomNumber(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a)) + a;
}


/**
 *  
 *
 * @param {number} n - The number of indexes.
 * @returns {number} - number of numSets
*/
function generateLogn(n: number): number {
  return 2 ** n
}


function createTableEntry(entry: CACHE_TABLE_ENTRY, address: number, tag_bits: string): CACHE_TABLE_ENTRY {
  const valid: Bit = 0;


  let newEntry: CACHE_TABLE_ENTRY;

  newEntry = {
    ...entry,
    valid: Math.round(Math.random()) as Bit,
    tag: createRandomNumberWith(tag_bits.length), // TODO: make this random
    block: 'meme' // TODO: make this random
  };

  return newEntry;
}

function createTableEntries
  (numOfRows: number,
    numOfCols: number,
    cacheEntry: CACHE_TABLE_ENTRY,
    address: number,
    tag_bits: string
  ): CACHE_TABLE_ENTRY[][] {

  const entries: CACHE_TABLE_ENTRY[][] = [];

  for (let i = 0; i < numOfRows; i++) {
    const array: CACHE_TABLE_ENTRY[] = [];
    for (let j = 0; j < numOfCols; j++) {
      let entry = createTableEntry(cacheEntry, address, tag_bits)
      array.push(entry);
    }
    entries.push(array);
  }
  return entries;
}




interface LogEntry {
  address: number;
  hit: boolean;
  cacheEntries: CACHE_TABLE_ENTRY[][]
}

const logOfEntries: LogEntry[] = [];


function App() {
  const [addressBitWidth, setAddressBitWidth] = useState<number>(createRandomNumber(10, 14));
  const [address, setAddress] = useState<number>(createRandomNumberWith(addressBitWidth));

  const [indexAllocBits, setIndexAllocBits] = useState<number>(createRandomNumber(2, 4));
  const [numSets, setNumSets] = useState<number>(2 ** indexAllocBits);
  const [numLines, setNumLines] = useState<number>(2 ** createRandomNumber(0, 1));
  const [lineIndex, setLineIndex] = useState<number>(Math.floor(Math.random() * numLines));
  const [offsetAllocBits, setOffsetsetAllocBits] = useState(createRandomNumber(1, 4));
  const [tagAllocBits, setTagAllocBits] = useState<number>(addressBitWidth - indexAllocBits - offsetAllocBits);

  const [addressInBits, setAddressInBits] = useState<string[]>([...address.toString(2)]);
  const deepCopy = JSON.parse(JSON.stringify(addressInBits));

  const [offSet_bits, setOffset_bits] = useState<string>(deepCopy.splice(-offsetAllocBits).join(''));
  const [index_bits, setIndex_bits] = useState<string>(deepCopy.splice(-indexAllocBits).join(''));
  const [tag_bits, setTag_bits] = useState<string>(deepCopy.join(''));

  const [isMouseDown, setIsMouseDown] = useState(false);


  const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));

  const toast = useRef<Toast>(null);


  // TODO: maybe look int making these to state variables
  const coldCache = createTableEntries(numSets, numLines, { tag: 0, block: '', valid: 0 }, address, tag_bits)
  const [cacheEntries, setCacheEntries] = useState<CACHE_TABLE_ENTRY[][]>(coldCache);




  /**
  * Displays a success toast notification.
  */
  function showSuccess(cacheAssignmentType: string): void {
    toast.current?.show({
      severity: 'success',
      summary: 'Correct!',
      detail: 'Not right, The address: ' + address.toString(2) + '\nwas a cache ' + cacheAssignmentType + ' assignment',
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
      detail: 'Not right, The address: ' + address.toString(2) + '\nwas a cache ' + cacheAssignmentType + ' assignment',
      life: 3000
    });
  }





  useEffect(() => {
    console.log('------------------------------')
    console.log("coldCache", coldCache);
    console.log('address', address)
    console.log('addressInBits', addressInBits)
    console.log('numSets', numSets)
    console.log('offset', offsetAllocBits)
    console.log('numIndexAllocBits', indexAllocBits)
    console.log('tag', tagAllocBits)
    console.log('offSet_bits', offSet_bits)
    console.log('index_bits', index_bits)
    console.log('tag_bits', tag_bits)
    console.log("numLines", numLines)
    console.log("lineIndex", lineIndex)
  })

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



  function findRandomValidEntry(cacheEntries: CACHE_TABLE_ENTRY[][]): CACHE_TABLE_ENTRY {
    const entries = cacheEntries.flat().filter(entry => entry.valid === 1 && entry.block !== 'meme');

    const entry = entries[Math.floor(Math.random() * entries.length)]
    return entry;
  }

  function newIndexBits(entryIndex: number) {
    if (entryIndex.toString(2).length === indexAllocBits) {
      return entryIndex.toString(2);
    }
    return entryIndex.toString(2).padStart(indexAllocBits, '0');

  }

  function newAssignment(assigmentType: string) {
    let tag_bits_copy = "";
    if (assigmentType === 'hit') {
      const entry: CACHE_TABLE_ENTRY = findRandomValidEntry(cacheEntries);
      const entryIndex = cacheEntries.flat().findIndex((x) => deepEqual(x, entry))

      const randomEntryBits: string = entry.tag.toString(2) +
        newIndexBits(entryIndex) +
        createRandomNumberWith(offsetAllocBits).toString(2);

      createRandomNumberWith(entryIndex);
      const NewAddress = Number("0b" + randomEntryBits)
      const NewaddressInBits = [...NewAddress.toString(2)];

      // TODO: Set these to the correct ones

      setAddress(NewAddress);
      setAddressInBits(NewaddressInBits);


    } else {

      const NewAddress = createRandomNumberWith(addressBitWidth);
      const NewaddressInBits = [...NewAddress.toString(2)];
      const deepCopy = JSON.parse(JSON.stringify(NewaddressInBits));
      setOffset_bits(deepCopy.splice(-offsetAllocBits).join(''));
      setIndex_bits(deepCopy.splice(-indexAllocBits).join(''));
      setTag_bits(deepCopy.join(''));
      tag_bits_copy = deepCopy.join('');

      setAddress(NewAddress);
      setAddressInBits(NewaddressInBits);
    }

    const ff = cacheEntries.flat().some(line => line.tag === Number('0b' + tag_bits_copy))

    if (ff) {
      newAssignment(assigmentType)
    }

  }

  function generateNewCache() {

  }

  function isCacheEmpty(): boolean {
    return deepEqual(cacheEntries, coldCache)
  }

  function isCacheHit(): boolean {
    if (cacheEntries[parseInt(index_bits, 2)][lineIndex].valid === 1 &&
      cacheEntries[parseInt(index_bits, 2)][lineIndex].tag === parseInt(tag_bits, 2)) {
      return true
    }
    return false

  }

  // The percentage is for the hit assignment type (20 means 20% for a hit assignment)
  function randomAssignment(probability: number) {


    if (!isCacheEmpty() && Math.random() <= probability / 100) {
      console.log("!!!!!! MAKING A HIT!!!!!!!")
      newAssignment('hit')
    } else {
      newAssignment('miss')
    }
    console.log('doine')
  }

  function handleCacheButtonClick(isHit: boolean) {
    const propability = 50;
    const wasAHit = isCacheHit();
    const wasAMiss = !wasAHit;

    if (isHit) {
      if (wasAHit) {
        console.log('correct, it was a hit');
        randomAssignment(propability);
        showSuccess('hit');
        // TODO: add to log
      } else {
        console.log('Incorrect, it was not a hit');
        showFailure('hit');
      }
    } else {
      if (wasAMiss) {
        console.log('correct, it was a miss');
        const cache = createFacitCache();
        setCacheEntries(cache);
        randomAssignment(propability);
        showSuccess('miss');
        // TODO: add to log

      } else {
        console.log('Incorrect, it was not a miss');
        showFailure('miss');
      }
    }

  }

  function createFacitCache(): CACHE_TABLE_ENTRY[][] {
    const set = parseInt(index_bits, 2)
    const deepCopy: CACHE_TABLE_ENTRY[][] = JSON.parse(JSON.stringify(cacheEntries));

    const tag: number = Number('0b' + tag_bits);
    const block: string = `Mem[${address}-${address + 7}]`;
    deepCopy[set][lineIndex].tag = tag;
    deepCopy[set][lineIndex].valid = 1;
    deepCopy[set][lineIndex].block = block;

    return deepCopy
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

      <Settings />
      <Toast ref={toast} />
      <div className='logAssignmentWrapper'>
        <div className='logContainer'>
          <p>Test</p>
        </div>

        <div className='input-header'>
          <div className="input-buttons">

            <button
              className='reset-color-btn'
              onClick={resetColors}
            >
              Reset the colors
            </button>

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
                    {addressInBits[addressBitWidth - index - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>tag bits:{tagAllocBits}</h3>
          <h3>set bits:{indexAllocBits}</h3>
          <h3>offset bits:{offsetAllocBits}</h3>
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
          cacheEntries={cacheEntries}
          setCacheEntries={setCacheEntries}
          facit={null}
          addressPrefix={addressPrefixMap.Binary}
          baseConversion={baseConversionMap.Binary}

        />
      </div>

    </>
  )
}

export default App

