
import { AddressPrefix, BaseConversion, Bit, InputField, InputFieldsMap } from '../../App';
import { useState, useEffect } from 'react';
import './Cache_visual_table.css'

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
    cacheEntries: CACHE_TABLE_ENTRY[];
    setCacheEntries: React.Dispatch<React.SetStateAction<CACHE_TABLE_ENTRY[]>>;
    facit: CACHE_TABLE_ENTRY[];
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}


function Cache_visual_table({ cacheEntries, setCacheEntries, facit, addressPrefix, baseConversion }: cache_tableProps) {

    function checkInput(): boolean {
        return true
    }


    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th></th>
                        <>
                            <th>Valid</th>
                            <th>Tag</th>
                            <th>Block</th>
                        </>
                    </tr>
                </thead>
                <tbody>

                    {cacheEntries && cacheEntries.length > 0 && cacheEntries.map((_, i) => {

                        return (
                            <tr key={i}>
                                <th>Set {i}</th>
                                <>
                                    {/* Valid bit input */}
                                    <td>
                                        <div></div>
                                    </td>
                                    {/* Tag input */}
                                    <td>
                                        <div></div>
                                    </td>
                                    {/* Offset input */}
                                    <td>
                                        <div></div>
                                    </td>
                                </>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <button onClick={() => console.log("it is:", checkInput)}>Check input</button>
        </div>
    );
}

export default Cache_visual_table;

