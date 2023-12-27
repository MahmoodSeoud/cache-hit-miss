import { Bit, Cache, CacheInputFieldsMap } from '../../App';
import './Cache_input_table.css';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { ToggleButton, ToggleButtonChangeEvent } from 'primereact/togglebutton';
import 'primereact/resources/themes/lara-light-teal/theme.css';


type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    maxAddress: number;
    userGuessHit: boolean;
}


function Cache_input_table({ cache, setCache, tag, maxAddress, userGuessHit }: cache_tableProps) {


    const blockSize = cache.blockSize;

    function handleInputChange(event: ToggleButtonChangeEvent | InputMaskChangeEvent, set: number, line: number, field: string) {
        const value = event.target.value;

        switch (field) {
            case 'valid':
                const validBit: Bit = value ? 1 : 0;

                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].valid = validBit;

                    return cacheCopy;
                });

                break;
            case 'tag':
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].tag = value as string;

                    return cacheCopy;
                });
                break;
            case 'blockSizeStr':

                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].blockSizeStr = value as string;

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
                                                const addr = blockAddr || maxAddress;

                                                const addrLen = addr.toString().length;
                                                const addrLenWithBlockSize = (addr + blockSize).toString().length;

                                                const blockSizeStrMask = `Mem[${Array(addrLen)
                                                    .fill(null)
                                                    .map(_ => '9')
                                                    .join('')} - ${Array(addrLenWithBlockSize)
                                                        .fill(null)
                                                        .map(_ => '9')
                                                        .join('')}]`;

                                                const blockSizeStrPlaceHolder = `Mem[${Array(addrLen)
                                                    .fill(null)
                                                    .map(_ => 'x')
                                                    .join('')} - ${Array(addrLenWithBlockSize)
                                                        .fill(null)
                                                        .map(_ => 'x')
                                                        .join('')}]`;

                                                const blockSizeStrValue = block.blockSizeStr.trim() === '' ? '' : block.blockSizeStr;


                                                const tagMask = Array(tag).fill(null).map(_ => '9').join('');
                                                const tagPlaceHolder = Array(tag).fill(null).map(_ => 'x').join('');
                                                const tagValue = block.tag.trim() === '' ? '' : block.tag.padStart(tag, '0');
                                                debugger;

                                                return (
                                                    <tr key={j}>
                                                        <td>
                                                            <ToggleButton
                                                                checked={cache.sets[i].lines[j].valid === 1}
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
                                                                mask={blockSizeStrMask}
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
