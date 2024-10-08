import React, { useEffect, useState } from 'react';
import { RadioGroup, Typography, Grid, Box, FormControlLabel, Radio, Button, MenuItem , Paper, Checkbox, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Dialog, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import axiosClient from '../../../axios-client';
import { Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {  Visibility } from '@mui/icons-material'; 
import { Form, Field, useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup'
import Swal from 'sweetalert2'

import { ToastContainer, toast, Bounce} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCookies } from 'react-cookie';
import StyledTextFields from '../../../Components/UI/TextFields';
import PreLoader from '../../../Components/PreLoader';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutTermsAndConditions from '../../../Components/Dialogs/CheckoutTermsAndConditions';
import Navbar from '../../../Widgets/Navbar';
import Footer from '../../../Components/Footer';
import ViewCustomProductDetails from '../../../Components/Dialogs/ViewCustomProductDetails';
import CustomizationRequestSuccess from '../../../Components/Dialogs/CustomizationRequestSuccess';
import { useCart } from '../../../ContextAPI/CartProvider';

const provinceOptions = ['Metro Manila'];

// TODO: REVISE THE EULA AND TRY TO MAKE THE USER NOT COMEBACK IN THIS PAGE ONCE ORDERED

//utility function for creating a filename to avoid duplicated product name in the fb storage
const generateFileName = (customImageName) => {
  const getTimeStamp = new Date().getTime();
  return `${customImageName}_${getTimeStamp}.jpg`;
}

function CustomProductRequest() {

  const { productID, customizedProductImageURL, smallQnt, mediumQnt, largeQnt, extraLargeQnt, doubleXLQnt, tripleXLQnt, customPrice } = useParams();
  const [customImageFile, setCustomImageFile] = useState(null);

  const [cookie, setCookie, remove] = useCookies([
    '?id',
    '?priceFromMobile',
    '?customizedImageURL',
    '?smallQnt',
    '?mediumQnt',
    '?largeQnt',
    '?extraLargeQnt',
    '?doubleXLQnt',
    '?tripleXLQnt',
    '?doneCustomCheckOut'
  ]);

  const [orderDetails, setOrderDetails] = useState([]);
  const [shippingDetails, setShippingDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [quantity, setQuantity] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderTimeStamp, setOrderTimeStamp] = useState('');

  const [loading, setLoading] = useState(true);
  const [enablePlaceOrder, setEnablePlaceOrder] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [enableAllFields, setEnableAllFields] = useState(false);
  const [dialoOpen, isDialogOpen] = useState(false)
  const [customProductDetailsDialog, setCustomProductDetailsDialog] = useState(false)

  //terms and condition stuff
  const [isEulaChecked, setEulaChecked] = useState(false)
  const [termsAndConditionDialogOpen, setTermsnAndConditionDialog] = useState(false)

  const navigate = useNavigate()

  const { updateCartWhenCheckedOutSuccess } = useCart();
  

  const ShippingValidationSchema = Yup.object().shape({
    recipientName: enableAllFields ? Yup.string().required('Recipient Name is required') : Yup.string(),
    email: enableAllFields ? Yup.string().required('Email is required') : Yup.string(),
    address: enableAllFields ? Yup.string().required('Address is required') : Yup.string(),
    province: enableAllFields ? Yup.string().required('Province is required') : Yup.string(),
    city: enableAllFields ? Yup.string().required('City is required') : Yup.string(),
    postalCode: enableAllFields ? Yup.string().required('Postal Code is required') : Yup.string(),
    orderNotes: Yup.string(),
  }).nullable();

  function isValidBase64(base64String) {
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(base64String) && base64String.length % 4 === 0;
  }
  const formik = useFormik({
    initialValues: {
      recipientName: '',
      email: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      orderNotes: '',
    },
    validationSchema: ShippingValidationSchema,
    onSubmit:(values) => {

      Swal.fire({
        title: "REMINDER",
        text: "Your request will be reviewed and processed within 3 business days. An email will be sent to you once your request has been processed.",
        icon: "info",
        showCancelButton: true,
        cancelButtonText: 'Close',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "I understand, proceed",

    }).then( async (result) => {
        if (result.isConfirmed) {
            try {
              setSubmitLoading(true)
              if(isValidBase64(customizedProductImageURL)){

                setOrderTimeStamp(new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: '2-digit', minute: '2-digit', hour12: true}))

                if(enableAllFields == true) {

                  const newShippingValues = new FormData();
                    newShippingValues.append('recipientName', values.recipientName);
                    newShippingValues.append('email', values.email);
                    newShippingValues.append('city', values.city);
                    newShippingValues.append('barangay', shippingDetails.barangay);
                    newShippingValues.append('address', values.address);
                    newShippingValues.append('province', values.province);
                    newShippingValues.append('postalCode', values.postalCode);
                    newShippingValues.append('orderNotes', values.orderNotes);
                    newShippingValues.append('paymentMethod', paymentMethod === 'gcash' || paymentMethod === 'paymaya' ? 'ewallet' : 'cash');
                    newShippingValues.append('selectedEwallet', paymentMethod === 'gcash' ? 'gcash' : 'paymaya');
                    newShippingValues.append('amountToPay', customPrice);
                    newShippingValues.append('uid', cookie['?id']);
                    newShippingValues.append('orderType', 'custom');
                    newShippingValues.append('receiptFile', 'None');
  
                    newShippingValues.append('customImageFile', customImageFile);
                    newShippingValues.append('smallQnt', parseInt(smallQnt));
                    newShippingValues.append('mediumQnt', parseInt(mediumQnt));
                    newShippingValues.append('largeQnt', parseInt(largeQnt));
                    newShippingValues.append('extraLargeQnt', parseInt(extraLargeQnt));
                    newShippingValues.append('doubleXLQnt', parseInt(doubleXLQnt));
                    newShippingValues.append('tripleXLQnt', parseInt(tripleXLQnt));
                    
                    newShippingValues.append('productID', productID); 
  
                    await axiosClient.post('custom/insertCustomizePrdRequest', newShippingValues);
                    setTimeout(() => {
  
                      isDialogOpen(true)
                      setSubmitLoading(false)
                      updateCartWhenCheckedOutSuccess();
  
                    }, 1500);

                    const expirationDate = new Date();
                    expirationDate.setTime(expirationDate.getTime() + 15 * 60 * 1000);

                    setCookie("?doneCustomCheckOut", true, { path: "/", expires: expirationDate });
  
                }else {
  
                  const dbValues = new FormData();
                    dbValues.append('recipientName', userDetails.firstName + ' ' + userDetails.lastName);
                    dbValues.append('email', userDetails.email);
                    dbValues.append('city', shippingDetails.city);
                    dbValues.append('barangay', shippingDetails.barangay);
                    dbValues.append('address', shippingDetails.addressLine);
                    dbValues.append('province', shippingDetails.province);
                    dbValues.append('postalCode', shippingDetails.postalCode);
                    dbValues.append('orderNotes', values.orderNotes);
                    dbValues.append('paymentMethod', paymentMethod === 'gcash' || paymentMethod === 'paymaya' ? 'ewallet' : 'cash');
                    dbValues.append('selectedEwallet', paymentMethod === 'gcash' ? 'gcash' : 'paymaya');
                    dbValues.append('amountToPay', customPrice);
                    dbValues.append('uid', cookie['?id']);
                    dbValues.append('orderType', 'custom');
                    dbValues.append('receiptFile', 'None');
                
                    dbValues.append('customImageFile', customImageFile);
                    dbValues.append('smallQnt', parseInt(smallQnt));
                    dbValues.append('mediumQnt', parseInt(mediumQnt));
                    dbValues.append('largeQnt', parseInt(largeQnt));
                    dbValues.append('extraLargeQnt', parseInt(extraLargeQnt));
                    dbValues.append('doubleXLQnt', parseInt(doubleXLQnt));
                    dbValues.append('tripleXLQnt', parseInt(tripleXLQnt));
  
                    dbValues.append('productID', productID);
  
                    await axiosClient.post('custom/insertCustomizePrdRequest', dbValues);
                    setTimeout(() => {
  
                      updateCartWhenCheckedOutSuccess();
                      setSubmitLoading(false)
                      isDialogOpen(true)

  
                    }, 1500);

                    const expirationDate = new Date();
                    expirationDate.setTime(expirationDate.getTime() + 15 * 60 * 1000);

                    setCookie("?doneCustomCheckOut", true, { path: "/", expires: expirationDate });
                }
              }else {
                setSubmitLoading(false)

                toast.error("Invalid Custom Image URL", {
                  position: "top-right",
                  autoClose: 1500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  style: { fontFamily: 'Kanit', fontSize: '16px' }
                });
              }
              
            } catch (error) {
              console.log(error);
            }

        }
      });
    },
  });

  const handleOpenCustomProductDetails = () => {
    setCustomProductDetailsDialog(true)
  }

  const handleCloseCustomProductDetails = () => {
    setCustomProductDetailsDialog(false)
  }

  const handleDialogClose =() => {
    isDialogOpen(false)
    navigate('/shop')
  }
  //---------------
  useEffect(() => {

    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 3 * 60 * 1000); //3 mins

    if(cookie['?doneCustomCheckOut']){
      navigate(`/shop`)
    }else if (
      !cookie['?priceFromMobile'] && 
      !cookie['?smallQnt'] && 
      !cookie['?mediumQnt'] && 
      !cookie['?largeQnt'] && 
      !cookie['?extraLargeQnt'] && 
      !cookie['?doubleXLQnt'] && 
      !cookie['?tripleXLQnt']
    ) {
      setCookie("?priceFromMobile", customPrice, { path: "/", expires: expirationDate });
      setCookie("?smallQnt", smallQnt, { path: "/", expires: expirationDate });
      setCookie("?mediumQnt", mediumQnt, { path: "/", expires: expirationDate });
      setCookie("?largeQnt", largeQnt, { path: "/", expires: expirationDate });
      setCookie("?extraLargeQnt", extraLargeQnt, { path: "/", expires: expirationDate });
      setCookie("?doubleXLQnt", doubleXLQnt, { path: "/", expires: expirationDate });
      setCookie("?tripleXLQnt", tripleXLQnt, { path: "/", expires: expirationDate });
      
    }else {
      // do nothing
    }

    if (
      parseInt(customPrice, 10) !== parseInt(cookie['?priceFromMobile'], 10) || 
      parseInt(smallQnt, 10) !== parseInt(cookie['?smallQnt'], 10) || 
      parseInt(mediumQnt, 10) !== parseInt(cookie['?mediumQnt'], 10) || 
      parseInt(largeQnt, 10) !== parseInt(cookie['?largeQnt'], 10) || 
      parseInt(extraLargeQnt, 10) !== parseInt(cookie['?extraLargeQnt'], 10) || 
      parseInt(doubleXLQnt, 10) !== parseInt(cookie['?doubleXLQnt'], 10) || 
      parseInt(tripleXLQnt, 10) !== parseInt(cookie['?tripleXLQnt'], 10)
    ) {
      navigate(`/customizedSingleProduct/${productID}/${encodeURIComponent(customizedProductImageURL)}/${cookie['?smallQnt']}/${cookie['?mediumQnt']}/${cookie['?largeQnt']}/${cookie['?extraLargeQnt']}/${cookie['?doubleXLQnt']}/${cookie['?tripleXLQnt']}/${cookie['?priceFromMobile']}`);
    }

    //get the sum of the quantity per size
    const sumOfQnt = parseInt(smallQnt) + parseInt(mediumQnt) + parseInt(largeQnt) + parseInt(extraLargeQnt) + parseInt(doubleXLQnt) + parseInt(tripleXLQnt);
    setQuantity(sumOfQnt)

    //check if there is a customized image url passed in as params
    if(customizedProductImageURL){
      const customImageFileName = generateFileName("customImage");
      const convertUrlIntoFile = convertBase64ToFile(decodeURIComponent(customizedProductImageURL), customImageFileName);

      setCustomImageFile(convertUrlIntoFile);
    }

    fetchOrderDetails();
  }, [productID, customizedProductImageURL, smallQnt, mediumQnt, largeQnt, extraLargeQnt, doubleXLQnt, tripleXLQnt, quantity, customPrice]);

  //converter function from base64 string url into file path so I can pass it in as request in the backend
  const convertBase64ToFile = (base64String, fileName) => {

    try {

      const byteString = atob(base64String);

      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([uintArray], { type: 'image/jpeg' }); 
      return new File([blob], fileName, { type: 'image/jpeg' });

    }catch(error) {
      navigate('/urlErr')
    }
    
  };

  const fetchOrderDetails = async () => {
    try {

      const orderDetails = await axiosClient.get(`prd/fetchProductByID/${productID}`)
      const shippingDetailsResponse = await axiosClient.get(`auth/getMyAddress/${cookie['?id']}`);
      const userDetailsResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);

      if (shippingDetailsResponse.data && userDetailsResponse.data && orderDetails.data && orderDetails.data.length > 0) {
        setShippingDetails(shippingDetailsResponse.data);
        setUserDetails(userDetailsResponse.data);
        setOrderDetails(orderDetails.data)

        setLoading(false)
      }else {
        setLoading(false)
        // navigate('/shop')
        // console.log('tae');
        
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  
    setEnablePlaceOrder(false);
    setEulaChecked(false)

  };
  
  //terms and conditions
  const handleEulaChecked = (event) => {
    setEulaChecked(event.target.checked);
    
    if (event.target.checked && paymentMethod != '') {
      setEnablePlaceOrder(true);
    } else {
      setEnablePlaceOrder(false);
    }
  };

  const handleAgree = () => {
    setEulaChecked(true);
    setTermsnAndConditionDialog(false);
  };

  //tersm and condition dialog
  const handleTermsAndCondiDialogOpen = () => {
    setTermsnAndConditionDialog(true)
  }

  const handleTermsAndCondiDialogClose = () => {
    setTermsnAndConditionDialog(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      {loading ? (
        <PreLoader/>
      ) : (
        <>
        <Navbar />
          <Grid container  sx={{ pt: '5vh', minHeight: 0, flex: '1', overflowX: 'hidden' }}>
            <Grid item xs={12} md={7} sx={{
                backgroundImage: 'url(/public/assets/shopGraffiti.png)',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto'
            }}>
              <Box sx={{ m: "auto", p: { xs: 2, md: 3 } }}>
                <Paper elevation={0} sx={{
                  borderRadius: '16px',
                  p: 3,
                  width: '98%',
                  margin: 'auto',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <FormikProvider value={formik}>
                    <Form>
                      <Typography sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs:25, md: 30 },
                        fontWeight: 'bold',
                        color: 'black',
                        paddingY: { xs:0, md: "1vh" },
                        textAlign: "left"
                      }}>
                        {enableAllFields ? 'SHIPPING DETAILS' : 'BILLING DETAILS'}
                      </Typography>
                      <Divider sx={{ my: 2, backgroundColor: 'black' }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Field name="recipientName">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{
                                  ...field,
                                  value: !enableAllFields ? `${userDetails.firstName} ${userDetails.lastName}` : field.value
                                }}
                                meta={meta}
                                id="recipientName"
                                label="Recipient"
                                disabled={!enableAllFields}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field name="email">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{
                                  ...field,
                                  value: !enableAllFields ? `${userDetails.email}` : field.value
                                }}
                                meta={meta}
                                id="email"
                                label="Email"
                                disabled={!enableAllFields}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12}>
                          <Field name="province">
                            {({ field, meta }) => (
                              <FormControl fullWidth variant="filled">
                                <InputLabel htmlFor="province" sx={{ fontFamily: 'Kanit' }}>Province</InputLabel>
                                <Select
                                  {...field}
                                  inputProps={{ id: 'province' }}
                                  value={enableAllFields ? '' : 'Metro Manila'}
                                  fullWidth
                                  error={meta.touched && meta.error}
                                  disabled={!enableAllFields}
                                >
                                  {provinceOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'black' }}>
                                        {option}
                                      </Typography>
                                    </MenuItem>
                                  ))}
                                </Select>
                                {meta.touched && meta.error && (
                                  <FormHelperText error>{meta.error}</FormHelperText>
                                )}
                              </FormControl>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12}>
                          <Field name="address">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{
                                  ...field,
                                  value: !enableAllFields ? `${shippingDetails.addressLine}` : field.value
                                }}
                                meta={meta}
                                id="address"
                                label="Address Line"
                                disabled={!enableAllFields}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12}>
                          <Field name="city">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{
                                  ...field,
                                  value: !enableAllFields ? `${shippingDetails.city}` : field.value
                                }}
                                meta={meta}
                                id="city"
                                label="City"
                                disabled={!enableAllFields}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field name="postalCode">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{
                                  ...field,
                                  value: !enableAllFields ? `${shippingDetails.postalCode}` : field.value
                                }}
                                meta={meta}
                                id="postalCode"
                                label="Postal Code"
                                disabled={!enableAllFields}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field name="orderNotes">
                            {({ field, meta }) => (
                              <StyledTextFields
                                field={{ ...field }}
                                meta={meta}
                                id="orderNotes"
                                label="Order Notes (optional)"
                                multiline
                                rows={4}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={enableAllFields}
                                onChange={(e) => setEnableAllFields(e.target.checked)}
                                color="primary"
                                size="small"
                                sx={{ transform: 'scale(0.9)' }}
                              />
                            }
                            label={<Typography variant="body2">Ship to different address?</Typography>}
                          />
                        </Grid>
                      </Grid>
                    </Form>
                  </FormikProvider>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{
                  backgroundColor: '#F5F7F8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: 'auto'
              }}>
              <Grid
                  item
                  sx={{
                      background: "linear-gradient(to right, #414141, #000000)",
                      flex: "0 0 auto",
                      width: "100%",
                  }}
              >
              <Box sx={{ m: "5%" }}>
                  <Grid container justifyContent="space-between" alignItems="center">
                  <Typography
                      sx={{
                      fontFamily: "Kanit",
                      fontSize: { xs: 25, md: 30 },
                      fontWeight: "bold",
                      color: "WHITE",
                      }}
                  >
                      CUSTOMIZED PRODUCT DETAILS
                  </Typography>
                      <Box
                          sx={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              color: "white",
                          }}
                          onClick={handleOpenCustomProductDetails} 
                      >
                          <Visibility sx={{ fontSize: 20, marginRight: "4px" }} />
                          <Typography
                              sx={{
                                  fontFamily: "Kanit",
                                  fontSize: 15,
                                  fontWeight: "bold",
                                  color: "WHITE",
                              }}
                          >
                          VIEW CUSTOM PRD.
                          </Typography>
                      </Box>
                  </Grid>
                  <Grid container justifyContent="space-between" alignItems="center">
                  <Typography
                      sx={{ fontFamily: "Kanit", fontSize: 25, fontWeight: "bold", color: "WHITE" }}
                  >
                      Product(s)
                  </Typography>
                  <Typography
                      sx={{ fontFamily: "Kanit", fontSize: 25, fontWeight: "bold", color: "WHITE" }}
                  >
                      {/* Total */}
                  </Typography>
                  </Grid>
                  <Grid container justifyContent="space-between" alignItems="center">
                  {orderDetails.length > 0 ? (
                      orderDetails.map((cartItem) => (
                      <React.Fragment key={cartItem.productId}>
                          <Grid container justifyContent="space-between" alignItems="center">
                          <Grid item xs={6}>
                              <Typography
                              sx={{
                                  fontFamily: "Inter",
                                  fontSize: 20,
                                  fontWeight: "regular",
                                  color: "WHITE",
                              }}
                              >
                              {cartItem.productName} x{quantity}
                              </Typography>
                          </Grid>
                          <Grid item xs={6} textAlign="right">
                              <Typography
                              sx={{
                                  fontFamily: "Inter",
                                  fontSize: 20,
                                  fontWeight: "regular",
                                  color: "WHITE",
                              }}
                              >
                              ₱{parseInt(customPrice).toFixed(2)}
                              </Typography>
                          </Grid>
                          </Grid>
                      </React.Fragment>
                      ))
                  ) : (
                      <>
                      <Typography
                          sx={{
                          fontFamily: "Inter",
                          fontSize: 20,
                          fontWeight: "regular",
                          color: "WHITE",
                          }}
                      >
                          -
                      </Typography>
                      <Typography
                          sx={{
                          fontFamily: "Inter",
                          fontSize: 20,
                          fontWeight: "regular",
                          color: "WHITE",
                          textAlign: "right",
                          }}
                      >
                          ₱0
                      </Typography>
                      </>
                  )}
                  </Grid>
              
              <Box sx={{ height: "16px" }} />
                  <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item sx={{ width: "50%" }}>
                          <Typography
                              sx={{ fontFamily: "Inter", fontSize: 20, fontWeight: "regular", color: "WHITE" }}
                          >
                          Subtotal
                          </Typography>
                          <Typography
                          sx={{ fontFamily: "Inter", fontSize: 20, fontWeight: "regular", color: "WHITE" }}
                          >
                          Shipping Fee
                          </Typography>
                          <Divider
                              sx={{
                                  backgroundColor: "white",
                                  marginTop: "8px",
                                  width: "80vh",
                                  marginBottom: "10px",
                              }}
                          />
                          <Typography
                            sx={{ fontFamily: "Kanit", fontSize: 30, fontWeight: "bold", color: "WHITE" }}
                          >
                          Total
                          </Typography>
                      </Grid>
                      <Grid item sx={{ width: "50%", textAlign: "right" }}>
                          <Typography
                              sx={{ fontFamily: "Inter", fontSize: 20, fontWeight: "regular", color: "WHITE" }}
                          >
                          ₱{parseInt(customPrice).toFixed(2)}
                          </Typography>
                          <Typography
                              sx={{ fontFamily: "Inter", fontSize: 20, fontWeight: "regular", color: "WHITE" }}
                          >
                          ₱100.00
                          </Typography>
                          <Typography
                              sx={{
                                  fontFamily: "Inter",
                                  fontSize: 25,
                                  fontWeight: "bold",
                                  color: "WHITE",
                                  marginTop: "17px",
                              }}
                          >
                          ₱{(parseInt(customPrice) + 100).toFixed(2)}
                          </Typography>
                      </Grid>
                  </Grid>
              </Box>
              </Grid>
              <Grid item sx={{
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <Box sx={{ m: "5%" }}>
                <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 25, md: 30 }, fontWeight: 'bold', color: 'black' }}>
                          PAYMENT METHOD <br />
                          <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 12, md: 20 }, fontWeight: '300', color: 'black' }}>
                          This payment method will be used once your customized product is <span style={{ textDecoration: 'underline' }}><b>approved</b></span>.
                          </Typography>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails >
                        <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontFamily: 'Kanit' }}>G-cash</Typography>
                            <Box>
                            <Radio
                                value="gcash"
                                name="radio-buttons"
                                inputProps={{ 'aria-label': 'gcash' }}
                            /></Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontFamily: 'Kanit' }}>Paymaya</Typography>
                            <Box>
                            <Radio
                                value="paymaya"
                                name="radio-buttons"
                                inputProps={{ 'aria-label': 'paymaya' }}
                            /></Box>
                        </Box>
                        </RadioGroup>
                      </AccordionDetails>
                    </Accordion>
                    <FormControlLabel
                                control={<Checkbox checked={isEulaChecked} onChange={handleEulaChecked} sx={{ 
                                  transform: 'scale(0.8)' 
                                }} />}
                                label={
                                  <Typography sx={{ fontFamily: 'Inter', display: 'flex', alignItems: 'center', fontSize: 16 }}>
                                    I Agree with the&nbsp; 
                                    <span style={{ color: "#1A5276" }}>
                                      <b onClick={(event) => {
                                        event.preventDefault(); 
                                        handleTermsAndCondiDialogOpen();
                                      }}> Terms and Conditions</b>
                                    </span>
                                  </Typography>
                                }
                              sx={{ fontFamily: 'Kanit', fontSize: 16 }}
                              />
                              {/* Submit req button */}
                              <Button
                                fullWidth
                                onClick={formik.handleSubmit}
                                variant="contained"
                                disabled={!enablePlaceOrder}
                                sx={{
                                  backgroundColor: 'White',
                                  '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                                  opacity: enablePlaceOrder ? 1 : 0.5,
                                  background: 'linear-gradient(to right, #414141, #000000)'
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: { xs: 18, md: 25 },
                                    padding: 0.5,
                                    visibility: submitLoading ? 'hidden' : 'visible',
                                  }}
                                >
                                  SUBMIT REQUEST
                                </Typography>
                                {submitLoading && (
                                  <CircularProgress
                                    size={24}
                                    color="inherit"
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      marginTop: '-12px',
                                      marginLeft: '-12px',
                                    }}
                                  />
                                )}
                              </Button>
                          </Box>
                        </Grid>
            </Grid> 
          </Grid>
        <Footer/>
        {/* Dialogs */}
        <CheckoutTermsAndConditions open={termsAndConditionDialogOpen} onClose={handleTermsAndCondiDialogClose} onAgree={handleAgree}/>
        <ViewCustomProductDetails open={customProductDetailsDialog} onClose={handleCloseCustomProductDetails} customImage={customizedProductImageURL} smallQnt={smallQnt} mediumQnt={mediumQnt} largeQnt={largeQnt} extraLargeQnt={extraLargeQnt} doubleXLQnt={doubleXLQnt} tripleXLQnt={tripleXLQnt} />
        {/* jeon work */}
        <Dialog open={dialoOpen} onClose={handleDialogClose} maxWidth="xl" fullWidth PaperProps={{ style: { maxHeight: '100vh' } }}>
          <div>
            <CustomizationRequestSuccess onClose={handleDialogClose} timeStamp={orderTimeStamp}/>
          </div>
        </Dialog>
        </>
      )}
    </div>
  );
}

export default CustomProductRequest;