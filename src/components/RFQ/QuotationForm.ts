import { useForm, useFieldArray } from "react-hook-form";
import { QuotationFormData } from "../../types/Quotation";

export function QuotationForm() {
    const form = useForm<QuotationFormData>({
        defaultValues: {
            quotationDate: new Date().toISOString().split("T")[0],
            items: [
                {
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    vatPercentage: 0,
                    useVatAmount: false
                }
            ],
            agreeToTerms: false
        }
    });

    const items = useFieldArray({
        control: form.control,
        name: "items"
    });

    return { form, items };
}
