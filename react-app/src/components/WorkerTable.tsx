import React from 'react';

import { useObservable } from '@ngneat/react-rxjs';
import { selectActiveEntity, selectAllEntities, setActiveId } from '@ngneat/elf-entities';

import Modal from 'react-bootstrap/Modal';

import { useDidMount } from '../hooks/useDidMount';
import WorkerStore from '../stores/worker.store';

import { Table } from './Table';
import { InviteWorkerModal } from './Worker/InviteWorkerModal';
import { WorkerActionButton } from './Worker/WorkerTableActionButtons';

import { refresh, tryCreateWorkerToInvite } from '../services/worker.service';
import { capitalCase } from 'change-case';

const headerCellDefs = [
    {
        key: 'id',
        content: 'Id',
        width: '10%',
    },
    {
        key: 'name',
        content: 'Name',
        width: '20%',
    },
    {
        key: 'status',
        content: 'Status',
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
    const { id, name, paymentMethod, status } = worker;

    return ({ id, 
        cellDefs: [
            {
                key: `${id}-id`,
                width: headerCellDefs[0].width, 
                content: id,
            },{
                key: `${id}-name`,
                width: headerCellDefs[1].width, 
                content: capitalCase(name),
            },{
                key: `${id}-status`,
                width: headerCellDefs[2].width, 
                content: capitalCase(status),
            },{
                key: `${id}-payment-method`,
                width: headerCellDefs[3].width, 
                content: capitalCase(paymentMethod.split('_').join(' '))
            },{
                key: `${id}-actions`,
                width: headerCellDefs[4].width, 
                content: <WorkerActionButton worker={worker} />
            }
        ] 
    })
};

export const WorkerTable = () => {
    const [workerData] = useObservable(WorkerStore.pipe(selectAllEntities()));
    const [activeWorker] = useObservable(WorkerStore.pipe(selectActiveEntity()));

    useDidMount(() => {
        tryCreateWorkerToInvite();
        workerData.map((worker) => refresh(worker));
    });

    let workerCells: any[] = [];
    if (Array.isArray(workerData)) {
        workerCells = workerData
            .map(toRowDefs);
    }

    const closeModal = () => WorkerStore.update(setActiveId(undefined));

    return <>
        <Table header={{ cells: headerCellDefs }} rows={workerCells} />
        <Modal show={activeWorker !== undefined} onHide={closeModal}>
            <InviteWorkerModal worker={({ ...activeWorker, email: `grant+${activeWorker?.id}@withlean.com` })} closeModal={closeModal}/>
        </Modal>
    </>;
}