import { Cache } from '../../App';
import './Cache_visual_table.css';

type cache_tableProps = {
    cache: Cache;
    tag: number;
    changedSet: number | null;
    changedLine: number | null;
}


function Cache_visual_table({ cache, tag, changedSet, changedLine }: cache_tableProps) {
    return (
        <div>
            <h2>Cache</h2>
            <table className='cache-visual-table'>

                <tbody>
                    {cache.sets && cache.sets.map((set, i) => {
                        const changedSet_ = i === changedSet;
                        return (
                            <tr key={i}>
                                <th>Set {i}</th>
                                <td colSpan={3}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Valid</th>
                                                <th>Tag</th>
                                                <th>Block</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {set.lines && set.lines.length > 0 && set.lines.map((line, j) => {
                                                const blockClass = j === changedLine ? 'changed-block' : '';
                                                const key = `${j}-${Date.now()}`;

                                                return (
                                                    <tr key={key}>
                                                        <td className={changedSet_ ? blockClass : ''}>{line.valid}</td>
                                                        <td className={changedSet_ ? blockClass : ''}>{line.tag.toString(2).padStart(tag, '0')}</td>
                                                        <td className={changedSet_ ? blockClass : ''}>{line.blockSizeStr}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>);
}

export default Cache_visual_table;