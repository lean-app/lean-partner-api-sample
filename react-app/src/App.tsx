import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';
import { WorkerTable } from './components/WorkerTable';

const App = () => {
  return <div>
    <ToastContainer />
    <WorkerTable />
  </div>
};

export default App;
