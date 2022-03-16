import React from 'react';
import { ulid } from 'ulid';
import { useObservable } from '@ngneat/react-rxjs';

import Lean, { INVITE_CUSTOMER } from '../services/lean.service';

import Button from 'react-bootstrap/Button';
import { useDidMount } from '../hooks/useDidMount';

import { Table } from './Table';

import WorkerStore from '../stores/worker.store';
import { selectActiveEntity, selectAllEntities, setActiveId, setEntities } from '@ngneat/elf-entities';
import { InviteWorkerModal } from './Worker/InviteWorkerModal';
import Modal from 'react-bootstrap/Modal';

const headerCellDefs = [
    {
        key: 'name',
        content: 'Name',
        width: '20%',
    },
    {
        key: 'id',
        content: 'Id',
        width: '10%',
    },
    {
        key: 'payment_method',
        content: 'Payment Method',
        width: '20%',
    },
    {
        key: 'actions',
        content: 'Actions',
        width: '20%'
    }
];

const toRowDefs = (worker: any) => {
    const { id, name, paymentMethod } = worker;

    return ({ id, 
        cellDefs: [
            {
                key: `${id}-name`,
                width: headerCellDefs[0].width, 
                content: name,
            },{
                key: `${id}-id`,
                width: headerCellDefs[1].width, 
                content: id,
            },{
                key: `${id}-payment-method`,
                width: headerCellDefs[2].width, 
                content: paymentMethod,
            },{
                key: `${id}-actions`,
                width: '20%',
                content: (
                    <div className="worker-table-item-actions">
                        {paymentMethod !== 'lean' && <Button onClick={() => WorkerStore.update(setActiveId(id))}>Invite</Button>}
                        <Button>Delivery</Button>
                    </div>
                )
            }
        ] 
    })
};

export const WorkerTable = () => {
    const [workerData] = useObservable(WorkerStore.pipe(selectAllEntities()));
    const [activeWorker] = useObservable(WorkerStore.pipe(selectActiveEntity()));

    useDidMount(() => {
        WorkerStore.update(setEntities([{
            id: ulid(),
            name: 'Zach Jobe',
            paymentMethod: 'bank_account'
        }]));
    });

    let workerCells: any[] = [];
    if (Array.isArray(workerData)) {
        workerCells = workerData
            .map(toRowDefs);
    }

    return <>
        <Table header={{ cells: headerCellDefs }} rows={workerCells} />
        <Modal show={activeWorker !== undefined}>
            <InviteWorkerModal worker={activeWorker} />
        </Modal>
    </>;
}