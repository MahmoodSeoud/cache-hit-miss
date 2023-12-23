import { Bit, Cache } from '../../App';
import './Cache_input_table.css';
import { InputText } from 'primereact/inputtext';
import { ToggleButton, ToggleButtonChangeEvent } from 'primereact/togglebutton';
import 'primereact/resources/themes/lara-light-teal/theme.css';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    facit: Cache;
}


function Cache_input_table({ cache, setCache, tag }: cache_tableProps) {


    function handleInputChange(event: React.ChangeEvent<HTMLInputElement> | ToggleButtonChangeEvent, set: number, line: number, field: string) {
        const value = event.target.value;
        const regexBits = /^[01]*$/; // regular expression to match only 1's and 0's

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
                debugger
                if (!regexBits.test(value as string)) {
                    // If the user inputs anything else than 1's and 0's we remove it
                    event.target.value = cache.sets[set].lines[line].tag.toString(2);
                    return;
                }
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
                                                                onChange={(e: ToggleButtonChangeEvent) => handleInputChange(e, i, j, 'valid')}
                                                                className="w-14rem"
                                                                onLabel='1'
                                                                offLabel='0'
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputText
                                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(ev, i, j, 'tag')}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                maxLength={tag}
                                                                autoCapitalize='off'
                                                                className="p-inputtext-sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputText
                                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(ev, i, j, 'blockSizeStr')}
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
