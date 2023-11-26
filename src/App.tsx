import { useEffect, useState } from 'react'
import './App.css'
import Cache_table, { CACHE_TABLE_ENTRY } from './components/Cache_table/Cache_table';

export const InputFieldsMap = {
  VirtualAddress: 'VirtualAddress',
  BOffset: 'BOffset',
  Index: 'Index',
  Tag: 'Tag',
  Valid: 'Valid',
  Hit: 'Hit',
  Miss: 'Miss'
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
export type Result = Pick<typeof InputFieldsMap, 'Miss' |
  'Hit'>[keyof Pick<typeof InputFieldsMap, 'Miss' |
    'Hit'>];

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
 * Generates a unique number that is not equal to the provided number.
 *
 * @param {number} fromNum - The number that the generated number should not be equal to.
 * @param {number} size - The bit length of the number to generate.
 * @returns {number} - A unique number that is not equal to fromNum.
 */
function createUniqe(fromNum: number, size: number): number {
  // A random address is able to be created to be the actual tag of the virtual
  // address, We have to check for that.
  let unique = createRandomNumber(0, createRandomNumberWith(size))
  // Check if the tag already exists in the TLB table
  while (unique === fromNum) {

    unique = createRandomNumber(0, createRandomNumberWith(size))
  }

  return unique;
}


/**
 * Generates a random number of TLB sets.
 *
 * @returns {number} - A random number of TLB sets, which is a power of 2.
 */
function generateIndex(): number {
  return 2 ** createRandomNumber(2, 4);
}


function createTableEntry<TObj extends CACHE_TABLE_ENTRY>(entry: TObj, TLBT_bits: string, VPN: string, randomBitLength: number): TObj {
  const valid: Bit = Math.floor(Math.random() * 2) as Bit;
  // create unique TLBT address
  const tag: number = createUniqe(Number('0b' + TLBT_bits), randomBitLength)
  const block: number = createUniqe(Number('0b' + TLBT_bits), randomBitLength)

  let newEntry: TObj;
  const vpn: number = createUniqe(Number(VPN), randomBitLength)
  newEntry = {
    ...entry,
    vpn,
    block,
    valid
  };

  return newEntry;
}

function createTableEntries<TObj extends CACHE_TABLE_ENTRY>
  (numOfRows: number,
    numOfCols: number,
    tableEntry: TObj,
    TLBT_bits: string,
    VPN: string,
    randomBitLength: number
  ): TObj[][] {
  const entries: TObj[][] = [];

  for (let i = 0; i < numOfRows; i++) {
    const array: TObj[] = [];
    for (let j = 0; j < numOfCols; j++) {
      let entry = createTableEntry<TObj>(tableEntry, TLBT_bits, VPN, randomBitLength)
      array.push(entry);
    }
    entries.push(array);
  }
  return entries;
}



const ff = createTableEntries<CACHE_TABLE_ENTRY>(4, 1, {
  tag: 0,
  valid: 0,
  block: 'FERO'
}, '0b', '0b', 4);


function App() {
  const [addressBitWidth, setAddressBitWidth] = useState(createRandomNumber(10, 14)); 
  const [address, setAddress] = useState(createRandomNumberWith(addressBitWidth));

  const [sets, setSets] = useState(generateIndex());
  const [pageSize, setPageSize] = useState(32); // Make this also a random variable

  const [index, setIndex] = useState(Math.log2(sets));
  const [bOffset, setbOffset] = useState(Math.log2(pageSize));

  const [addressInBits, setAddressInBits] = useState([...address.toString(2)]);
  const deepCopy = JSON.parse(JSON.stringify(addressInBits));

  const [bOffset_bits, setbOffset_bits] = useState(deepCopy.splice(-bOffset).join('')); 
  const [index_bits, setIndex_bits] = useState(deepCopy.splice(-index).join('')); 
  const [tag_bits, setTag_bits] = useState(deepCopy.join(''));

  useEffect(() => {
    console.log('------------------------------')
    console.log('address', address)
    console.log('addressInBits', addressInBits)
    console.log('pageSize', pageSize)
    console.log('sets', sets)
    console.log('bOffset', bOffset)
    console.log('bOffset_bits', bOffset_bits)
    console.log('index', index)
    console.log('index_bits', index_bits)
    console.log('tag_bits', tag_bits)
  })

  return (
    <>
    <h2>0x{address}</h2>
      <Cache_table
        tlb_entries={ff}
        addressPrefix={addressPrefixMap.Hexadecimal}
        baseConversion={baseConversionMap.Hexadecimal}

      />
    </>
  )
}

export default App
