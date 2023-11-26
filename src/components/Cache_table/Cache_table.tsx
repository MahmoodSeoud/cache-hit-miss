import React from 'react';
import { AddressPrefix, BaseConversion, Bit } from '../../App';
import '../table.css'

export type InputFields = {
    VirtualAddress: string;
    BOffset: string;
    Index: string;
    Tag: string;
    Valid: string;
    Hit: Bit;
    Miss: Bit;
}

export type CACHE_TABLE_ENTRY = {
    tag: number;
    block: string;
    valid: Bit;
};

type cache_tableProps = {
    cache_entries: Array<CACHE_TABLE_ENTRY>[];
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}




function Cache_table({ cache_entries, addressPrefix, baseConversion }: cache_tableProps) {
    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th></th>
                        {cache_entries && cache_entries.length > 0 && cache_entries[0].map((_, s) => (
                            <React.Fragment key={s}>
                                <th>Valid</th>
                                <th>Tag</th>
                                <th>Block</th>
                            </React.Fragment >
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {cache_entries && cache_entries.map((_, i) => {

                        return (
                            <tr key={i}>
                                <th>Set {i}</th>
                                {cache_entries && cache_entries.length > 0 && cache_entries[0].map((_, j) => (
                                    <React.Fragment key={j}>
                                        {/* Valid bit input */}
                                        <td>
                                            <input
                                                maxLength={1}
                                                defaultValue={cache_entries[i][j].valid.toString()}
                                            />
                                        </td>
                                        {/* Tag input */}
                                        <td>
                                            <input
                                                defaultValue={cache_entries[i][j].tag.toString(2)}
                                            />
                                        </td>
                                        {/* Block input */}
                                        <td>
                                            <input
                                                defaultValue={cache_entries[i][j].block}
                                            />
                                        </td>
                                    </React.Fragment >
                                ))}
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>);
}

export default Cache_table;
