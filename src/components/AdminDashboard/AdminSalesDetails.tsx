import { useParams } from "react-router";


const AdminSalesDetails = () => {
    const { id } = useParams<{ id: string }>();
    return (
        <div>
            sales all details for user: {id}
        </div>
    );
};

export default AdminSalesDetails;