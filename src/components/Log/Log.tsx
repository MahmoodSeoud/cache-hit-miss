import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { useState } from 'react';
import { LogHistory } from '../../App';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './Log.css';

interface ILogProps {
    log: LogHistory;
}
export default function Log({ log }: ILogProps) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="card flex justify-content-center">
            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                position="right"
                >
                <h1>Log</h1>
                {log.logEntries && log.logEntries.length > 0 && log.logEntries.map((logEntry, index) => (
                    <div className='log' key={index}>
                        <p>Address: {logEntry.address.toString(2).padStart(14,'0')}</p>
                        <p>Cache hit? {logEntry.hit.toString()}</p>
                    </div>
                ))}

            </Sidebar >
            <Button icon="pi pi-database" onClick={() => setVisible(true)} />

        </div>
    );
}
