import React from 'react';
import { ulid } from 'ulid';
import { useObservable } from '@ngneat/react-rxjs';

import Button from 'react-bootstrap/Button';
import { useDidMount } from '../hooks/useDidMount';

import Lean, { GET_CUSTOMERS, INVITE_CUSTOMER } from '../services/lean.service';
import { Table } from './Table';

import WorkerStore from '../stores/worker.store';
import { selectAllEntities, setEntities } from '@ngneat/elf-entities';

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
                content: () => {
                    return <div className="worker-table-item-actions">
                        {paymentMethod !== 'lean' && <Button onClick={() => {
                            Lean.perform({ type: INVITE_CUSTOMER, params: worker })
                    }}>Invite</Button>}
                        <Button>Delivery</Button>
                    </div>
                }
            }
        ] 
    })
};

export const WorkerTable = () => {
    const [workerData] = useObservable(WorkerStore.pipe(selectAllEntities()));

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

    return <Table header={{ cells: headerCellDefs }} rows={workerCells} />;
}