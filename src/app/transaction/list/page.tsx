import NavbarComponent from "@/components/navbar/navbar";
import TransactionList from "@/components/transactions/transactionlist/list";

export default function TransactionListPage() {
    return (
        <div>
            <NavbarComponent />
            <TransactionList />
        </div>
    );
}
