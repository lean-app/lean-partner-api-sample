import React, { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { useDidMount } from '../hooks/lifecycle';

import { GET_WORKERS, perform } from '../shared/worker.service';

import './CustomerTable.css';

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

const toRowCell = ({ key, content, width }: any) => {
    let style = [{ label: 'width', value: width }]
        .filter(({ value }) => value)
        .reduce((styles, styleDef) => ({ ...styles, [styleDef.label]: styleDef.value }), {});

    return <div style={style} key={key}>{content}</div>
};

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
            content: <div className="customer-table-item-actions">
                {paymentMethod === 'lean' && <Button>Invite</Button>}
                <Button>Delivery</Button>
            </div>
        }
    ] 
});

const toRow = ({ id, cellDefs }: any) => (
    <ListGroup.Item key={id}>
        <div className="customer-table-item">
            {cellDefs.map(toRowCell)}
        </div>
    </ListGroup.Item>
);

const getWorkers = (cb: Function) => perform({ type: GET_WORKERS }, cb);

export const CustomerTable = () => {
    const [ customerData, setCustomerData ] = useState([]);

    useDidMount(() => {
        perform({ type: GET_WORKERS }, (data: any) => setCustomerData(data));
    });

    let customerCells: JSX.Element[] = [];
    if (Array.isArray(customerData)) {
        customerCells = customerData
            .map(toRowDefs)
            .map(toRow);
    } else {
        getWorkers((data: any) => setCustomerData(data));
    }

    return (
    <Card>
        <Card.Body>
            <ListGroup as="ul">
                {toRow({ id: 'header', cellDefs: headerCellDefs })}
                {customerCells}
            </ListGroup>
        </Card.Body>
    </Card>
    );
}