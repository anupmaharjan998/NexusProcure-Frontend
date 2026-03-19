import {useEffect, useState} from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";

import {useParams, useNavigate} from "react-router-dom";
import {DashboardLayout} from "../../components/Layout/DashboardLayout";
import {getPurchaseOrder} from "../../services/purchaseOrderService";

export default function PurchaseOrderDetailsPage() {

    const {id} = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>();

    useEffect(() => {

        if (!id) return;

        getPurchaseOrder(id).then(setOrder);

    }, [id]);

    if (!order) return null;

    return (

        <DashboardLayout>

            <Box>

                <Button
                    onClick={() => navigate("/procurement/purchase-orders")}
                    sx={{mb: 2}}
                >
                    Back to Purchase Orders
                </Button>


                {/* HEADER */}

                <Card sx={{mb: 3}}>
                    <CardContent>

                        <Typography variant="h5" fontWeight={700}>
                            Purchase Order
                        </Typography>

                        <Typography color="text.secondary">
                            PO Number: {order.poNumber}
                        </Typography>

                        <Box mt={1} display="flex" gap={1}>
                            <Chip label={order.status} color="primary"/>
                            <Chip label={order.deliveryStatus}/>
                        </Box>

                    </CardContent>
                </Card>


                {/* REQUISITION + DELIVERY */}

                <Grid container spacing={2} mb={3}>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Requisition
                                </Typography>
                                <Typography fontWeight={600}>
                                    {order.reqNumber}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>


                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Quotation Reference
                                </Typography>
                                <Typography fontWeight={600}>
                                    {order.quotationReference}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>


                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Expected Delivery
                                </Typography>
                                <Typography fontWeight={600}>
                                    {order.deliveryDate}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>


                {/* VENDOR INFORMATION */}

                <Card sx={{mb: 3}}>
                    <CardContent>

                        <Typography variant="h6" mb={2}>
                            Vendor Information
                        </Typography>

                        <Grid container spacing={2}>

                            <Grid item xs={12} md={6}>
                                <Typography fontWeight={600}>
                                    {order.vendorName}
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.vendorEmail}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography color="text.secondary">
                                    Phone: {order.vendorPhoneNumber}
                                </Typography>

                                <Typography color="text.secondary">
                                    Address: {order.vendorAddress}
                                </Typography>
                            </Grid>

                        </Grid>

                    </CardContent>
                </Card>


                {/* ORDER ITEMS + FINANCIAL */}

                <Card sx={{mb: 3}}>
                    <CardContent>

                        <Typography variant="h6" mb={2}>
                            Order Items
                        </Typography>

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>#</TableCell>
                                    <TableCell>Item</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Tax %</TableCell>
                                    <TableCell align="right">Tax Amount</TableCell>
                                    <TableCell align="right">Line Total</TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {order.items?.map((item: any, i: number) => {

                                    const base = item.quantity * item.unitPrice;

                                    const taxPercent = item.taxPercentage ?? 0;

                                    const taxAmount = base * taxPercent / 100;

                                    return (

                                        <TableRow key={i}>

                                            <TableCell>{i + 1}</TableCell>

                                            <TableCell>

                                                <Typography fontWeight={600}>
                                                    {item.itemName}
                                                </Typography>

                                            </TableCell>

                                            <TableCell align="right">
                                                {item.quantity}
                                            </TableCell>

                                            <TableCell align="right">
                                                ${item.unitPrice.toLocaleString()}
                                            </TableCell>

                                            <TableCell align="right">
                                                {taxPercent}%
                                            </TableCell>

                                            <TableCell align="right">
                                                ${taxAmount.toFixed(2)}
                                            </TableCell>

                                            <TableCell align="right">
                                                ${item.lineTotal.toFixed(2)}
                                            </TableCell>

                                        </TableRow>

                                    )

                                })}

                            </TableBody>

                        </Table>


                        <Grid container>




                            <Grid item xs={6}>
                                <Typography fontWeight={700}>
                                    Grand Total
                                </Typography>
                            </Grid>

                            <Grid item xs={6} textAlign="right">
                                <Typography fontWeight={700} color="primary">
                                    ${order.totalAmount}
                                </Typography>
                            </Grid>

                        </Grid>

                    </CardContent>
                </Card>


                {/* PAYMENT + DELIVERY TERMS */}

                <Grid container spacing={2} mb={3}>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>

                                <Typography fontWeight={600}>
                                    Payment Terms
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.paymentTerms}
                                </Typography>

                            </CardContent>
                        </Card>
                    </Grid>


                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>

                                <Typography fontWeight={600}>
                                    Delivery Terms
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.deliveryTerms}
                                </Typography>

                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>


                {/* SPECIAL INSTRUCTIONS */}

                <Card sx={{mb: 2}}>
                    <CardContent>

                        <Typography fontWeight={600}>
                            Special Instructions
                        </Typography>

                        <Typography color="text.secondary">
                            {order.specialInstructions}
                        </Typography>

                    </CardContent>
                </Card>


                {/* INTERNAL NOTES */}

                {/*<Card*/}
                {/*    sx={{*/}
                {/*        mb: 2,*/}
                {/*        border: "1px solid #f1c40f",*/}
                {/*        background: "#fffbea"*/}
                {/*    }}*/}
                {/*>*/}

                {/*    <CardContent>*/}

                {/*        <Typography fontWeight={600} color="#9a6c00">*/}
                {/*            Internal Notes (Not visible to vendor)*/}
                {/*        </Typography>*/}

                {/*        <Typography color="#9a6c00">*/}
                {/*            {order.internalNotes}*/}
                {/*        </Typography>*/}

                {/*    </CardContent>*/}

                {/*</Card>*/}


                {/* APPROVAL DETAILS */}

                <Card>
                    <CardContent>

                        <Typography fontWeight={600} mb={2}>
                            Approval & Issuance Details
                        </Typography>

                        <Grid container spacing={2}>

                            <Grid item xs={12} md={6}>

                                <Typography variant="body2" color="text.secondary">
                                    Approved By
                                </Typography>

                                <Typography fontWeight={600}>
                                    {order.approvedBy}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {order.approvedDate}
                                </Typography>

                            </Grid>


                            <Grid item xs={12} md={6}>

                                <Typography variant="body2" color="text.secondary">
                                    Issued By
                                </Typography>

                                <Typography fontWeight={600}>
                                    {order.issuedBy}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {order.issuedDate}
                                </Typography>

                            </Grid>

                        </Grid>

                    </CardContent>
                </Card>


            </Box>

        </DashboardLayout>

    );

}