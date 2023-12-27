import { SetStateAction, useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { styled, alpha, Box } from '@mui/system';
import { Slider as BaseSlider, sliderClasses } from '@mui/base/Slider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Sidebar } from 'primereact/sidebar';
import { Cache } from "../../App";
import './Settings.css';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primeicons/primeicons.css';


interface SettingsProps {
    numSets: number;
    linesPerSet: number;
    setCache: React.Dispatch<SetStateAction<Cache>>;
    setCacheShouldBeCold: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Array of options for cache associativity types.
 * Each option is an object with a `label` and a `value`.
 * `label` is a string that describes the cache associativity type.
 * `value` is a number that represents the cache associativity type.
 * @type {CacheTypeOption[]}
 */
const cacheOptions: string[] = [
    'direct',
    'n-way',
];


export default function Settings({
    numSets,
    linesPerSet,
    setCache,
    setCacheShouldBeCold,

}: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [cacheAssociativity, setCacheAssociativity] = useState<string>(cacheOptions[0]);

    function handleSetState(value: number | number[]): void {

        const index = setMarks.findIndex(mark => value === mark.value);
        const numSets = Number(setMarks[index].label)


        setCache((prevState: Cache) => {
            let newCache: Cache = { ...prevState };
            newCache.numSets = numSets;
            return newCache;
        });


    }

    function handleNumLines(value: number | number[]) {
        const index = lineMarks.findIndex(mark => value === mark.value);
        const linesPerSet = Number(lineMarks[index].label)

        linesPerSet && setCache((prevState: Cache) => {
            let newCache: Cache = { ...prevState };
            newCache.linesPerSet = linesPerSet;
            return newCache;
        });
    }

    function handleSetCacheType(cacheType: string) {
        // direct mapped, where there can only be 1 linePerSet
        if (cacheType === cacheOptions[0]) {
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.numSets = 4;
                newCache.linesPerSet = 1;
                return newCache;
            });
        }
        // n-way set associative, with default linesPerSet = 2
        else if (cacheType === cacheOptions[1]) {
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.numSets = 4;
                newCache.linesPerSet = 2;
                return newCache;
            });
            // fully associative, where there can only be 1 set
        } /* else if (cacheType === cacheOptions[2]) {
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.numSets = 1;
                newCache.linesPerSet = 4;
                return newCache;
            });
        } */

        setCacheAssociativity(cacheType);
    }

    const setSliderJSX: JSX.Element = (
        < div className="input-card">
            <h3>Number of sets</h3>
            <InputNumber
                value={numSets}
                disabled
            />

            <DiscreteSliderValues
                handleSetState={handleSetState}
                marks={setMarks}
                value={numSets}
            />
        </div>
    )

    const lineSliderJSX: JSX.Element = (
        <div className="input-card">
            <h3>Number of lines</h3>
            <InputNumber
                defaultValue={linesPerSet}
                value={linesPerSet}
                disabled
            />

            <DiscreteSliderValues
                handleSetState={handleNumLines}
                marks={lineMarks}
                value={linesPerSet}
            />
        </div>
    )


    return (
        <>
            <div className="settings-window">
                <Button
                    icon="pi pi-cog"
                    onClick={() => setShowSettings(true)}
                    severity="info"
                />
                <Sidebar
                    visible={showSettings}
                    onHide={() => setShowSettings(false)}
                    style={{ backgroundColor: 'var(--primary-color)', width: '30rem', color: 'var(--primary-color-text)' }}
                >

                    <div className="card flex justify-content-center" >
                        <h1>Settings</h1>

                        {/*       <Card
                            title="Address settings"
                            style={{
                                margin: '1em',
                                width: '20em',
                            }}
                            subTitle="Address bit width"
                        >
                            <InputNumber
                                value={addressBitWidth}
                                disabled
                            />
                            <PrimeSlider
                                value={addressBitWidth}
                                onChange={(e: PrimeSliderChangeEvent) => setAddressBitWidth(e.value as number)}
                                max={14}
                                min={10}
                                style={{ backgroundColor: 'var(--highlight-bg)', width: '100%' }}
                                step={1}

                            />
                        </Card> */}


                        <Card
                            title="Cache settings"
                        >
                            <div className="card flex justify-content-center" >
                                <SelectButton
                                    defaultValue={cacheOptions[0]}
                                    value={cacheAssociativity}
                                    onChange={(e: SelectButtonChangeEvent) => handleSetCacheType(e.value)}
                                    options={cacheOptions}
                                />

                                {/* direct mapped */}
                                {cacheAssociativity === cacheOptions[0] && (
                                    <div>
                                        {setSliderJSX}
                                    </div>

                                )}

                                {/* n-way set associative */}
                                {cacheAssociativity === cacheOptions[1] && (
                                    <div>
                                        {setSliderJSX}
                                        {lineSliderJSX}
                                    </div>
                                )}

                                <Button
                                    severity="danger"
                                    label="Clear Cache"
                                    onClick={() => setCacheShouldBeCold(true)}
                                />
                            </div>
                        </Card>
                    </div>
                </Sidebar>
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
        label: '2',
    },
    {
        value: 25,
        label: '4',
    },
    {
        value: 50,
        label: '8',
    },
    {
        value: 75,
        label: '16',
    },
    {
        value: 100,
        label: '32',
    },
];

const lineMarks: Mark[] = [
    {
        value: 0,
        label: '2',
    },
    {
        value: 25,
        label: '4',
    },
    {
        value: 50,
        label: '8',
    },
    {
        value: 75,
        label: '16',
    },
    {
        value: 100,
        label: '64',
    },
];

interface DiscreteSliderValuesProps {
    handleSetState: (value: number | number[]) => void;
    marks: Mark[];
    value: number;
}


function DiscreteSliderValues({ handleSetState, marks, value }: DiscreteSliderValuesProps) {
    const defaultValue = marks.find((mark) => mark.label === value.toString())?.value
    return (
        <Box>
            <Slider
                value={defaultValue}
                step={null}
                style={{ width: '203px' }}
                onChange={(_, value) => handleSetState(value as number)}
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

