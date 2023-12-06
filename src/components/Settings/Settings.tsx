
import { SetStateAction, useState } from "react";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { InputSwitch } from 'primereact/inputswitch';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import './Settings.css';
import 'primeicons/primeicons.css';
import { CACHE_TABLE_ENTRY } from "../Cache_input_table/Cache_input_table";
import { createEmptyTableEntries } from "../../App";


interface SettingsProps {
    maxAddress: number;
    setMaxAddress: React.Dispatch<SetStateAction<number>>;
    assignmentType: string;
    addressBitWidth: number;
    setAddressBitWidth: React.Dispatch<SetStateAction<number>>;
    numSets: number;
    setNumSets: React.Dispatch<SetStateAction<number>>;
    numLines: number;
    setNumLines: React.Dispatch<SetStateAction<number>>;
    cacheShouldBeCold: boolean;
    setCacheShouldBeCold: React.Dispatch<SetStateAction<boolean>>;
    setCacheEntries: React.Dispatch<SetStateAction<CACHE_TABLE_ENTRY[][]>>;
}

export default function Settings(props: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const lineOptions: string[] = ['1', '2'];

    return (
        <>
            <div className="settings-window">
                <Button icon="pi pi-cog" onClick={() => setShowSettings(true)} />
                <Sidebar visible={showSettings}
                    onHide={() => setShowSettings(false)}
                    style={{ backgroundColor: 'var(--highlight-bg)' }}
                >

                    <div className="card flex justify-content-center" >
                        <div className="input-card">
                            <label htmlFor="AddressValue">Address Max Value</label>
                            <InputNumber
                                value={props.maxAddress}
                                disabled
                            />

                            <Slider
                                value={props.maxAddress}
                                onChange={(e: SliderChangeEvent) => props.setMaxAddress(e.value as number)}
                                max={1024}
                                min={1}
                                className="w-14rem"
                                step={1}
                            />
                        </div>


                        <div className="input-card">
                            <label htmlFor="numSets">Number of sets</label>
                            <InputNumber
                                value={props.numSets}
                                disabled
                            />

                            <Slider
                                value={props.numSets}
                                onChange={(e: SliderChangeEvent) => props.setNumSets(e.value as number)}
                                max={8}
                                min={1}
                                className="w-14rem"
                                step={1}

                            />
                        </div>

                        <label htmlFor="numLines">Number of lines</label>
                        <div className="input-card">
                            <SelectButton value={props.numLines.toString()}
                                onChange={(e: SelectButtonChangeEvent) => props.setNumLines(e.value)}
                                options={lineOptions}
                            />

                        </div>

                        <label htmlFor="numLines"></label>
                        <div className="input-card">
                            <Button
                                severity="danger"
                                label="Clear Cache"
                                onClick={(e) => props.setCacheEntries(createEmptyTableEntries(props.numSets, props.numLines, { tag: 0, valid: 0, block: "" }))}
                            ></Button>


                        </div>

                        <label htmlFor="addressBitWidth">Address bit width</label>
                        <div className="input-card">
                            <InputNumber
                                value={props.addressBitWidth}
                                disabled />
                            <Slider
                                value={props.addressBitWidth}
                                onChange={(e: SliderChangeEvent) => props.setAddressBitWidth(e.value as number)}
                                max={14}
                                min={10}
                                className="w-14rem"
                                step={1}

                            />
                        </div>
                        <button onClick={() => setShowSettings(false)}>Cancel</button>
                    </div>
                </Sidebar >
            </div >
        </>
    );
}

