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
    const { id, name, paymentMethod } = worker;

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
                        {paymentMethod !== 'lean' && <Button onClick={() => WorkerStore.update(setActiveId(id))}>Invite</Button>}
                        <Button>Delivery</Button>
                        <Button onClick={() => {
                            Lean.perform({
                                type: GET_CUSTOMER,
                                params: id
                            }).then((customerData) => {
                                console.log(customerData)
                                if (customerData.message) {
                                    return toast(customerData);
                                }
                                
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
        const hasUsersToOnboard = Object.values(WorkerStore.getValue().entities).filter(({ paymentMethod }) => paymentMethod !== 'lean').length > 0;
        if (hasUsersToOnboard) {
            return;
        }

        const id = '01FY8D77VVNTG93Z9VVRJ24SWX';
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
            birthday: '1990-09-19'
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