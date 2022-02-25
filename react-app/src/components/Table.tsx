import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import './Table.css';

const toRowCell = ({ key, content, width }: any) => {
    let style = [{ label: 'width', value: width }]
        .filter(({ value }) => value)
        .reduce((styles, styleDef) => ({ ...styles, [styleDef.label]: styleDef.value }), {});

    return <div style={style} key={key}>{typeof content === 'function' ? content() : content}</div>
};

const toRow = ({ id, cellDefs }: any) => (
    <ListGroup.Item key={id}>
        <div className="table-item">
            {cellDefs.map(toRowCell)}
        </div>
    </ListGroup.Item>
);

export const Table = ({ header, rows }: any) => {
    const { cells: headerCellDefs } = header;
    const cells = rows.map(toRow);

    return (
        <Card>
            <Card.Body>
                <ListGroup as="ul">
                    {toRow({ id: 'header', cellDefs: headerCellDefs })}
                    {cells}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}