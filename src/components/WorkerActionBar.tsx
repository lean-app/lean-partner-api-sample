import Button from 'react-bootstrap/Button';
import { perform } from '../services/workers.service';

const createWorker = (cb: Function) => () => perform({ 
    type: 'CREATE_WORKER', 
    params: {
        worker: { }
    }
}, cb);

export const WorkerActionBar = () => {
    return <div>
        <Button onClick={createWorker((result: any) => console.log(result))}>Create Worker</Button>
    </div>
}
