
import { SetStateAction, useState } from "react";
import { Slider as PrimeSlider, SliderChangeEvent as PrimeSliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { styled, alpha, Box } from '@mui/system';
import { Slider as BaseSlider, sliderClasses } from '@mui/base/Slider';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import './Settings.css';
import 'primeicons/primeicons.css';
import { Cache, CacheSet } from "../../App";


interface SettingsProps {
    maxAddress: number;
    setMaxAddress: React.Dispatch<SetStateAction<number>>;
    assignmentType: string;
    addressBitWidth: number;
    setAddressBitWidth: React.Dispatch<SetStateAction<number>>;
    numSets: number;
    linesPerSet: number;
    setCache: React.Dispatch<SetStateAction<Cache>>;
    setCacheShouldBeCold: React.Dispatch<SetStateAction<boolean>>;
}

export default function Settings({
    maxAddress,
    setMaxAddress,
    addressBitWidth,
    setAddressBitWidth,
    numSets,
    linesPerSet,
    setCache,
    setCacheShouldBeCold,

}: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const lineOptions: string[] = ['1', '2'];


    function handleSetNumSets(value: number | number[]): void {

        const index = setMarks.findIndex(mark => value === mark.value);
        const numSets = Number(setMarks[index].label)

        setCache((prevState: Cache) => {
            let newCache: Cache = { ...prevState };
            newCache.numSets = numSets;
            return newCache;
        });

    }

    function handleSetNumLines(linesPerSet: number) {
        setCache((prevState: Cache) => {
            let newCache: Cache = { ...prevState };
            newCache.linesPerSet = linesPerSet
            return newCache;
        });
    }

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
                                value={maxAddress}
                                disabled
                            />

                            <PrimeSlider
                                value={maxAddress}
                                onChange={(e: PrimeSliderChangeEvent) => setMaxAddress(e.value as number)}
                                max={1024}
                                min={1}
                                className="w-14rem"
                                step={1}
                            />
                        </div>


                        <div className="input-card">
                            <label htmlFor="numSets">Number of sets</label>
                            <InputNumber
                                value={numSets}
                                disabled
                            />

                            <DiscreteSliderValues
                                handleSetNumSets={handleSetNumSets}
                                marks={setMarks}
                                value={numSets}
                            />
                        </div>

                        <label htmlFor="linesPerSet">Number of lines</label>
                        <div className="input-card">
                            <SelectButton value={linesPerSet.toString()}
                                onChange={(e: SelectButtonChangeEvent) => handleSetNumLines(e.value)}
                                options={lineOptions}
                            />

                        </div>

                        <label htmlFor="linesPerSet"></label>

                        <label htmlFor="addressBitWidth">Address bit width</label>
                        <div className="input-card">
                            <InputNumber
                                value={addressBitWidth}
                                disabled />
                            <PrimeSlider
                                value={addressBitWidth}
                                onChange={(e: PrimeSliderChangeEvent) => setAddressBitWidth(e.value as number)}
                                max={14}
                                min={10}
                                className="w-14rem"
                                step={1}

                            />
                        </div>
                        <div className="input-card">
                            <Button
                                severity="danger"
                                label="Clear Cache"
                                onClick={() => setCacheShouldBeCold(true)}
                            ></Button>
                        </div>
                    </div>
                </Sidebar >
            </div >
        </>
    );
}



interface Mark {
    value: number;
    label: string
};



const setMarks: Mark[] = [
    {
        value: 0,
        label: '4',
    },
    {
        value: 25,
        label: '8',
    },
    {
        value: 50,
        label: '16',
    },
    {
        value: 75,
        label: '32',
    },
    {
        value: 100,
        label: '64',
    },
];

interface DiscreteSliderValuesProps {
    handleSetNumSets: (value: number | number[]) => void;
    marks: Mark[];
    value: number;
}


function DiscreteSliderValues({ handleSetNumSets, marks, value }: DiscreteSliderValuesProps) {
    const defaultValue = marks.find((mark) => mark.label === value.toString())?.value
    return (
        <Box>
            <Slider
                defaultValue={defaultValue}
                step={null}
                style={{ width: '203px' }}
                onChange={(e, value) => handleSetNumSets(value as number)}
                marks={marks}
            />
        </Box>
    );
}


const blue = {
    100: '#DAECFF',
    200: '#99CCF3',
    400: '#3399FF',
    300: '#66B2FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0059B3',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Slider = styled(BaseSlider)(
    ({ theme }) => `
color: ${theme.palette.mode === 'light' ? blue[500] : blue[400]};
height: 6px;
width: 100%;
padding: 16px 0;
display: inline-block;
position: relative;
cursor: pointer;
touch-action: none;
-webkit-tap-highlight-color: transparent;

&.${sliderClasses.disabled} { 
pointer-events: none;
cursor: default;
color: ${theme.palette.mode === 'light' ? grey[300] : grey[600]};
opacity: 0.5;
}

& .${sliderClasses.rail} {
display: block;
position: absolute;
width: 100%;
height: 4px;
border-radius: 2px;
background-color: currentColor;
opacity: 0.4;
}

& .${sliderClasses.track} {
display: block;
position: absolute;
height: 4px;
border-radius: 2px;
background-color: currentColor;
}

& .${sliderClasses.thumb} {
position: absolute;
width: 16px;
height: 16px;
margin-left: -6px;
margin-top: -6px;
box-sizing: border-box;
border-radius: 50%;
outline: 0;
border: 3px solid currentColor;
background-color: #fff;

&:hover{
box-shadow: 0 0 0 4px ${alpha(
        theme.palette.mode === 'light' ? blue[200] : blue[300],
        0.3,
    )};
}
 
&.${sliderClasses.focusVisible} {
box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
outline: none;
}

&.${sliderClasses.active} {
box-shadow: 0 0 0 5px ${alpha(
        theme.palette.mode === 'light' ? blue[200] : blue[300],
        0.5,
    )};
outline: none;
}
}

& .${sliderClasses.mark} {
position: absolute;
width: 8px;
height: 8px;
border-radius: 99%;
background-color: ${theme.palette.mode === 'light' ? blue[200] : blue[900]};
top: 43%;
transform: translateX(-50%);
}

& .${sliderClasses.markActive} {
background-color: ${theme.palette.mode === 'light' ? blue[500] : blue[400]};
}

& .${sliderClasses.markLabel} {
font-family: Arial, sans-serif;
font-weight: 600;
font-size: 12px;
position: absolute;
top: 20px;
transform: translateX(-50%);
margin-top: 8px;
}
`,
);

