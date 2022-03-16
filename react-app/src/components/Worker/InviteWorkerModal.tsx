import Form from 'react-bootstrap/Form';

export const InviteWorkerModal = ({ worker }: { worker: any}) => {
  return <Form>
    <h1>Invite Worker</h1>
    <Form.Group>
      <Form.Label>First Name</Form.Label>
      <Form.Control type="text" placeholder="First Name"></Form.Control>
    </Form.Group>
  </Form>
}