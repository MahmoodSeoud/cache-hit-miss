import { Cache } from '../../App';
import './Cache_input_table.css';
import { InputText } from 'primereact/inputtext';

type cache_tableProps = {
    cache: Cache;

}


function Cache_input_table({ cache }: cache_tableProps) {
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
                                            {set.lines && set.lines.length > 0 && set.lines.map((line, j) => {
                                                return (
                                                    <tr key={j}>
                                                        <td>{line.valid}</td>
                                                        <td><InputText /></td>
                                                        <td><InputText /></td>
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
