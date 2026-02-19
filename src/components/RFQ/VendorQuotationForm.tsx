import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Paper,
    Divider,
    Checkbox,
    FormControlLabel,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Alert,
    Skeleton
} from '@mui/material';
import {
    useForm,
    useFieldArray,
    Controller,
    useWatch
} from 'react-hook-form';
import {getRfq, submitQuotation} from '../../services/rfqService';

/* ================= TYPES ================= */

interface QuotationItem {
    rfqItemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatPercentage: number;
}

interface QuotationFormData {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;

    quotationNumber: string;
    quotationDate: string;
    validUntil: string;

    paymentTerms: string;
    deliveryTime: string;
    notes: string;

    signature: string;

    items: QuotationItem[];
}
type FormState = 'loading' | 'editable' | 'submitted' | 'locked';


/* ================= COMPONENT ================= */

export default function VendorQuotationForm({rfqToken}: { rfqToken: string }) {
    const [loading, setLoading] = useState(true);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState('');

    /* ✅ ADDED */
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formState, setFormState] = useState<FormState>('loading');

    const {control, handleSubmit, setValue} =
        useForm<QuotationFormData>({
            defaultValues: {
                quotationDate: new Date().toISOString().split('T')[0],
                items: [],
                signature: ''
            }
        });

    const {fields} = useFieldArray({
        control,
        name: 'items'
    });

    /* ================= LOAD RFQ ================= */

    useEffect(() => {
        getRfq(rfqToken)
            .then(res => {
                const rfq = res.data;

                if (rfq == null) {
                    setFormState('submitted');
                    return;
                }

                setValue('quotationNumber', rfq.rfqNumber);
                setValue('validUntil', rfq.submissionDeadline.split('T')[0]);

                setValue('companyName', rfq.vendor.companyName);
                setValue('contactPerson', rfq.vendor.vendorName);
                setValue('email', rfq.vendor.email);
                setValue('phone', rfq.vendor.phone);
                setValue('address', rfq.vendor.address);
                setValue('paymentTerms', rfq.vendor.paymentTerms || '');

                setValue(
                    'items',
                    rfq.items.map((i: any) => ({
                        rfqItemId: i.id,
                        description: i.itemName,
                        quantity: i.quantity,
                        unitPrice: 0,
                        vatPercentage: 0
                    }))
                );

                setLoading(false);
                setFormState('editable');
            })
            .catch(() => {
                setError('Failed to load RFQ');
                setLoading(false);
            });
    }, [rfqToken, setValue]);

    /* ================= WATCH ITEMS ================= */

    const items = useWatch({
        control,
        name: 'items'
    }) || [];

    /* ================= CALCULATIONS ================= */

    const subtotal = useMemo(
        () =>
            items.reduce(
                (s, i) =>
                    s +
                    (Number(i.quantity) || 0) *
                    (Number(i.unitPrice) || 0),
                0
            ),
        [items]
    );

    const vatTotal = useMemo(
        () =>
            items.reduce(
                (s, i) =>
                    s +
                    (Number(i.quantity) || 0) *
                    (Number(i.unitPrice) || 0) *
                    (Number(i.vatPercentage) || 0) / 100,
                0
            ),
        [items]
    );

    const grandTotal = subtotal + vatTotal;

    /* ================= SUBMIT ================= */

    const submit = async () => {
        setError('');
        setSuccess('');

        if (!accepted) {
            setError('You must accept the terms and conditions');
            return;
        }

        if (grandTotal <= 0) {
            setError('Grand total must be greater than zero');
            return;
        }

        const payload = {
            deliveryTime: control._formValues.deliveryTime,
            notes: control._formValues.notes,
            signature: control._formValues.signature,

            items: items.map(i => ({
                rfqItemId: i.rfqItemId,
                itemName: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxPercentage: i.vatPercentage
            }))
        };

        try {
            setSubmitting(true);
            await submitQuotation(rfqToken, payload);
            setSuccess('Quotation submitted successfully');
            setFormState('submitted');
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                'Failed to submit quotation. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    debugger;
    if (loading) {
        return <Skeleton variant="rectangular" height={600}/>;
    }

    /* ================= RENDER ================= */
    if (formState === 'loading') {
        return <Skeleton variant="rectangular" height={600} />;
    }

    if (formState === 'submitted') {
        return (
            <Box maxWidth="sm" mx="auto" mt={6}>
                <Alert severity="success">
                    <Typography fontWeight={600}>
                        Quotation Already Submitted
                    </Typography>
                    <Typography variant="body2" mt={1}>
                        Your quotation has already been submitted and cannot be modified.
                    </Typography>
                </Alert>
            </Box>
        );
    }


    if (formState === 'locked') {
        return (
            <Box maxWidth="sm" mx="auto" mt={6}>
                <Alert severity="warning">
                    <Typography fontWeight={600}>
                        Quotation Not Available
                    </Typography>
                    <Typography variant="body2" mt={1}>
                        This RFQ is no longer accepting quotations.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    return (
        <Box maxWidth="lg" mx="auto">
            <Typography variant="h4" fontWeight={700} mb={1}>
                Vendor Quotation Form
            </Typography>
            <Typography color="text.secondary" mb={3}>
                Please fill in all required details
            </Typography>

            {/* ✅ ADDED */}
            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{mb: 2}}>
                    {success}
                </Alert>
            )}

            <form onSubmit={handleSubmit(submit)}>
                {/* ================= Vendor Info ================= */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography fontWeight={600} mb={2}>
                        Vendor Information
                    </Typography>

                    <Box display="grid" gridTemplateColumns="repeat(2,1fr)" gap={2}>
                        {[
                            ['companyName', 'Company Name'],
                            ['contactPerson', 'Contact Person'],
                            ['email', 'Email'],
                            ['phone', 'Phone']
                        ].map(([name, label]) => (
                            <Controller
                                key={name}
                                name={name as keyof QuotationFormData}
                                control={control}
                                render={({field}) => (
                                    <TextField {...field} label={label} disabled/>
                                )}
                            />
                        ))}

                        <Controller
                            name="address"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Business Address"
                                    multiline
                                    rows={2}
                                    disabled
                                    sx={{gridColumn: '1 / -1'}}
                                />
                            )}
                        />
                    </Box>
                </Paper>

                {/* ================= Quotation Details ================= */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography fontWeight={600} mb={2}>
                        Quotation Details
                    </Typography>

                    <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={2}>
                        {[
                            ['quotationNumber', 'Quotation Number'],
                            ['quotationDate', 'Quotation Date'],
                            ['validUntil', 'Valid Until']
                        ].map(([name, label]) => (
                            <Controller
                                key={name}
                                name={name as keyof QuotationFormData}
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label={label}
                                        type={name === 'quotationNumber' ? 'text' : 'date'}
                                        InputLabelProps={{shrink: true}}
                                        disabled
                                    />
                                )}
                            />
                        ))}
                    </Box>
                </Paper>

                {/* ================= Items ================= */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography fontWeight={600} mb={2}>
                        Items & Pricing
                    </Typography>

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="right">VAT %</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {fields.map((_, i) => {
                                const base =
                                    items[i]?.quantity *
                                    (items[i]?.unitPrice || 0);
                                const vat =
                                    base *
                                    (items[i]?.vatPercentage || 0) / 100;

                                return (
                                    <TableRow key={i}>
                                        <TableCell>{items[i]?.description}</TableCell>
                                        <TableCell align="center">{items[i]?.quantity}</TableCell>

                                        <TableCell align="right">
                                            <Controller
                                                name={`items.${i}.unitPrice`}
                                                control={control}
                                                render={({field}) => (
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        type="number"
                                                        inputProps={{min: 0.01, step: 0.01}}
                                                        onChange={e =>
                                                            field.onChange(
                                                                Math.max(Number(e.target.value), 0.01)
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Controller
                                                name={`items.${i}.vatPercentage`}
                                                control={control}
                                                render={({field}) => (
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        type="number"
                                                        inputProps={{min: 0, max: 100, step: 1}}
                                                    />
                                                )}
                                            />
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {(base + vat).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Divider sx={{my: 2}}/>

                    <Box textAlign="right">
                        <Typography>Subtotal: {subtotal.toFixed(2)}</Typography>
                        <Typography>VAT: {vatTotal.toFixed(2)}</Typography>
                        <Typography variant="h6" color="primary">
                            Grand Total: {grandTotal.toFixed(2)}
                        </Typography>
                    </Box>
                </Paper>

                {/* ================= Additional ================= */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography fontWeight={600} mb={2}>
                        Additional Information
                    </Typography>

                    <Box display="grid" gridTemplateColumns="repeat(2,1fr)" gap={2}>
                        <Controller
                            name="paymentTerms"
                            control={control}
                            render={({field}) => (
                                <TextField {...field} label="Payment Terms" disabled/>
                            )}
                        />

                        <Controller
                            name="deliveryTime"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Delivery Date"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                />
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Additional Notes"
                                    multiline
                                    rows={3}
                                    sx={{gridColumn: '1 / -1'}}
                                />
                            )}
                        />
                    </Box>
                </Paper>

                {/* ================= Signature ================= */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography fontWeight={600} mb={2}>
                        Signature
                    </Typography>

                    <Controller
                        name="signature"
                        control={control}
                        rules={{required: 'Signature is required'}}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                label="Signed By (Full Name)"
                                placeholder="Enter your full legal name"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                fullWidth
                            />
                        )}
                    />

                    <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        By typing your name, you confirm this quotation is legally binding.
                    </Typography>
                </Paper>


                {/* ================= Confirm ================= */}
                <Paper sx={{p: 2, mb: 3}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={accepted}
                                onChange={e => setAccepted(e.target.checked)}
                            />
                        }
                        label="I confirm that all information provided is accurate and binding"
                    />
                </Paper>

                <Box textAlign="right">
                    {/*<Button*/}
                    {/*    type="submit"*/}
                    {/*    variant="contained"*/}
                    {/*    size="large"*/}
                    {/*    disabled={!accepted || submitting}*/}
                    {/*>*/}
                    {/*    {submitting ? 'Submitting...' : 'Submit Quotation'}*/}
                    {/*</Button>*/}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={
                            !accepted ||
                            submitting ||
                            formState !== 'editable'
                        }
                    >
                        {submitting ? 'Submitting...' : 'Submit Quotation'}
                    </Button>

                </Box>
            </form>
        </Box>
    );
}
