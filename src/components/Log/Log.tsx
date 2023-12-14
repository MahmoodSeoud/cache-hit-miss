import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { useRef, useState } from 'react';
import { LogHistory } from '../../App';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './Log.css';
import Cache_visual_table from '../Cache_visual_table/Cache_visual_table';

interface ILogProps {
    log: LogHistory;
    tag: number
}
export default function Log({ log, tag }: ILogProps) {
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
                    <>
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
                            style={{ backgroundColor: 'blac' }}
                        >
                            <Cache_visual_table
                                cache={logEntry.cache}
                                tag={tag}
                            />
                        </OverlayPanel>
                    </>
                ))}

            </Sidebar >
            <Button icon="pi pi-database" onClick={() => setVisible(true)} />

        </div>
    );
}
