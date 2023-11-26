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
    tlb_entries: Array<CACHE_TABLE_ENTRY>[];
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}




function Cache_table({ tlb_entries, addressPrefix, baseConversion }: cache_tableProps) {
    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th>Set</th>
                        {tlb_entries && tlb_entries.length > 0 && tlb_entries[0].map((_, s) => (
                            <React.Fragment key={s}>
                                <th>Valid</th>
                                <th>Tag</th>
                                <th>Block</th>
                            </React.Fragment >
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {tlb_entries && tlb_entries.map((_, i) => {

                        return (
                            <tr key={i}>
                                <td>{i}</td>
                                {tlb_entries && tlb_entries.length > 0 && tlb_entries[0].map((_, j) => (
                                    <React.Fragment key={j}>
                                        <td>{tlb_entries[i][j].valid}</td>
                                        <td>{addressPrefix + tlb_entries[i][j].tag.toString(2)}</td>
                                        <td>{addressPrefix + tlb_entries[i][j].block}</td>
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
