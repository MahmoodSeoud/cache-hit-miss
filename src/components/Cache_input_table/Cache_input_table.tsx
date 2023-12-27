import { Bit, Cache, CacheInputFieldsMap } from '../../App';
import './Cache_input_table.css';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { ToggleButton, ToggleButtonChangeEvent } from 'primereact/togglebutton';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import { useState } from 'react';


type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    maxAddress: number;
    userGuessHit: boolean;
    facit: Cache;
}


function Cache_input_table({ cache, setCache, tag, maxAddress, userGuessHit, facit }: cache_tableProps) {
    const [addressEntered, setAddressEntered] = useState(false);

    const blockSize = cache.blockSize;

    function handleInputChange(event: ToggleButtonChangeEvent | InputMaskChangeEvent, set: number, line: number, field: string) {
        const value = event.target.value;
        const hasAnyValidBit = cache.sets[set].lines[line].valid === 1;
        const hasAnyTag = cache.sets[set].lines[line].tag.trim() !== '';
        const hasAnyBlockSize = cache.sets[set].lines[line].blockSizeStr.trim() !== '';

        switch (field) {
            case 'valid':
                const validBit: Bit = value ? 1 : 0;

                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].valid = validBit;
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockSize) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });

                break;
            case 'tag':
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].tag = value as string;
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockSize) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });
                break;
            case 'blockSizeStr':

                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].blockSizeStr = value as string;
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockSize) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });

                break;
        }
    }


    return (
        <div>
            <h2>Cache</h2>

            <table className='cache-table'>

                <tbody>
                    {cache.sets && cache.sets.map((set, i) => {
                        return (
                            <tr key={i}>
                                <th>Set {i}</th>
                                <td colSpan={3}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Valid</th>
                                                <th>Tag</th>
                                                <th>Block</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {set.lines && set.lines.length > 0 && set.lines.map((block, j) => {


                                                const tempInt = block.blockSizeStr.slice(
                                                    block.blockSizeStr.indexOf('[') + 1,
                                                    block.blockSizeStr.indexOf('-')
                                                );
                                                const blockAddr = parseInt(tempInt);
                                                // Because 0 is falsy in JS!
                                                const addr = blockAddr !== null && blockAddr !== undefined ? blockAddr : maxAddress;

                                                const addrLen = addr.toString().length;
                                                const addrLenWithBlockSize = (addr + blockSize - 1).toString().length;

                                                const blockSizeStrMask_ = `Mem[${Array(addrLen)
                                                    .fill(null)
                                                    .map(_ => '9')
                                                    .join('')}-${Array(addrLenWithBlockSize)
                                                        .fill(null)
                                                        .map(_ => '9')
                                                        .join('')}]`;

                                                const blockSizeStrPlaceHolder = `Mem[${Array(addrLen)
                                                    .fill(null)
                                                    .map(_ => 'x')
                                                    .join('')}-${Array(addrLenWithBlockSize)
                                                        .fill(null)
                                                        .map(_ => 'x')
                                                        .join('')}]`;

                                                const blockSizeStrValue = block.blockSizeStr.trim() === '' ? '' : block.blockSizeStr;

                                                    debugger
                                                const tagMask = Array(tag).fill(null).map(_ => '9').join('');
                                                const tagPlaceHolder = Array(tag).fill(null).map(_ => 'x').join('');
                                                const tagValue = block.tag.trim() === '' ? '' : block.tag.padStart(tag, '0');

                                                return (
                                                    <tr key={j}>
                                                        <td>
                                                            <ToggleButton
                                                                checked={block.valid === 1}
                                                                onChange={(e: ToggleButtonChangeEvent) => handleInputChange(e, i, j, CacheInputFieldsMap.valid)}
                                                                onLabel='1'
                                                                className={"w-14rem"}
                                                                offLabel='0'
                                                                disabled={userGuessHit}
                                                                tooltip="Flip the valid bit clicking on it"
                                                                tooltipOptions={{ position: 'top' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputMask
                                                                onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.tag)}
                                                                mask={tagMask}
                                                                value={tagValue}
                                                                placeholder={tagPlaceHolder}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                maxLength={tag}
                                                                keyfilter={/[01]/}
                                                                autoCapitalize='off'
                                                                disabled={userGuessHit}
                                                                tooltip="Insert the tag in binary format"
                                                                tooltipOptions={{ event: 'focus', position: 'top' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputMask
                                                                onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.blockSizeStr)}
                                                                mask={blockSizeStrMask_}
                                                                value={blockSizeStrValue}
                                                                placeholder={blockSizeStrPlaceHolder}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                autoCapitalize='off'
                                                                disabled={userGuessHit}
                                                                tooltip="Insert the block in base 10 format"
                                                                tooltipOptions={{ event: 'focus', position: 'top' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>);
}

export default Cache_input_table;
