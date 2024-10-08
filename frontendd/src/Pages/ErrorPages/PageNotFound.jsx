import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url(/src/Pages/Customers/SingleProdCheckout/shopGraffiti.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
        color: 'black',
      }}
    >
      <Box>
        <Typography variant="h1" sx={{ fontFamily: 'Kanit', fontSize: { xs: 100, md: 250 }, fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ fontFamily: 'Kanit', mb: 4 }}>
          It looks like you're lost, going through this page is a mystery...
          <br />
          But don't worry, we'll help you find your way back.
          <br />
          Let's get you back on track and explore what you were looking for.
        </Typography>
        <Button
          fullWidth
          onClick={() => navigate('/home')}
          variant="contained"
          sx={{
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
            background: 'linear-gradient(to right, #414141, #000000)',
            mt: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 18, md: 25 },
              padding: 0.5,
              color: 'white',
            }}
          >
            GO HOME
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default PageNotFound;