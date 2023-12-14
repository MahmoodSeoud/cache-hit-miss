import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { useState } from 'react';
import { LogHistory } from '../../App';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

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
                {log.logEntries && log.logEntries.length > 0 && log.logEntries.map((logEntry, index) => (
                    <div key={index}>
                        <p>Address: {logEntry.address}</p>
                        <p>Cache hit? {logEntry.hit}</p>
                    </div>
                ))}

            </Sidebar >
            <Button icon="pi pi-database" onClick={() => setVisible(true)} />

        </div>
    );
}
