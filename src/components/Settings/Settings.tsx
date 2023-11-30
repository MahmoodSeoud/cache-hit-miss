
import { SetStateAction, useState } from "react";
import { InputFieldsMap, Result, createRandomNumber } from "../../App";

import './Settings.css';
import 'primeicons/primeicons.css';


interface SettingsProps {
}

export default function Settings() {
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
                    <p>Greetings, one and all!</p>
                    <form method="dialog">
                        <button>OK</button>
                    </form>
                </div>

            )}

        </>
    );
}

