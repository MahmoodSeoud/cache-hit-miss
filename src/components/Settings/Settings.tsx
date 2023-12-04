
import { SetStateAction, useState } from "react";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import './Settings.css';
import 'primeicons/primeicons.css';


interface SettingsProps {
    assignmentType: string;
    addressBitWidth: number;
    setAddressBitWidth: React.Dispatch<SetStateAction<number>>;
    numSets: number;
    setNumSets: React.Dispatch<SetStateAction<number>>;
    numLines: number;
    setNumLines: React.Dispatch<SetStateAction<number>>;
}

export default function Settings(props: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const lineOptions: string[] = ['1', '2'];

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
                        <div className="card flex justify-content-center">
                            <label htmlFor="numSets">Number of sets</label>
                            <div>
                                <InputNumber

                                    value={props.numSets}
                                    disabled />
                                <Slider
                                    value={props.numSets}
                                    onChange={(e: SliderChangeEvent) => props.setNumSets(e.value as number)}
                                    max={8}
                                    min={1}
                                    className="w-14rem"
                                    step={1}

                                />
                            </div>
                        </div>

                        <div className="card flex justify-content-center">
                            <label htmlFor="numLines">Number of lines</label>
                            <div>
                                <SelectButton value={props.numLines.toString()}
                                 onChange={(e: SelectButtonChangeEvent) => props.setNumLines(e.value)} 
                                 options={lineOptions} />

                            </div>
                        </div>

                        <div className="card flex justify-content-center">
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
                        </div>




                        <button onClick={() => setShowSettings(false)}>Cancel</button>
                    </form>
                </div>

            )}

        </>
    );
}

