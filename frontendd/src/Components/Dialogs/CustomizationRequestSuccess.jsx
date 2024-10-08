import React from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FilledButton } from '../UI/Buttons';
import { useNavigate } from 'react-router-dom';
import CustomizationOrderDetails from '../Tables/CustomizationOrderDetails';
import CustsomizationOrderInfo from '../Tables/CustomizationOrderInfo';

function CustomizationRequestSuccess({ onClose, timeStamp }) {

  const CartValidationSchema = Yup.object().shape({
    cart: Yup.string().required('Product quantity is required'),
  });

  const navigate = useNavigate();

  console.log(`Custom Prd Succs ${timeStamp}`);
  

  return (
    <div>
      <Formik
        initialValues={{ cart: '' }}
        validationSchema={CartValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log('Profile Form submitted:', values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
             <IconButton onClick={onClose }  sx={{ position: 'absolute', top: 0, right: 0 }}>
                    <CloseIcon />
              </IconButton>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ backgroundColor: '#F5F7F8', overflow: 'auto', padding: '2vh' }}
            >
              <Grid item xs={6} style={{ backgroundColor: '#F5F7F8', overflow: 'auto' }}>
                <Grid container spacing={0}>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sx={{
                        backgroundColor: '#F5F7F8',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Kanit',
                          fontSize: { xs: 20, sm: 40 },
                          fontWeight: 'bold',
                          color: 'BLACK',
                          textAlign: 'center',
                        }}
                      >
                      REQUEST INFO
                      </Typography>
                      <CustsomizationOrderInfo timeStamp={timeStamp}/>
                      <Typography
                        sx={{
                          fontFamily: 'Kanit',
                          fontSize: { xs: 20, sm: 40 },
                          fontWeight: 'bold',
                          color: 'BLACK',
                          textAlign: 'center',
                          pt: 2,
                        }}
                      >
                        REQUEST DETAILS
                      </Typography>
                      <CustomizationOrderDetails timeStamp={timeStamp}/>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                      backgroundColor: '#F5F7F8',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '2vh',
                    }}
                  >
                    <img
                      src="/public/assets/success.svg"
                      width="70%"
                      maxWidth={600}
                      height="auto"
                      alt="Success"
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Inter',
                        fontSize: { xs: 15, sm: 25 },
                        fontWeight: '1000',
                        color: '#1E7F1C',
                        paddingY: '1vh',
                      }}
                    >
                      THANK YOU! <br /> Your request has been received!
                    </Typography>

                    <FilledButton
                       onClick={() => {
                        navigate('/shop')
                      }}
                      sx={{ marginTop: '1vh' }}
                    >
                      BACK
                    </FilledButton>
                    </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default CustomizationRequestSuccess;