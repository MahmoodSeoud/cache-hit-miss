import { Bit, Cache } from '../../App';
import './Cache_input_table.css';
import { InputText } from 'primereact/inputtext';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    setCache: React.Dispatch<React.SetStateAction<Cache>>;
    facit: Cache;
}

function Cache_input_table({ cache, setCache, tag }: cache_tableProps) {

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, set: number, line: number, field: string) {
        const { value } = event.target;
        const regexBits = /^[01]*$/; // regular expression to match only 1's and 0's

        switch (field) {
            case 'valid':
                if(!regexBits.test(value)) return;
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].valid = parseInt(value) as Bit;
                    return cacheCopy;
                });

                break;
            case 'tag':
                if(!regexBits.test(value)) return;
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].tag = parseInt(value, 2);
                    return cacheCopy;
                });
                break;
            case 'block':
                setCache((prev) => {
                    const cacheCopy = { ...prev };
                    cacheCopy.sets[set].lines[line].blockSizeStr = value;
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
                                                return (
                                                    <tr key={j}>
                                                        <td>
                                                            <InputText
                                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(ev, i, j, 'valid')}
                                                                value={block.valid.toString()}
                                                                type='number'
                                                                maxLength={1}
                                                                autoComplete='off'
                                                                autoCorrect='off'
                                                                autoSave='off'
                                                                autoFocus={false}
                                                                autoCapitalize='off'
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
                                                            />
                                                        </td>
                                                        <td>
                                                            <InputText
                                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(ev, i, j, 'block')}
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
