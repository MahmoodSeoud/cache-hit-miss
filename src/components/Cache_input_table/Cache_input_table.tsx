import { Bit, Cache, CacheInputFieldsMap } from '../../App';
import './Cache_input_table.css';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { ToggleButton, ToggleButtonChangeEvent } from 'primereact/togglebutton';
import 'primereact/resources/themes/lara-light-teal/theme.css';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    facit: Cache;
    address: number;
}


function Cache_input_table({ cache, setCache, tag, address, facit }: cache_tableProps) {
    console.log('facit', facit)

    const addressLength = address.toString().length;
    const blockSize = cache.blockSize;
    const addressLengthWithBlockSize = (address + blockSize).toString().length;

    const blockSizeStrMask = `Mem[${Array(addressLength).fill(null).map(_ => '9').join('')} - ${Array(addressLengthWithBlockSize).fill(null).map(_ => '9').join('')}]`;
    const blockSizeStrPlaceHolder = `Mem[${Array(addressLength).fill(null).map(_ => 'x').join('')} - ${Array(addressLengthWithBlockSize).fill(null).map(_ => 'x').join('')}]`;
    const tagMask = Array(tag).fill(null).map(_ => '9').join('');
    const tagPlaceHolder = Array(tag).fill(null).map(_ => 'x').join('');

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
                    cacheCopy.sets[set].lines[line].tag = parseInt(value as string, 2);

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
                                            {set.lines && set.lines.length > 0 && set.lines.map((_, j) => {
                                                return (
                                                    <tr key={j}>
                                                        <td>
                                                            <ToggleButton
                                                                checked={cache.sets[i].lines[j].valid === 1}
                                                                onChange={(e: ToggleButtonChangeEvent) => handleInputChange(e, i, j, CacheInputFieldsMap.valid)}
                                                                onLabel='1'
                                                                className={"w-14rem"}
                                                                offLabel='0'
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputMask
                                                                onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.tag)}
                                                                mask={tagMask}
                                                                placeholder={tagPlaceHolder}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                maxLength={tag}
                                                                keyfilter={/[01]/}
                                                                autoCapitalize='off'
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputMask
                                                                onChange={(ev: InputMaskChangeEvent) => handleInputChange(ev, i, j, CacheInputFieldsMap.blockSizeStr)}
                                                                mask={blockSizeStrMask}
                                                                placeholder={blockSizeStrPlaceHolder}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                autoCapitalize='off'
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
