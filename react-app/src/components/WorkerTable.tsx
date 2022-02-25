import React from 'react';

import { useObservable } from '@ngneat/react-rxjs';
import { resetActiveId, selectActiveEntity, selectAllEntities, setActiveId, UIEntitiesRef } from '@ngneat/elf-entities';

import Modal from 'react-bootstrap/Modal';

import { useDidMount } from '../hooks/useDidMount';
import WorkerStore from '../stores/worker.store';

import { Table } from './Table';
import { InviteWorkerModal } from './Worker/InviteWorkerModal';
import { WorkerActionButton } from './Worker/WorkerTableActionButtons';

import { refresh, tryCreateWorkerToInvite } from '../services/worker.service';
import { capitalCase } from 'change-case';
import { ServeGigModal } from './Worker/ServeGigModal';

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
    const [activeWorkerUi] = useObservable(WorkerStore.pipe(selectActiveEntity({ ref: UIEntitiesRef })));

    useDidMount(() => {
        tryCreateWorkerToInvite();
        workerData.map((worker) => refresh(worker));
    });

    let workerCells: any[] = [];
    if (Array.isArray(workerData)) {
        workerCells = workerData
            .map(toRowDefs);
    }

    const closeModal = () => WorkerStore.update(resetActiveId());

    return <>
        <Table header={{ cells: headerCellDefs }} rows={workerCells} />
        <Modal show={!!activeWorkerUi?.showModal} onHide={closeModal}>
            {activeWorkerUi?.showModal === 'invite' && <InviteWorkerModal worker={({ ...activeWorker, email: `grant+${activeWorker?.id}@withlean.com` })} closeModal={closeModal}/>}
            {activeWorkerUi?.showModal === 'gig' && <ServeGigModal worker={activeWorker} closeModal={closeModal} />}
        </Modal>
    </>;
}