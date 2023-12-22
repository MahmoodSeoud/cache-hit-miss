import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { useRef, useState } from 'react';
import { LogHistory } from '../../App';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import './Log.css';
import Cache_visual_table from '../Cache_visual_table/Cache_visual_table';
//import { Dialog } from 'primereact/dialog';
import React from 'react';
import { Card } from 'primereact/card';

interface ILogProps {
    log: LogHistory;
    tag: number;
    addressBitWidth: number;
}
export default function Log({ log, tag, addressBitWidth }: ILogProps) {
    const [visible, setVisible] = useState(false);
    //const [showCache, setShowCache] = useState(false);
    const op = useRef<OverlayPanel[]>([]);

    return (
        <div className="card flex justify-content-center">
            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                position="right"
                style={{ backgroundColor: 'var(--primary-color)', width: '30rem', color: 'var(--primary-color-text)' }}
            >

                <h1>Log</h1>
                {log.logEntries && log.logEntries.length > 0 && log.logEntries.map((logEntry, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Card
                                title={`Log entry ${index}`}
                                onClick={(event) => op.current[index].toggle(event)}
                                className='log'
                                subTitle={`Set: ${logEntry.setIndexed} Line: ${logEntry.lineIndexed}`}

                            >
                                <p>Address: {logEntry.address.toString(2).padStart(addressBitWidth, '0')}</p>
                                <p>Cache hit? {logEntry.hit.toString()}</p>

                            </Card>
                            <OverlayPanel
                                ref={(el: OverlayPanel | null) => (op.current[index] = el as OverlayPanel)}
                                showCloseIcon
                                closeOnEscape
                                dismissable
                                key={index}
                                style={{ backgroundColor: 'black', color: 'var(--primary-color-text)' }}
                            >
                                <h3>Set: {logEntry.setIndexed}</h3>
                                <h3>Line: {logEntry.lineIndexed}</h3>
                                <Cache_visual_table
                                    cache={logEntry.cache}
                                    tag={tag}
                                    changedSet={logEntry.setIndexed}
                                    changedLine={logEntry.lineIndexed}
                                />
                            </OverlayPanel>
                        </React.Fragment>
                    );
                })}

            </Sidebar >
            <Button
                icon="pi pi-database"
                onClick={() => setVisible(true)}
                severity='help'
            />

        </div>
    );
}
