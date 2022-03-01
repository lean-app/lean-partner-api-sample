import Button from 'react-bootstrap/Button';
import WorkerService from '../services/workers.service';

const createWorker = (cb: Function) => () => WorkerService.perform({ 
    type: 'CreateWorker', 
    params: {
        worker: { }
    }
}, cb);

export const WorkerActionBar = () => {
    return <div>
        <Button onClick={createWorker((result: any) => console.log(result))}>Create Worker</Button>
    </div>
}
