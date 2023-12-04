
import { SetStateAction, useState } from "react";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
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
                            <InputNumber value={props.numSets} disabled />
                            <Slider
                                value={props.numSets}
                                onChange={(e: SliderChangeEvent) => props.setNumSets(e.value as number)}
                                max={8}
                                min={1}
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

