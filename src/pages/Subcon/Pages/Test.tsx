import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export default function CenteredTabs() {
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState('');
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [qtyOk, setQtyOk] = useState('');
  const [qtyNg, setQtyNg] = useState('');

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as string);
  };

  const handlePartNameChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPartName(event.target.value as string);
    setPartNumber(event.target.value === 'Part A' ? 'PN001' : 'PN002'); // Update part number based on part name selection
  };

  const handleQtyOkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQtyOk(event.target.value);
  };

  const handleQtyNgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQtyNg(event.target.value);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Tabs value={value} onChange={handleChangeTab} centered>
        <Tab label="Barang Masuk" />
        <Tab label="Barang Ready" />
        <Tab label="Barang Keluar" />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={value} index={0}>
        <Typography variant="h6" gutterBottom>Form Barang Masuk</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Status">
                <MenuItem value="fresh">Fresh</MenuItem>
                <MenuItem value="replating">Replating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Part Name</InputLabel>
              <Select value={partName} onChange={handlePartNameChange} label="Part Name">
                <MenuItem value="Part A">Part A</MenuItem>
                <MenuItem value="Part B">Part B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Part Number" value={partNumber} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY OK" type="number" value={qtyOk} onChange={handleQtyOkChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY NG" type="number" value={qtyNg} onChange={handleQtyNgChange} fullWidth />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom>Form Barang Ready</Typography>
        {/* Form fields are repeated, so reusing the same input layout */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Status">
                <MenuItem value="fresh">Fresh</MenuItem>
                <MenuItem value="replating">Replating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Part Name</InputLabel>
              <Select value={partName} onChange={handlePartNameChange} label="Part Name">
                <MenuItem value="Part A">Part A</MenuItem>
                <MenuItem value="Part B">Part B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Part Number" value={partNumber} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY OK" type="number" value={qtyOk} onChange={handleQtyOkChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY NG" type="number" value={qtyNg} onChange={handleQtyNgChange} fullWidth />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6" gutterBottom>Form Barang Keluar</Typography>
        {/* Form fields are repeated, so reusing the same input layout */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Status">
                <MenuItem value="fresh">Fresh</MenuItem>
                <MenuItem value="replating">Replating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Part Name</InputLabel>
              <Select value={partName} onChange={handlePartNameChange} label="Part Name">
                <MenuItem value="Part A">Part A</MenuItem>
                <MenuItem value="Part B">Part B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Part Number" value={partNumber} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY OK" type="number" value={qtyOk} onChange={handleQtyOkChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="QTY NG" type="number" value={qtyNg} onChange={handleQtyNgChange} fullWidth />
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
