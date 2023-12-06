
import { SetStateAction, useState } from "react";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import './Settings.css';
import 'primeicons/primeicons.css';
import { createRandomNumber } from "../../App";


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

}

export default function Settings(props: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const lineOptions: string[] = ['1', '2'];
    const cacheShouldBeCold: string[] = ['True', 'False'];

    return (
        <>

            <i
                className="pi pi-cog"
                style={{ fontSize: '2em', cursor: 'pointer' }}
                onClick={() => setShowSettings(!showSettings)}
            />


            {showSettings && (
                <div className="settings-window">

                    <form method="dialog">
                        <div>
                            <label htmlFor="AddressValue">Address Max Value</label>
                            <div>
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
                            <label htmlFor="numSets">Number of sets</label>
                            <div>
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
                            <div>
                                <SelectButton value={props.numLines.toString()}
                                    onChange={(e: SelectButtonChangeEvent) => props.setNumLines(e.value)}
                                    options={lineOptions}
                                />

                            </div>
                        </div>

                        <label htmlFor="numLines">Should cache be cold?</label>
                        <div>
                            <SelectButton value={props.cacheShouldBeCold}
                                onChange={(e: SelectButtonChangeEvent) => props.setCacheShouldBeCold(e.value)}
                                options={cacheShouldBeCold}
                            />

                        </div>

                        <label htmlFor="addressBitWidth">Address bit width</label>
                        <div>
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
                    </form>
                </div>

            )}

        </>
    );
}

