import { selectEntity, UIEntitiesRef } from '@ngneat/elf-entities';
import { useObservable } from '@ngneat/react-rxjs';

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { refresh, showInviteWorkerModal, showServeGigModal } from "../../services/worker.service";
import WorkerStore from '../../stores/worker.store';
import { Worker } from '../../types/Worker';

export const WorkerActionButton = ({ worker }: { worker: Worker }) => {
    const [ workerUi ] = useObservable(WorkerStore.pipe(selectEntity(worker.id, { ref: UIEntitiesRef })))

    return <div className="worker-table-item-actions">
        { (!worker.invited) && <Button onClick={() => showInviteWorkerModal(worker)}>Invite</Button>}
        <Button onClick={() => showServeGigModal(worker)}>Delivery</Button>
        { worker.invited && <Button onClick={() => refresh(worker)} disabled={workerUi?.refreshing}>
            {workerUi?.refreshing 
                ? <Spinner animation='border' /> 
                : 'Refresh'}
        </Button> }
    </div>;
};