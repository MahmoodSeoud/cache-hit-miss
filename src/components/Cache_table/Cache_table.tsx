import React from 'react';
import { AddressPrefix, BaseConversion, Bit } from '../../App';
import '../table.css'

export type TLB_TABLE_ENTRY = {
    tag: number;
    ppn: number;
    valid: Bit;
};

type Tlb_tableProps = {
    tlb_entries: Array<TLB_TABLE_ENTRY>[];
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
    TLBSets: number;
    TLBWays: number;
}



function Tlb_table({ tlb_entries, addressPrefix, baseConversion, TLBSets, TLBWays }: Tlb_tableProps) {
    return (
        <div>
            <h2>TLB</h2>
            <p>The TLB is {TLBWays}-way set associative with {TLBSets} sets, totaling {TLBWays * TLBSets} entries</p>
            <table className='table-tlb'>
                <thead>
                    <tr>
                        <th>Set</th>
                        {tlb_entries &&tlb_entries.length > 0 &&tlb_entries[0].map((_, s) => (
                            <React.Fragment key={s}>
                                <th>Tag</th>
                                <th>PPN</th>
                                <th>Valid</th>
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
                                        <td>{addressPrefix + tlb_entries[i][j].tag.toString(baseConversion).toUpperCase()}</td>
                                        <td>{addressPrefix + tlb_entries[i][j].ppn.toString(baseConversion).toUpperCase()}</td>
                                        <td>{tlb_entries[i][j].valid}</td>
                                    </React.Fragment >
                                ))}
                            </tr>
                        )
                    })}

                </tbody>
            </table>
        </div>);
}

export default Tlb_table;
