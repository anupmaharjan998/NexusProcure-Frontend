import {useParams} from "react-router-dom";
import VendorQuotationForm from "../../components/RFQ/VendorQuotationForm";

export default function PublicRfqPage() {
    const {token} = useParams<{ token: string }>();

    if (!token) {
        return <p>Invalid RFQ link</p>;
    }

    return <VendorQuotationForm rfqToken={token}/>;
}
