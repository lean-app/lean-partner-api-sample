import React, { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useDidMount } from '../hooks/lifecycle';

import { GET_WORKERS, perform } from '../services/workers.service';
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
                {paymentMethod === 'lean' && <Button>Invite</Button>}
                <Button>Delivery</Button>
            </div>
        }
    ] 
});

const getWorkers = (cb: Function) => perform({ type: GET_WORKERS }, cb);
export const WorkerTable = () => {
    const [ workerData, setWorkerData ] = useState([]);

    useDidMount(() => {
        getWorkers(({ data }: any) => setWorkerData(data));
    });

    let workerCells: any[] = [];
    if (Array.isArray(workerData)) {
        workerCells = workerData
            .map(toRowDefs);
    } else {
        getWorkers((data: any) => setWorkerData(data));
    }

    return <Table header={{ cells: headerCellDefs }} rows={workerCells} />;
}