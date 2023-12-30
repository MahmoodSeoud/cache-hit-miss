import { useEffect, useRef, useState } from 'react'
import Cache_visual_table from './components/Cache_visual_table/Cache_visual_table';
import Cache_input_table from './components/Cache_input_table/Cache_input_table';
import Settings from './components/Settings/Settings';
import { Toast } from 'primereact/toast';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import Log from './components/Log/Log';

import 'primereact/resources/themes/lara-light-teal/theme.css';
import './components/Cache_input_table/Cache_input_table.css'
import './App.css'
import 'primeicons/primeicons.css';
import { createRandomNumber, deepEqual, removeObjectKey } from './Utils';
import BitAddressHeader from './components/BitAddressHeader/BitAddressHeader';
import { Bit, Cache, CacheBlock, CacheSet, LogEntry, LogHistory } from './cache';

function replaceChars(str: string, start: number, numChars: number, replacement: string): string {
  const before = str.slice(0, start);
  const after = str.slice(start + numChars);
  return before + replacement + after;
}

const availbeAddresses: number[] = []
const NUMSETS = 4 as const;
const BLOCKSIZE = 8 as const;
const LINESPERSET = 1 as const;
const BYTE = 8 as const;
const TOTALCACHESIZE = NUMSETS * LINESPERSET * BLOCKSIZE * BYTE;
const ADDRESSBITWIDTH = TOTALCACHESIZE.toString(2).padStart(14, '0').length;
const PROBABILITYOFGETTINGACACHEHIT = 50;
const log_: LogHistory = { logEntries: [] };

// TODO: For future reference, this is how you add two numbers in binary. When you got time you can implement this
// const addToBitsTogether = (a: number, b: number) => (a << Math.ceil(Math.log2(b)) + 1) + b;
let facit: any = null;
let assignmentType: string = 'miss';
function App() {
  const [maxAddress, _] = useState<number>(TOTALCACHESIZE);
  const [addressBitWidth, __] = useState<number>(ADDRESSBITWIDTH);
  const [address, setAddress] = useState<number>(createRandomNumber(0, maxAddress));

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

  const toast = useRef<Toast>(null);
  const [changedSet, setChangedSet] = useState<number | null>(null);
  const [changedLine, setChangedLine] = useState<number | null>(null);

  const cacheOptions: string[] = ['guess', 'input'];
  const [cacheValue, setCacheValue] = useState<string>(cacheOptions[0]);
  //const [wasAHit, lineIndex] = lookupCache(cache);
  const [log, setLog] = useState<LogHistory>(log_)
  const toastFacit = useRef<Toast | null>(null);

  useEffect(() => {
    assignmentType = createCacheMissAssigment(cache);
  }, [0]);

  useEffect(() => {
    facit = createFacit(cache);
  }, [address])


  useEffect(() => {
    availbeAddresses.length = 0;
    for (let k = 0; k < totalCacheSize; k++) {
      availbeAddresses.push(k);
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
    setAddress(createRandomNumber(0, maxAddress));
    assignmentType = createCacheMissAssigment(cache_);
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
      detail: 'The address: ' + address.toString(2).padStart(addressBitWidth, '0') +
        '\nwas NOT a cache ' +
        cacheAssignmentType + ' assignment' + '\n' + (extraErrorMsg ? extraErrorMsg : ''),
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

    if (cacheHitAddress === null || cacheHitAddress === undefined) return createCacheMissAssigment(cache);

    console.log('I made a hit')
    setAddress(cacheHitAddress);
    return 'hit';

  }


  function createCacheMissAssigment(cache: Cache): string {
    const allPossibleAddresses: string[] = [];
    for (let k = 0; k < maxAddress; k++) {
      allPossibleAddresses.push(k.toString(2).padStart(addressBitWidth, '0'));
    }


    const allTagsPossible: string[] = allPossibleAddresses.map(address => address.slice(0, tag));
    const cacheTags = cache.sets.flatMap(set => set.lines.map(line => line.tag));
    const availableTags = allTagsPossible.filter(tag => !cacheTags.includes(tag));

    // Select a random tag from the available tags
    const randomAvailableTag = availableTags[Math.floor(Math.random() * availableTags.length)];

    // Find the corresponding address for the selected tag
    const randomAvailableAddresses = allPossibleAddresses.filter(address => address.slice(0, tag) === randomAvailableTag);
    const randomAvailableAddress = randomAvailableAddresses[Math.floor(Math.random() * randomAvailableAddresses.length)];

    if (randomAvailableAddress === null || randomAvailableAddress === undefined) return createCacheHitAssignment(cache)

    console.log('I made a miss')
    const newAddress = parseInt(randomAvailableAddress, 2);
    // If a corresponding address was found, set it
    setAddress(newAddress);
    return 'miss';
  }

  function lookupCache(cache: Cache): [boolean, number | null] {

    const isCacheHit = cache.sets[setValue].lines.some(line => line.tag === tagBits && line.valid === 1);
    const cacheBlock = cache.sets[setValue].lines.findIndex(line => line.tag === tagBits && line.valid === 1);

    return [isCacheHit, cacheBlock];
  }

  function isCacheEmpty(): boolean {
    return cache.sets.every(set => set.lines.every(line => line.empty === 1));
  }

  function writeCache(cache: Cache): Cache {

    const newCache = JSON.parse(JSON.stringify(cache));
    const cacheBlock = newCache.sets[setValue].lines[randomLineIndex];

    cacheBlock.tag = tagBits;
    cacheBlock.valid = 1;
    cacheBlock.empty = 0;
    cacheBlock.blockStart = address.toString();
    cacheBlock.blockEnd = (address + cache.blockSize - 1).toString();
    setCache(newCache);
    return newCache
  }

  function highlightCacheBlock(set: number, line: number): void {
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

    const [isCacheHit, lineIndex] = lookupCache(cache);
    const newCache = JSON.parse(JSON.stringify(cache));


    if (userGuessedHit && isCacheHit) {
      showSuccess('hit');
      highlightCacheBlock(setValue, lineIndex!);
      assignmentType = generateRandomAssignment(cache, PROBABILITYOFGETTINGACACHEHIT);
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
      const writtenCache: Cache = writeCache(newCache);
      highlightCacheBlock(setValue, randomLineIndex);
      assignmentType = generateRandomAssignment(writtenCache, PROBABILITYOFGETTINGACACHEHIT);

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
    //const [cacheHit, _] = lookupCache(cache);
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

  function handleSubmitClick(cache: Cache, userGuessedHit: boolean) {
    const isValidCacheInsertion = validateCacheMiss(cache, facit);
    const isValidCacheHit = validateCacheHit(cache, facit);

    const wasAHit = assignmentType === 'hit';
    if (userGuessedHit && wasAHit && isValidCacheHit) {
      assignmentType = generateRandomAssignment(cache, PROBABILITYOFGETTINGACACHEHIT);
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
      assignmentType = generateRandomAssignment(cache, PROBABILITYOFGETTINGACACHEHIT);
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
        <BitAddressHeader
          addressBitWidth={addressBitWidth}
          addressInBits={addressInBits}
        />
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


