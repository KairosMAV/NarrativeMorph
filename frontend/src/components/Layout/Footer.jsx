import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} CodePhoenix. All rights reserved.
          </Typography>
          
          <Box>
            <Link href="#" underline="hover" color="inherit" sx={{ mr: 2 }}>
              Privacy Policy
            </Link>
            <Link href="#" underline="hover" color="inherit" sx={{ mr: 2 }}>
              Terms of Service
            </Link>
            <Link href="#" underline="hover" color="inherit">
              Contact
            </Link>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Version 0.1.0 | Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;