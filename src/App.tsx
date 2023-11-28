import { useEffect, useState } from 'react'
import Cache_table, { CACHE_TABLE_ENTRY, InputFields } from './components/Cache_table/Cache_table';
import './App.css'
import './components/Cache_table/Cache_table.css'


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
 * Generates a random number of TLB sets.
 *
 * @returns {number} - A random number of TLB sets, which is a power of 2.
 */
function generateIndex(): number {
  return 2 ** createRandomNumber(2, 4);
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

function createTableEntries<TObj extends CACHE_TABLE_ENTRY>
  (numOfRows: number,
    tableEntry: TObj,
    address: number,
    tag_bits: string
  ): TObj[][] {

  const numOfCols = 1;
  const entries: TObj[][] = [];

  for (let i = 0; i < numOfRows; i++) {
    const array: TObj[] = [];
    for (let j = 0; j < numOfCols; j++) {
      let entry = createTableEntry<TObj>(tableEntry, address, tag_bits)
      array.push(entry);
    }
    entries.push(array);
  }
  return entries;
}



function App() {
  const [addressBitWidth, setAddressBitWidth] = useState(createRandomNumber(10, 14));
  const [address, setAddress] = useState<number>(createRandomNumberWith(addressBitWidth));

  const [sets, setSets] = useState(generateIndex());
  const [pageSize, setPageSize] = useState(32); // Make this also a random variable

  const [index, setIndex] = useState(Math.log2(sets));
  const [offset, setOffset] = useState(Math.log2(pageSize));

  const [addressInBits, setAddressInBits] = useState([...address.toString(2)]);
  const deepCopy = JSON.parse(JSON.stringify(addressInBits));

  const [offSet_bits, setOffset_bits] = useState(deepCopy.splice(-offset).join(''));
  const [index_bits, setIndex_bits] = useState(deepCopy.splice(-index).join(''));
  const [tag_bits, setTag_bits] = useState(deepCopy.join(''));
  const [tag, setTag] = useState<number>(tag_bits.length);

  const [isMouseDown, setIsMouseDown] = useState(false);


  // TODO: maybe look int making these to state variables
  const [cacheEntries, setCacheEntries] = useState<CACHE_TABLE_ENTRY[][]>(createTableEntries<CACHE_TABLE_ENTRY>(sets, { tag: 0, block: '', valid: 0 }, address, tag_bits));
  const [facitEntries, setFacitEntries] = useState<CACHE_TABLE_ENTRY[][]>(JSON.parse(JSON.stringify(cacheEntries)));


  useEffect(() => {

    setCacheEntries(createTableEntries<CACHE_TABLE_ENTRY>(sets, { tag: 0, block: '', valid: 0 }, address, tag_bits));
    setFacitEntries(JSON.parse(JSON.stringify(cacheEntries)));
    // Caculate the facit
    const tag: number = Number('0b' + tag_bits)
    const block: string = `Mem[${address}-${address + 7}]`

    const cache_hit = facitEntries[index][0].valid === 1;

    if (!cache_hit) {
      const facitEntriesCopy = JSON.parse(JSON.stringify(facitEntries));
      facitEntriesCopy[index][0].valid = 1;
      facitEntriesCopy[index][0].tag = tag;
      facitEntriesCopy[index][0].block = block;

      setFacitEntries(facitEntriesCopy)

    } else {
      console.log('Cache hit!')
    }

  }, [address])




  useEffect(() => {
    console.log('------------------------------')
    console.log('address', address)
    console.log('addressInBits', addressInBits)
    console.log('pageSize', pageSize)
    console.log('sets', sets)
    console.log('offset', offset)
    console.log('index', index)
    console.log('tag', tag)
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
      <h2>Address: 0x{address.toString(16).toUpperCase()}</h2>
      <div className='virtual-wrapper'>
        <p>Bits of virtual address</p>
        <div className={`list-item-wrapper`}>

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
                /*               onMouseDown={handleMouseDown}
                              onMouseEnter={handleMouseEnter} */

                >
                  {addressBitWidth - index - 1}
                </p>
                <input
                  id='vbit'
                  autoComplete='off'
                  autoCorrect='off'
                  autoSave='off'
                  autoFocus={false}
                  autoCapitalize='off'
                  /*               className={`vbit-input ${validateFieldInput(InputFieldsMap.VirtualAddress) ? 'correct' : ''}`} */
                  className='vbit-input'
                  name='VirtualAddress'
                  maxLength={1}
                /*               onChange={(ev) => handleInputChange(ev, InputFieldsMap.VirtualAddress)} */
                />
              </div>
            ))}
          </div>
          <button className={'insert-facit-btn'}
          /*             onClick={(ev) => insertFacit(InputFieldsMap.VirtualAddress, ev)} */
          >
            Insert facit
          </button>
        </div>

      </div>

      <Cache_table
        cacheEntries={cacheEntries}
        setCacheEntries={setCacheEntries}
        facit={facitEntries}
        addressPrefix={addressPrefixMap.Hexadecimal}
        baseConversion={baseConversionMap.Hexadecimal}
      />

    </>
  )
}

export default App
