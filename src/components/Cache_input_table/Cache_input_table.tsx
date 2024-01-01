import { Cache, Bit } from '../../cache';
import './Cache_input_table.css';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { ToggleButton, ToggleButtonChangeEvent } from 'primereact/togglebutton';
import 'primereact/resources/themes/lara-light-teal/theme.css';

export const CacheInputFieldsMap = {
    blockStart: 'blockStart',
    blockEnd: 'blockEnd',
    valid: 'valid',
    tag: 'tag',
} as const;

type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    maxAddress: number;
    userGuessHit: boolean;
    changedSet: number | null;
    changedLine: number | null;
}

function Cache_input_table({
    cache,
    setCache,
    tag,
    maxAddress,
    userGuessHit,
    changedSet,
    changedLine
}: cache_tableProps) {

    function handleInputChange(event: ToggleButtonChangeEvent | InputMaskChangeEvent, set: number, line: number, field: string) {
        const value = event.target.value;
        const hasAnyValidBit = cache.sets[set].lines[line].valid === 1;
        const hasAnyTag = cache.sets[set].lines[line].tag.trim() !== '';
        const hasAnyBlockStart = cache.sets[set].lines[line].blockStart.trim() !== '';
        const hasAnyBlockEnd = cache.sets[set].lines[line].blockEnd.trim() !== '';

        switch (field) {
            case 'valid':
                const validBit: Bit = value ? 1 : 0;

                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].valid = validBit;
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockStart || hasAnyBlockEnd) {
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
                    cacheCopy.sets[set].lines[line].tag = (value as string).trim();
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockStart || hasAnyBlockEnd) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });
                break;

            case 'blockStart':
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].blockStart = (value as string).trim();
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockStart || hasAnyBlockEnd) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });
                break;

            case 'blockEnd':
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].blockEnd = (value as string).trim();
                    if (hasAnyValidBit || hasAnyTag || hasAnyBlockStart || hasAnyBlockEnd) {
                        cacheCopy.sets[set].lines[line].empty = 0;
                    } else {
                        cacheCopy.sets[set].lines[line].empty = 1;
                    }
                    return cacheCopy;
                });
                break;
        }
    }
    const tagMask = Array(tag).fill('9').join('');
    const tagPlaceHolder = Array(tag).fill('x').join('');

    const maxAddrLen = maxAddress.toString().length;
    const blockSizeStrMask = '9?' + "9".repeat(maxAddrLen - 1);


    return (
        <div>
            <h2>Cache</h2>

            <table className='cache-table'>

                <tbody>
                    {cache.sets && cache.sets.map((set, i) => {
                        const changedSet_ = i === changedSet;
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
                                                const blockClass = j === changedLine ? 'changed-block' : '';


                                                const tagValue = block.tag;

                                                const blockStart = block.blockStart;
                                                const blockEnd = block.blockEnd;

                                                return (
                                                    <tr key={`${i}-${j}`}>
                                                        <td className={changedSet_ ? blockClass : ''}>
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
                                                        <td className={changedSet_ ? blockClass : ''}>
                                                            <InputMask
                                                                onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.tag)}
                                                                key={tagMask} 
                                                                mask={tagMask}
                                                                value={tagValue}
                                                                placeholder={tagPlaceHolder}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoCapitalize='off'
                                                                autoFocus={false}
                                                                keyfilter={/[01]/}
                                                                disabled={userGuessHit}
                                                                tooltip="Insert the tag in binary format"
                                                                tooltipOptions={{  event: 'focus',  position: 'top' }}
                                                            />
                                                        </td>
                                                        <td className={changedSet_ ? blockClass : ''}>
                                                            <div style={{ display: 'flex', fontSize: 20 }}>
                                                                <p>Mem[</p>
                                                                <InputMask
                                                                    onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.blockStart)}
                                                                    mask={blockSizeStrMask}
                                                                    value={blockStart}
                                                                    placeholder="x*"
                                                                    autoComplete='off'
                                                                    autoCorrect='off'
                                                                    autoSave='off'
                                                                    autoFocus={false}
                                                                    autoCapitalize='off'
                                                                    disabled={userGuessHit}
                                                                    tooltip="Insert the addresss in base 10 format"
                                                                    tooltipOptions={{ event: 'focus', position: 'top' }}
                                                                />
                                                                <p>-</p>
                                                                <InputMask
                                                                    onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.blockEnd)}
                                                                    mask={blockSizeStrMask}
                                                                    value={blockEnd}
                                                                    placeholder="x*"
                                                                    autoComplete='off'
                                                                    autoCorrect='off'
                                                                    autoSave='off'
                                                                    autoFocus={false}
                                                                    autoCapitalize='off'
                                                                    disabled={userGuessHit}
                                                                    tooltip="Insert the addresss in base 10 format"
                                                                    tooltipOptions={{ event: 'focus', position: 'top' }}
                                                                />
                                                                <p>]</p>
                                                            </div>
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
