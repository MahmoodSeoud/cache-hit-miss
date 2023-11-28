import { AddressPrefix, BaseConversion, Bit, InputField, InputFieldsMap } from '../../App';
import { useState, useEffect } from 'react';
import '../table.css'

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
    facit: CACHE_TABLE_ENTRY[][];
    addressPrefix: AddressPrefix;
    baseConversion: BaseConversion;
}

/**
 * Grabs the input element based on the classname of the input fields and appends the value together into one string.
 *
 * @param {string} className - The classname of the input fields to grab.
 * @returns {string} - The appended string of input field values.
 */
function getElementValuesFrom(className: string): string {
    let address = "";
    const container = document.getElementsByClassName(className);

    document.getElementById('vbit')
    for (let i = 0; i < container.length; i++) {
        address += (container[i] as HTMLInputElement).value;
    }

    return address;
}



function Cache_table({ cacheEntries, setCacheEntries, facit, addressPrefix, baseConversion }: cache_tableProps) {

    const [inputFields, setInputFields] = useState<InputFields>({
        VirtualAddress: '',
        Offset: '',
        Index: '',
        Tag: '',
        Valid: 0,
        Hit: 0
    });

    function checkInput(): boolean {

        return cacheEntries.every((set, i) => {
            return set.every((entry, j) => {
                const facitEntry = facit[i][j];
                return entry.tag === facitEntry.tag &&
                    entry.block === facitEntry.block &&
                    entry.valid === facitEntry.valid;
            });
        });
    }

    let emptyInput: InputFields = {
        VirtualAddress: '',
        Offset: '',
        Index: '',
        Tag: '',
        Valid: 0,
        Hit: 0
    }




    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, fieldName: InputField): void {
        const regexBits = /^[01]*$/; // regular expression to match only 1's and 0's
        const regexYN = /^[YNyn]*$/; // regular expression to match only Y AND N
        const regexHexChars = /^[0-9a-fA-F]*$/; // regular expression to match only hex characters
        const input = event.target.value;

        switch (fieldName) {
            case InputFieldsMap.VirtualAddress:
                if (!regexBits.test(input)) {
                    event.target.value = '';
                    return;
                }
                setInputFields((prevState: InputFields) => ({ ...prevState, [fieldName]: getElementValuesFrom("vbit-input") }));
                //setCacheEntries((prevState: InputFields) => ({ ...prevState, [fieldName]: getElementValuesFrom("vbit-input") }));
                break;

            case InputFieldsMap.Offset:
            case InputFieldsMap.Tag:
                if (!regexHexChars.test(input)) {
                    event.target.value = '';
                    return;
                }
                //setCacheEntries((prevState: InputFields) => ({ ...prevState, [fieldName]: input.toLowerCase() }));
                break;

            case InputFieldsMap.Hit:
                if (!regexYN.test(input)) {
                    event.target.value = '';
                    return;
                }
                //setCacheEntries((prevState: InputFields) => ({ ...prevState, [fieldName]: input.toUpperCase() }));
                break;

            default:
                break;

        }
    }




    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-table'>
                <thead>
                    <tr>
                        <th></th>
                        <>
                            <th>Cache hit?</th>
                            <th>Valid</th>
                            <th>Tag</th>
                            <th>Block</th>
                        </>
                    </tr>
                </thead>
                <tbody>

                    {cacheEntries && cacheEntries.map((_, i) => {



                        return (
                            <tr key={i}>
                                <th>Set {i}</th>
                                <>
                                    <td>
                                        {/* Cache hit */}
                                        <input
                                            type='checkbox'
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Hit)}
                                        />
                                    </td>
                                    {/* Valid bit input */}
                                    <td>
                                        <input
                                            maxLength={1}
                                            defaultValue={0}
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Valid)}
                                        />
                                    </td>
                                    {/* Tag input */}
                                    <td>
                                        <input
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Tag)}
                                        />
                                    </td>
                                    {/* Offset input */}
                                    <td>
                                        <input
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Offset)}
                                        />
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

export default Cache_table;

