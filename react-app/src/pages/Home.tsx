import { WorkerTable } from "../components/WorkerTable"
import { WorkerActionBar } from "../components/WorkerActionBar"
export const Home = () => {
    return (
        <>
        <div className="partner-app-menu"></div>
        <div className="worker-table">
            <WorkerTable />
            <WorkerActionBar />
        </div>
        </>
    )
}