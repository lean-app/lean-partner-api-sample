import { CustomerTable } from "../components/CustomerTable"

export const Home = () => {
    return (
        <>
        <div className="partner-app-menu"></div>
        <div className="customer-table">
            <CustomerTable />
        </div>
        </>
    )
}