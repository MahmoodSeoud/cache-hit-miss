import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { useRef, useState } from 'react';
import { LogHistory } from '../../App';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './Log.css';
import Cache_visual_table from '../Cache_visual_table/Cache_visual_table';
import React from 'react';

interface ILogProps {
    log: LogHistory;
    tag: number;
    changedSet: number | null;
    changedLine: number | null;
}
export default function Log({ log, tag, changedSet, changedLine }: ILogProps) {
    const [visible, setVisible] = useState(false);
    const op = useRef<OverlayPanel>(null);

    return (
        <div className="card flex justify-content-center">
            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                position="right"
            >
                <h1>Log</h1>
                {log.logEntries && log.logEntries.length > 0 && log.logEntries.map((logEntry, index) => (
                    <React.Fragment key={index}>
                        <div
                            className='log'
                            key={index}
                            onClick={(event) => op.current!.toggle(event)}
                        >
                            <p>Address: {logEntry.address.toString(2).padStart(14, '0')}</p>
                            <p>Cache hit? {logEntry.hit.toString()}</p>



                        </div>
                        <OverlayPanel
                            ref={op}
                            style={{ backgroundColor: 'black' }}
                        >
                            <Cache_visual_table
                                cache={logEntry.cache}
                                tag={tag}
                                changedSet={changedSet}
                                changedLine={changedLine}
                            />
                        </OverlayPanel>
                    </React.Fragment>
                ))}

            </Sidebar >
            <Button
                icon="pi pi-database"
                onClick={() => setVisible(true)}
                severity='help'
            />

        </div>
    );
}
