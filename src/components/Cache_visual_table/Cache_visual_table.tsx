
import { AddressPrefix, BaseConversion, Bit, InputField, InputFieldsMap } from '../../App';
import { useState, useEffect } from 'react';
import './Cache_visual_table.css'
import React from 'react';

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
    cacheEntries: CACHE_TABLE_ENTRY[][];
    setCacheEntries: React.Dispatch<React.SetStateAction<CACHE_TABLE_ENTRY[][]>>;
    tagAllocBits: number;
    facit: CACHE_TABLE_ENTRY[][] | null;
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}


function Cache_visual_table({ cacheEntries, setCacheEntries, tagAllocBits }: cache_tableProps) {

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
                        {cacheEntries && cacheEntries.length > 0 && cacheEntries[0].map((_, s) => (
                            <React.Fragment key={s}>
                                <th>Valid</th>
                                <th>Tag</th>
                                <th>Block</th>
                            </React.Fragment >
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {cacheEntries && cacheEntries.map((_, i) => {

                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {cacheEntries && cacheEntries.length > 0 && cacheEntries[0].map((_, j) => (
                                    <React.Fragment key={j}>
                                        <td>{cacheEntries[i][j].valid}</td>
                                        <td>{cacheEntries[i][j].tag.toString(2).padStart(tagAllocBits, '0')}</td>
                                        <td>{cacheEntries[i][j].block}</td>
                                    </React.Fragment >
                                ))}
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>    );
}

export default Cache_visual_table;

