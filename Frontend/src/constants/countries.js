export const COUNTRY_OPTIONS = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "BR", label: "Brazil" },
  { value: "RU", label: "Russia" },
  { value: "ZA", label: "South Africa" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "NZ", label: "New Zealand" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thailand" },
  { value: "ID", label: "Indonesia" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
];

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#0c0c0e',
    borderColor: state.isFocused ? '#ca8a04' : 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    padding: '4px',
    borderRadius: '0px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#16161a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#ca8a04' 
      : state.isFocused 
        ? 'rgba(202, 138, 4, 0.1)' 
        : 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#ca8a04',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(202, 138, 4, 0.1)',
    border: '1px solid rgba(202, 138, 4, 0.3)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#ca8a04',
    '&:hover': {
      backgroundColor: 'rgba(202, 138, 4, 0.2)',
      color: '#ffffff',
    },
  }),
  input: (base) => ({
    ...base,
    color: '#ffffff',
  }),
};
