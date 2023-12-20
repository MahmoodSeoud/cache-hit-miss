
import { SetStateAction, useState } from "react";
import { Slider as PrimeSlider, SliderChangeEvent as PrimeSliderChangeEvent } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { styled, alpha, Box } from '@mui/system';
import { Slider as BaseSlider, sliderClasses } from '@mui/base/Slider';
import 'primereact/resources/themes/lara-dark-indigo/theme.css';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import './Settings.css';
import 'primeicons/primeicons.css';
import { Cache } from "../../App";


interface SettingsProps {
    assignmentType: string;
    addressBitWidth: number;
    setAddressBitWidth: React.Dispatch<SetStateAction<number>>;
    numSets: number;
    linesPerSet: number;
    setCache: React.Dispatch<SetStateAction<Cache>>;
    setCacheShouldBeCold: React.Dispatch<SetStateAction<boolean>>;
}

interface CacheTypeOption {
    label: string;
    value: string;
}

export default function Settings({
    addressBitWidth,
    setAddressBitWidth,
    numSets,
    linesPerSet,
    setCache,
    setCacheShouldBeCold,

}: SettingsProps) {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [value, setValue] = useState<CacheTypeOption>();
    const [setAssociativityIsAcitve, setSetAssociativityIsAcitve] = useState<boolean>(false);


    const lineOptions: CacheTypeOption[] = [
        { label: 'Direct Mapped', value: 'directmapped' },
        { label: 'Set Associative', value: 'setassociative' },
        { label: 'Fully Associative', value: 'fullyassociative' }
    ];

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
        if (cacheType === 'directmapped') {
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.linesPerSet = 1;
                return newCache;
            });
            setSetAssociativityIsAcitve(false);
        }
        else if (cacheType === 'fullyassociative') {
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.numSets = 1;
                return newCache;
            });
            setSetAssociativityIsAcitve(false);
        } else if (cacheType === 'setassociative') {
            setSetAssociativityIsAcitve(true);
            setCache((prevState: Cache) => {
                let newCache: Cache = { ...prevState };
                newCache.linesPerSet = 2;
                return newCache;
            });
        }

        setValue({ label: cacheType, value: cacheType });
    }


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
                    style={{ backgroundColor: 'var(--highlight-bg)', width: '30rem' }}
                >

                    <div className="card flex justify-content-center" >
                        <h1>Settings</h1>
              
                        <div className="input-card">
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

                        <div className="input-card">
                            <h3>Number of lines</h3>
                            <SelectButton
                                value={value}
                                onChange={(e: SelectButtonChangeEvent) => handleSetCacheType(e.value)}
                                style={{ width: 'fit-content', display: 'flex', marginBottom: '1rem' }}
                                options={lineOptions}
                            />
                            {setAssociativityIsAcitve && (
                                <>
                                    <InputNumber
                                        defaultValue={2}
                                        value={linesPerSet}
                                        disabled
                                    />

                                    <DiscreteSliderValues
                                        handleSetState={handleNumLines}
                                        marks={lineMarks}
                                        value={linesPerSet}
                                    />
                                </>
                            )}
                        </div>

                        <div className="input-card">
                            <h3>Address bit width</h3>
                            <InputNumber
                                value={addressBitWidth}
                                disabled
                            />
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

