export const highlightStyle = {
  transition: 'background-color 0.3s ease',
  backgroundColor: '#fff9c4', // light yellow
};

export const realTimeColumnStyle = {
  backgroundColor: '#f1f8ff', // very light blue
};

export const tableStyle = {
  width: '100%',
  tableLayout: 'fixed',
};

export const tableContainerStyle = {
  width: '100%',
  overflowX: 'auto',
};

export const nameColumnStyle = {
  width: { xs: '40%', sm: '30%', md: '25%' },
};

export const ageColumnStyle = {
  width: { xs: '15%', sm: '10%', md: '10%' },
};

export const roomColumnStyle = {
  width: { xs: '15%', sm: '10%', md: '10%' },
  display: { xs: 'none', sm: 'table-cell' },
};

export const vitalColumnStyle = {
  width: { xs: '15%', sm: '15%', md: '15%' },
};

export const bloodPressureColumnStyle = {
  ...vitalColumnStyle,
  display: { xs: 'none', md: 'table-cell' },
  backgroundColor: '#f1f8ff', // very light blue
};

export const heartRateColumnStyle = {
  ...vitalColumnStyle,
  backgroundColor: '#f1f8ff', // very light blue
};

export const oxygenColumnStyle = {
  ...vitalColumnStyle,
  backgroundColor: '#f1f8ff', // very light blue
};
