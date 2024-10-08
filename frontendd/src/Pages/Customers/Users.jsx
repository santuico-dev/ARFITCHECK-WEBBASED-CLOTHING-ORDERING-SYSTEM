import * as React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, Button, ListItemIcon, ListItemText,Badge, Toolbar,MenuItem, Menu, Typography, Popover} from '@mui/material';

//Components
import MyOrders from './MyOrders';
import OrderHistory from './OrderHistory';
import AccountSettings from './AccountSettings';
import ShippingDetails from './ShippingDetails';
import Footer from '../../Components/Footer';

//Backend 
import { useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';

//Icons
import {
  Shop as Shop2Icon,
  Build as BuildIcon,
  History as HistoryIcon,
  ManageAccounts as ManageAccountsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  ArrowBack,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useStateContext } from '../../ContextAPI/ContextAPI';
import MyCustomizationRequests from './MyCustomizationRequests';
import { ToastContainer } from 'react-toastify';
const drawerWidth = 240;

function Users(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchroEl] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState('My Orders');
  const [cookie, removeCookie, remove] = useCookies(['?sessiontoken', '?id'])
  const {setToken, setUserID, setRole} = useStateContext()
  const menuId = 'primary-search-account-menu';
  const navigator = useNavigate()

  //notifacation fetching
  const [notificationData, setNotificationData] = React.useState([]);
  const [notifCount, setNotifCount] = React.useState(0);
  //notification variables
  const openNotication = Boolean(notificationAnchorEl);
  const notificationID = open ? 'notification-popover' : undefined;

  React.useEffect(() => {
    fetchNotificationData()
  }, [])

  const fetchNotificationData = async () => {
    try {
      const notificationResponse = await axiosClient.get(`/auth/fetchMyNotifications/${cookie['?id']}`);
  
      if (notificationResponse.data) {
        const sortedData = notificationResponse.data.sort((a, b) => {
          const dateA = new Date(`${a.notificationDate} ${a.notificationTime}`);
          const dateB = new Date(`${b.notificationDate} ${b.notificationTime}`);
          return dateB - dateA; 
        });
        
        setNotificationData(sortedData)
  
        // Set notification count
        setNotifCount(sortedData.length);
      }
  
    } catch (error) {
      console.log(error);
    }
  };
  

  //notification panel
  const handleNotificationOpen = (event) => {
    setNotificationAnchroEl(event.currentTarget)
  }

  const handleNotificationClose = (event) => {
    setNotificationAnchroEl(null)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.patch(`/auth/updateAllNotifications/${cookie['?id']}`)
      fetchNotificationData();
    } catch (error) { 
      console.log(error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try{

      await axiosClient.delete(`/auth/deleteAllNotifications/${cookie['?id']}`)
      fetchNotificationData();
      
    }catch(error) {
      console.log(error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleListItemClick = (text) => {
    setSelectedItem(text);
    handleDrawerClose();
  };
  const iconMapping = {
    'My Orders': <Shop2Icon />,
    'Customization Request': <BuildIcon/>,
    'Order History': <HistoryIcon />,
    'Shipping Settings': <LocalShippingIcon />,
    'Account Settings': <ManageAccountsIcon />,
  };


  const handleLogout = () => {

    setAnchorEl(null);
    
    Swal.fire({
        title: "Are you sure you want to logout?",
        text: "",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Yes",
        customClass: {
          container: 'sweet-alert-container',
        },
        didOpen: () => {
          document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
        }
      }).then((result) => {
        if (result.isConfirmed) {

          setToken(null)
          setUserID(null)
          setRole(null)
  
          navigator('/login')
        }
      });
  }
  const drawer = (
    <div>
       <Typography  sx={{ fontSize: 30,fontWeight: 'bold' , fontFamily: 'Kanit', letterSpacing: '0.1rem',textAlign: 'center', color: "white", py: 1 }}>
        CUSTOMER
      </Typography>
      <Divider sx ={{ borderColor: 'white'}} />
      <List>
        {['My Orders', 'Customization Request', 'Order History', 'Shipping Settings', 'Account Settings'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleListItemClick(text)}>
              <ListItemIcon sx = {{color: "white"}}>
              {iconMapping[text]}
              </ListItemIcon>
              <ListItemText
              primary={
                <Typography variant="body1" style={{ fontFamily: 'Kanit', color: "white" }}>
                  {text}
                </Typography>
              }
            />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ backgroundColor: 'white' }} />
      <List>
        {['Back'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton  onClick={() => navigator('/shop')}>
              <ListItemIcon sx = {{color: "white"}}>
                 <ArrowBack/>
              </ListItemIcon>
              <ListItemText
              primary={
                <Typography variant="body1" style={{ fontFamily: 'Kanit', color: "white" }}>
                  {text}
                </Typography>
              }
            />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Remove this const when copying and pasting into your project.
  const container = window !== undefined ? () => window().document.body : undefined;

  const renderContent = () => {
    switch (selectedItem) {
      case 'My Orders':
        return <MyOrders/>;
      case 'Customization Request':
        return <MyCustomizationRequests/>;
      case 'Order History':
        return <OrderHistory/>;
      case 'Shipping Settings':
        return <ShippingDetails/>;
      case 'Account Settings':
        return <AccountSettings />;
      default:
        return <MyOrders/>;
    }
  };

  return (
    <div>
     <Box
      sx={{
        display: 'flex',
        backgroundImage: 'url(/public/assets/customerGraffiti.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#F4F4F4'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            color="black"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
                component="img"
                src="../public/assets/Logo.jpg"
                alt="Logo"
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 35, sm: 40, md: 50 },
                }}
              />
              
              <Box>
              <IconButton
                onClick={handleNotificationOpen}
                color="black"
              >
                  <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon/>
                </Badge>
              </IconButton>
              <Popover
              id={notificationID}
              open={openNotication}
              anchorEl={notificationAnchorEl}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Typography sx={{ p: 2, fontFamily: 'Kanit', fontWeight: 'bold' }}>NOTIFICATIONS</Typography>
              <Divider sx={{ backgroundColor: 'black' }} />
              <List>
                {notificationData.length > 0 ? (
                  notificationData.map((notifs, index) => (
                    <ListItem key={index} sx={{ opacity: notifs.notificationStatus === 'read' ? 0.5 : 1 }}>
                      <ListItemIcon>
                        <LocalShippingIcon fontSize="medium" sx={{ margin: 'auto', color: 'green' }} />
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                      <ListItemText 
                        primary={notifs.notificationMessage} 
                        secondary={`${notifs.notificationDate} - ${notifs.notificationTime}`} 
                        primaryTypographyProps={{ 
                          fontSize: '0.7rem', 
                          fontFamily: 'Kanit', 
                          fontWeight: 650,
                        }} 
                        secondaryTypographyProps={{ 
                          fontSize: '0.6rem', 
                          fontFamily: 'Kanit',
                        }} 
                      />
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ p: 2, fontFamily: 'Kanit', fontSize: '0.9rem', alignContent: 'center' }}>No notifications available.</Typography>
                )}
              </List>
              <Divider sx={{ backgroundColor: 'black' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                <Button
                  size="small"
                  startIcon={<MailIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ fontSize: '0.70rem', color: 'gray', fontFamily: 'Kanit' }}
                  disabled = {notificationData.length == 0 ? true : false}
                >
                  Mark All as Read
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAllNotifications}
                  sx={{ fontSize: '0.70rem', color: 'gray',fontFamily: 'Kanit' }}
                  disabled = {notificationData.length == 0 ? true : false}
                >
                  Delete All 
                </Button>
            </Box>
            </Popover>
                    <IconButton
                onClick={handleProfileMenuOpen}
                color="black"
              >
                <AccountCircle />
              </IconButton>
     
              </Box>


              <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 5,
                      '& .MuiMenuItem-root': {
                        display: 'flex',
                        alignItems: 'center',
                        
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >

                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, fontsize: { xs: 10, sm: 10, md: 10 } }} />
                    <Typography sx = {{fontFamily: "Kanit"}}> Logout</Typography>
                  </MenuItem>
                </Menu>
        </Toolbar>
  
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth,  backgroundColor: '#353535' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#353535' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, px: 5, py: 10, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {renderContent()}

      </Box>
   
    </Box>
       <Footer/>
       <ToastContainer/>
      </div>
  );
}

Users.propTypes = {
  window: PropTypes.func,
};

export default Users;