
import { AddressPrefix, BaseConversion, Bit, InputField, InputFieldsMap } from '../../App';
import { useState, useEffect } from 'react';
import './Cache_visual_table.css'
import React from 'react';
import { Cache } from '../../App';

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
    setCache: React.Dispatch<React.SetStateAction<Cache>>
    tag: number;
    facit: CACHE_TABLE_ENTRY[][] | null;
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}


function Cache_visual_table({ cache, setCache, tag }: cache_tableProps) {

    function checkInput(): boolean {
        return true
    }


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

                    {cache && cache.sets.map((set, i) => {

                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {set && set.lines.length > 0 && set.lines.map((line, j) => (
                                    <React.Fragment key={j}>
                                        <td>{line.valid}</td>
                                        <td>{line.tag.toString(2).padStart(tag, '0')}</td>
{/*                                         <td>{line.block}</td> */}
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

