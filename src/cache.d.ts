

export const baseConversionMap = {
  Binary: 2,
  Decimal: 10,
  Hexadecimal: 16,
} as const;

export const addressPrefixMap = {
  Binary: '0b',
  Decimal: '',
  Hexadecimal: '0x'
} as const;

export const bitMap = {
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

