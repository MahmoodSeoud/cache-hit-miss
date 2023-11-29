import { AddressPrefix, BaseConversion, Bit, InputField, InputFieldsMap } from '../../App';
import { useState, useEffect } from 'react';
import './Cache_input_table.css'

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



function Cache_input_table({ cacheEntries, setCacheEntries, facit, addressPrefix, baseConversion }: cache_tableProps) {

    const [inputFields, setInputFields] = useState<InputFields>({
        VirtualAddress: '',
        Offset: '',
        Index: '',
        Tag: '',
        Valid: 0,
        Hit: 0
    });

    function checkInput(): boolean {
        return true
    }

    useEffect(() => {
        console.log('inputFields', inputFields);
        console.log('cacheEntries', cacheEntries);
    });


    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, fieldName: InputField, cacheEntryIndex?: number,): void {
        const regexBits = /^[01]*$/; // regular expression to match only 1's and 0's
        const input = event.target.value;

        switch (fieldName) {
            case InputFieldsMap.VirtualAddress:
                /*                 if (!regexBits.test(input)) {
                                    event.target.value = '';
                                    return;
                                }
                                setInputFields((prevState: InputFields) => ({ ...prevState, [fieldName]: getElementValuesFrom("vbit-input") }));
                                
                                //setCacheEntries((prevState: InputFields) => ({ ...prevState, [fieldName]: getElementValuesFrom("vbit-input") }));
                                */
                break;

            case InputFieldsMap.Offset:
                setCacheEntries((prevState: CACHE_TABLE_ENTRY[]) => {
                    const newState = [...prevState];
                    if (cacheEntryIndex) {
                        newState[cacheEntryIndex].block = input;
                    }
                    return newState;
                });
                break;


            case InputFieldsMap.Valid:
                if (!regexBits.test(input)) {
                    event.target.value = '';
                    return;
                }

                const validBit: Bit = input === '1' ? 1 : 0;

                setCacheEntries((prevState: CACHE_TABLE_ENTRY[]) => {
                    const newState = [...prevState];
                    if (cacheEntryIndex) {
                        newState[cacheEntryIndex].valid = validBit;
                    }
                    return newState;
                });

                break;

            case InputFieldsMap.Tag:
                if (!regexBits.test(input)) {
                    event.target.value = '';
                    return;
                }
                setCacheEntries((prevState: CACHE_TABLE_ENTRY[]) => {
                    const newState = [...prevState];
                    if (cacheEntryIndex) {
                        newState[cacheEntryIndex].tag = Number(input); // Convert input to a number
                    }
                    return newState;
                });
                break;

            case InputFieldsMap.Hit:
                setInputFields((prevState: InputFields) => ({ ...prevState, [fieldName]: event.target.checked ? 1 : 0 }));
                break;

            default:
                break;

        }
    }




    return (
        <div>
            <td>
                <div>
                    Cache hit?
                    {/* Cache hit */}
                    <input
                        type='checkbox'
                        onChange={(ev) => handleInputChange(ev, InputFieldsMap.Hit)}
                    />
                </div>
            </td>
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
                                        <input
                                            maxLength={1}
                                            defaultValue={0}
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Valid, i)}
                                        />
                                    </td>
                                    {/* Tag input */}
                                    <td>
                                        <input
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Tag, i)}
                                        />
                                    </td>
                                    {/* Offset input */}
                                    <td>
                                        <input
                                            onChange={(ev) => handleInputChange(ev, InputFieldsMap.Offset, i)}
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

export default Cache_input_table;

