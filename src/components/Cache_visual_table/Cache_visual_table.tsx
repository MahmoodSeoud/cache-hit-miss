
import { Bit } from '../../App';
import React from 'react';
import { Cache } from '../../App';
import './Cache_visual_table.css';

export type InputFields = {
    VirtualAddress: string;
    Offset: string;
    Index: string;
    Tag: string;
    Valid: Bit;
    Hit: Bit;
}

export type CACHE_TABLE_ENTRY = {
    tag: number;
    block: string;
    valid: Bit;
};

type cache_tableProps = {
    cache: Cache;
    tag: number;
}


function Cache_visual_table({ cache, tag }: cache_tableProps) {

    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th>Set</th>
                        {cache && cache.linesPerSet > 0 && Array(cache.linesPerSet).fill(null).map((_, s) => (

                            <React.Fragment key={s}>
                                <th>Valid</th>
                                <th>Tag</th>
                                <th>Block</th>
                            </React.Fragment >
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {cache.sets && cache.sets.map((set, i) => {

                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {set && set.lines.length > 0 && set.lines.map((line, j) => (
                                    <React.Fragment key={j}>
                                        <td>{line.valid}</td>
                                        <td>{line.tag.toString(2).padStart(tag, '0')}</td>
                                        <td>{line.blockSizeStr}</td>
                                    </React.Fragment >
                                ))}
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>);
}

export default Cache_visual_table;

