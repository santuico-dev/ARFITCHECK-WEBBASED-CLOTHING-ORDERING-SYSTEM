import React from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';
import CloseIcon from '@mui/icons-material/Close';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const ViewCancelOrderRequest = ({ open, onClose, zIndex, orderInfo, orderID, fetchOrders }) => {

    const reasonValidationSchema = Yup.object().shape({
        selectedReason: Yup.string().required('Reason is required')
    });

    const handleApproveCancelRequest = async (cancellationInfo, orderType) => {
        try {

            const cancelOrderData = {
                orderID: orderID,
                orderType: orderType,
                cancelReason: '', //since di naman to galing sa s.admin / admin
                associatedOrderID: orderID
            }

            Swal.fire({
                title: "Are you sure you want to approve this request?",
                text: "Approving this request means that you agreed in the request to cancel this order and it will reflect on the user end. If the payment method is E-wallet kindly process the refund immediately.",
                icon: "question",
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#414a4c',
                confirmButtonText: "Yes",
            }).then((result) => {
                if (result.isConfirmed) {

                    //call the function for sending the request to the db
                    handleApproveCancel(cancelOrderData);
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    const handleRejectRequest = () => {
        try {

            Swal.fire({
                title: "Are you sure you want to reject this request?",
                text: "Rejecting this request will reflect on the users-end and notify them. These changes cannot be revoked.",
                icon: "question",
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#414a4c',
                confirmButtonText: "Yes",
            }).then((result) => {
                if (result.isConfirmed) {

                    handleRejectCancel(orderID)
              
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    const handleApproveCancel =  async (cancelOrderData) => {
        try {
            await axiosClient.post('order/updateOrder', cancelOrderData)
            .then(({  }) => {

                toast.success(`Approved! Order has been updated.`, {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    onClose: () => {
                        fetchOrders();
                        onClose();
                    },
                    style: { fontFamily: 'Kanit', fontSize: '16px' }
                });
            });
            
        } catch (error) {
            console.log(error);
        }
    }

    const handleRejectCancel = async (orderID) => {

        const rejectCancelData = {
            orderID: orderID,
            associatedOrderID: orderID
        };

        try {

            await axiosClient.post('/order/rejectCancelRequest', rejectCancelData)
            .then(( {} ) => {

                toast.success(`Order has been updated!.`, {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    onClose: () => {

                        fetchOrders();
                        onClose();
                    },
                    style: { fontFamily: 'Kanit', fontSize: '16px' }
                });

            });
            
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }} fullWidth maxWidth="md">
                <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                        CANCEL ORDER REQUEST
                    </Typography>
                    <CloseIcon onClick={onClose} sx={{ cursor: 'pointer' }} />
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Formik
                        initialValues={{ selectedReason: '', additionalInfo: '' }}
                        validationSchema={reasonValidationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, isValid, values }) => (
                            <Form>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 38 }}>
                                    Order Info:
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Order ID:</b> {orderID}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Product(s): </b> {orderInfo.productName}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Total: </b> ₱{(orderInfo.amountToPay).toFixed(2)}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Order Date and Time:</b> {orderInfo.orderDate} {orderInfo.orderTimeStamp}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Payment Method:</b> {orderInfo?.paymentMethod === 'cash' ? 'Cash' : 'E-Wallet' || 'None'}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Mobile No.:</b> {orderInfo?.mobileNumber|| 'NaN'}
                                </Typography>
                                <Divider sx={{ my: 2, backgroundColorL: 'black' }} />
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', color: 'gray' }}>
                                    A user wants to request for a cancellation of his/her order due to the following reason:
                                </Typography>
                                <TextField
                                    id="userCancelReason"
                                    name="userCancelReason"
                                    label="Reason for Cancellation"
                                    fullWidth
                                    variant="outlined"
                                    value={orderInfo?.userCancelReason || ''}
                                    disabled
                                    sx={{ my: 1, fontFamily: 'Kanit', fontWeight: 'bold'}}
                                />
                                <TextField
                                    id="userCancelReasonAdditional"
                                    name="userCancelReasonAdditional"
                                    label="Additional Information"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    value={orderInfo?.userCancelReasonAdditional || 'None'}
                                    disabled
                                    sx={{ my: 2, fontFamily: 'Kanit' }}
                                />
                                <DialogActions>
                                      <Button 
                                        sx={{ color: 'red' }}   
                                        disabled={isSubmitting || !isValid}
                                        onClick={() => handleRejectRequest()}
                                        
                                      >
                                        Reject
                                    </Button>
                                    <Button
                                        type='submit'
                                        sx={{ color: 'black' }}
                                        disabled={isSubmitting || !isValid}
                                        onClick={() => handleApproveCancelRequest(values, 'Cancel')}
                                    >
                                        Approve
                                    </Button>
                                 
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
            <ToastContainer />
        </div>
    )
}

export default ViewCancelOrderRequest;