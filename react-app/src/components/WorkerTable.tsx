import React from 'react';
import { ulid } from 'ulid';
import { useObservable } from '@ngneat/react-rxjs';

import Lean, { GET_CUSTOMER, INVITE_CUSTOMER } from '../services/lean.service';

import Button from 'react-bootstrap/Button';
import { useDidMount } from '../hooks/useDidMount';

import { Table } from './Table';

import WorkerStore from '../stores/worker.store';
import { addEntities, selectActiveEntity, selectAllEntities, setActiveId, setEntities, updateEntities } from '@ngneat/elf-entities';
import { InviteWorkerModal } from './Worker/InviteWorkerModal';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

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
    const { id, name, paymentMethod, status } = worker;

    return ({ id, 
        cellDefs: [
            {
                key: `${id}-id`,
                width: headerCellDefs[1].width, 
                content: id,
            },{
                key: `${id}-name`,
                width: headerCellDefs[0].width, 
                content: name,
            },{
                key: `${id}-payment-method`,
                width: headerCellDefs[2].width, 
                content: paymentMethod,
            },{
                key: `${id}-actions`,
                width: '20%',
                content: (
                    <div className="worker-table-item-actions">
                        {(paymentMethod !== 'lean' && status === 'NEW') && <Button onClick={() => WorkerStore.update(setActiveId(id))}>Invite</Button>}
                        <Button>Delivery</Button>
                        <Button onClick={() => {
                            Lean.perform({
                                type: GET_CUSTOMER,
                                params: id
                            }).then((customerData) => {
                                if (customerData.message) {
                                    toast(customerData.message);
                                    return;
                                }
                                
                                toast("Worker refreshed!");
                                if (customerData.updatedAt <= worker.updatedAt) {
                                    return;
                                }

                                WorkerStore.update(
                                    updateEntities(id, (entity) => {
                                        if (customerData.status === 'ACTIVE' && worker.paymentMethod !== 'lean') {
                                            entity.paymentMethod = 'lean';
                                        }

                                        return entity;
                                    })
                                )
                            });
                        }}>Refresh</Button>
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
        Promise.allSettled(workerData.map((worker) => {
            Lean.perform({
                type: GET_CUSTOMER,
                params: worker.id
            }).then(({ status, data }) => {
                if (status !== 200) {
                    toast(data.message);
                    return;
                }
                
                toast("Worker refreshed!");
                if (data.updatedAt <= worker.updatedAt) {
                    return;
                }

                WorkerStore.update(
                    updateEntities(worker.id, (entity) => {
                        if (data.status === 'ACTIVE' && worker.paymentMethod !== 'lean') {
                            entity.paymentMethod = 'lean';
                        }

                        return entity;
                    })
                )
            });
        }));

        const hasUsersToOnboard = Object.values(WorkerStore.getValue().entities).filter(({ paymentMethod }) => paymentMethod !== 'lean').length > 0;
        if (hasUsersToOnboard) {
            return;
        }

        const id = ulid();
        WorkerStore.update(addEntities(({
            id,
            name: 'Zach Jobe',
            paymentMethod: 'bank_account',
            email: `grant+${id}@withlean.com`,
            street: 'residential house',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90000',
            phoneNumber: `${`${Math.random()}`.substring(2, 5)}-${ `${Math.random()}`.substring(2, 5)}-${`${Math.random()}`.substring(2, 6)}`,
            birthday: '1990-09-19',
            status: 'NEW'
        })));
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
            <InviteWorkerModal worker={activeWorker} closeModal={closeModal}/>
        </Modal>
    </>;
}