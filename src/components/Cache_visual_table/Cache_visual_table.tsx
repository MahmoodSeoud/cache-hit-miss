import React from 'react';
import { Cache } from '../../App';
import './Cache_visual_table.css';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    changedSet: number | null;
    changedLine: number | null;
}


function Cache_visual_table({ cache, tag, changedSet, changedLine }: cache_tableProps) {
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
                                    const blockClass = j === changedLine ? 'changed-block' : '';
                                    const changedSet_ = i === changedSet;
                                    return (
                                        <React.Fragment key={j}>
                                            <td className={changedSet_ ? blockClass : ''}>{line.valid}</td>
                                            <td className={changedSet_ ? blockClass : ''}>{line.tag.toString(2).padStart(tag, '0')}</td>
                                            <td className={changedSet_ ? blockClass : ''}>{line.blockSizeStr}</td>
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

export default Cache_visual_table;