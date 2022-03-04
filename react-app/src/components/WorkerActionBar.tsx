import { ulid } from 'ulid';

import Button from 'react-bootstrap/Button';
import WorkerService from '../services/workers.service';
import { CreateWorkerProps } from '../services/workers/api';

const createWorker = (worker: CreateWorkerProps, cb?: Function) => () => WorkerService.perform({ 
    type: 'CreateWorker', 
    params: { worker }
}, cb);

export const WorkerActionBar = () => {
    return <div>
        <Button onClick={createWorker({
            firstName: "Jane",
            lastName: "Doe",
            birthday: "1980-12-31",
            phoneNumber: "+14085008105",
            email: `janedoe+${ulid()}@gmail.com`,
            street: "700 Treehouse Drive",
            city: "San Jose",
            state: "CA",
            postalCode: "95101",
            partnerUserId: ulid(),
            registrationDate: "2020-01-01",
            invite: true
        })} >Create Worker</Button>
    </div>
}
