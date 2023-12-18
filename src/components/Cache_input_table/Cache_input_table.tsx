import React from 'react';
import { Cache } from '../../App';
import './Cache_input_table.css';
import { InputText } from 'primereact/inputtext';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    changedSet: number | null;
    changedLine: number | null;
}


function Cache_input_table({ cache, tag, changedSet, changedLine }: cache_tableProps) {
    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th>Set</th>
                        {cache.linesPerSet && cache.linesPerSet > 0 && Array(cache.linesPerSet).fill(null).map((_, s) => (
                            <React.Fragment key={s}>
                                <th>Valid</th>
                                <th>Tag</th>
                                <th>Block</th>
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {cache.sets && cache.sets.map((set, i) => {
                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {set.lines && set.lines.length > 0 && set.lines.map((line, j) => {
                                    return (
                                        <React.Fragment key={j}>
                                            <td>{line.valid}</td>
                                            <td><InputText /></td>
                                            <td><InputText /></td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>);
}

export default Cache_input_table;