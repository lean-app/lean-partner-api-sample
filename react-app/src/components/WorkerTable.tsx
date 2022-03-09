import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import { ulid } from 'ulid';
import { useDidMount } from '../hooks/lifecycle';

import WorkerService, { GET_WORKERS, INVITE_WORKER } from '../services/workers.service';
import { Table } from './Table';

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

const toRowDefs = ({ name, id, paymentMethod }: any) => ({ id, 
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
            content: <div className="worker-table-item-actions">
                {paymentMethod !== 'lean' && <Button onClick={() => WorkerService.perform({ type: INVITE_WORKER, params: {
                    partnerUserId: id
                } })}>Invite</Button>}
                <Button>Delivery</Button>
            </div>
        }
    ] 
});

export const WorkerTable = () => {
    const [ workerData, setWorkerData ] = useState([]);

    useDidMount(() => {
        WorkerService.perform({ type: GET_WORKERS }, ({ data, error }: any) => {
            data && setWorkerData(data)
        });
    });

    let workerCells: any[] = [];
    if (Array.isArray(workerData)) {
        workerCells = workerData
            .map(toRowDefs);
    }

    return <Table header={{ cells: headerCellDefs }} rows={workerCells} />;
}