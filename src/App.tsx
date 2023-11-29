import { useEffect, useState } from 'react'
import Cache_table, { CACHE_TABLE_ENTRY, InputFields } from './components/Cache_input_table/Cache_input_table'
import './App.css'
import './components/Cache_input_table/Cache_input_table.css'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';



export const InputFieldsMap = {
  VirtualAddress: 'VirtualAddress',
  Offset: 'Offset',
  Index: 'Index',
  Tag: 'Tag',
  Valid: 'Valid',
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
function generateLogn(n: number): number{
  return 2 ** n
}


function createTableEntry<TObj extends CACHE_TABLE_ENTRY>(entry: TObj, address: number, tag_bits: string): TObj {
  const valid: Bit = 0;


  let newEntry: TObj;

  newEntry = {
    ...entry,
    valid,
    tag: null,
    block: null
  };

  return newEntry;
}

function createTableEntries
  (numOfRows: number,
    tableEntry: CACHE_TABLE_ENTRY,
    address: number,
    tag_bits: string
  ): CACHE_TABLE_ENTRY[] {

  const entries: CACHE_TABLE_ENTRY[] = [];

  for (let i = 0; i < numOfRows; i++) {
    let entry = createTableEntry(tableEntry, address, tag_bits)
    entries.push(entry);
  }
  return entries;
}

function handleCacheFacit() {

}


interface LogEntry {
  address: number;
  hit: boolean;
  cacheEntries: CACHE_TABLE_ENTRY[]
}

const logOfEntries: LogEntry[] = [];


function App() {
  const [addressBitWidth, setAddressBitWidth] = useState<number>(createRandomNumber(10, 14));
  const [address, setAddress] = useState<number>(createRandomNumberWith(addressBitWidth));
  
  const [indexAllocBits, setIndexAllocBits] = useState<number>(createRandomNumber(1, 4));
  const [numSets, setNumSets] = useState<number>(2**indexAllocBits);
  const [offsetAllocBits, setOffsetsetAllocBits] = useState(createRandomNumber(1, 4));
  const [tagAllocBits, setTagAllocBits] = useState<number>(addressBitWidth - indexAllocBits - offsetAllocBits);

  const [addressInBits, setAddressInBits] = useState<string[]>([...address.toString(2)]);
  const deepCopy = JSON.parse(JSON.stringify(addressInBits));

  const [offSet_bits, setOffset_bits] = useState<string>(deepCopy.splice(-offsetAllocBits).join(''));
  const [index_bits, setIndex_bits] = useState<string>(deepCopy.splice(-indexAllocBits).join(''));
  const [tag_bits, setTag_bits] = useState<string>(deepCopy.join(''));

  const [isMouseDown, setIsMouseDown] = useState(false);


  // TODO: maybe look int making these to state variables
  const [cacheEntries, setCacheEntries] = useState<CACHE_TABLE_ENTRY[]>(createTableEntries(numSets, { tag: 0, block: '', valid: 0 }, address, tag_bits));
  const [facitEntries, setFacitEntries] = useState<CACHE_TABLE_ENTRY[]>(JSON.parse(JSON.stringify(cacheEntries)));


  useEffect(() => {

    setCacheEntries(createTableEntries(numSets, { tag: 0, block: '', valid: 0 }, address, tag_bits));
    setFacitEntries(JSON.parse(JSON.stringify(cacheEntries)));
    // Caculate the facit
    const tag: number = Number('0b' + tag_bits)
    const block: string = `Mem[${address}-${address + 7}]`

    const cache_hit = facitEntries[indexAllocBits].valid === 1;

    if (!cache_hit) {
      const facitEntriesCopy = JSON.parse(JSON.stringify(facitEntries));
      facitEntriesCopy[indexAllocBits].valid = 1;
      facitEntriesCopy[indexAllocBits].tag = tag;
      facitEntriesCopy[indexAllocBits].block = block;

      setFacitEntries(facitEntriesCopy)

    } else {
      console.log('Cache hit!')
    }

  }, [address])




  useEffect(() => {
    console.log('------------------------------')
    console.log('address', address)
    console.log('addressInBits', addressInBits)
    console.log('numSets', numSets)
    console.log('offset', offsetAllocBits)
    console.log('numIndexAllocBits', indexAllocBits)
    console.log('tag', tagAllocBits)
    console.log('offSet_bits', offSet_bits)
    console.log('index_bits', index_bits)
    console.log('tag_bits', tag_bits)
  })



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
      //pTagWithIndex.style.backgroundColor = color;
    }
  };




  /**
 * Inserts the correct answer (facit) into the input field if the user does not know the answer.
 *
 * @param {InputField} inputFieldName - The name of the input field to insert the facit into.
 * @param {React.BaseSyntheticEvent} e - The event object, which contains information about the event.
 */
  function insertFacit(inputFieldName: InputField, e: React.BaseSyntheticEvent): void {

  }

  function createNullArr(addressWidth: number): Array<null> {
    return Array(addressWidth).fill(null);
  }





  return (
    <>
      <div className='logAssignmentWrapper'>
        <div className='logContainer'>
          <p>Test</p>
        </div>

        <h2>Address: {address.toString(2)}</h2>
        <div className='virtual-wrapper'>
          <div className={`list-item-wrapper`}>
            <button
            onClick={handleCacheFacit}>
              Cache Hit
            </button>
            <button
            onClick={handleCacheFacit}>Cache Miss</button>
          </div>

        </div>

      <Cache_visual_table
        cacheEntries={cacheEntries}
        setCacheEntries={setCacheEntries}
        facit={facitEntries}
        addressPrefix={addressPrefixMap.Binary}
        baseConversion={baseConversionMap.Binary}
      
      />
      </div>

    </>
  )
}

export default App
