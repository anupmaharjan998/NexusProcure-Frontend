import { useParams } from "react-router-dom";
import VendorQuotationForm from "../../components/RFQ/VendorQuotationForm";

export default function RfqPage() {
    const { token } = useParams<{ token: string }>();

    if (!token) {
        return <p>Invalid RFQ link</p>;
    }

    return <VendorQuotationForm rfqToken={token} />;
}
