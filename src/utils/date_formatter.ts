// export const formatDateToDDMMYYYY = (date: string) => {
//     if (!date) return '';
//     const dateObj = new Date(date);
//     const day = dateObj.getDate().toString().padStart(2, '0');
//     const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
//     const year = dateObj.getFullYear().toString();
//     return `${day}/${month}/${year}`;
// }


export const formatDateToDDMMYYYY = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };
  
  export const formatDateToMMYYYY = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${year}`;
  };
  
  export const formatCurrency = (amount: string | number, currency = 'UGX'): string => {
    if (!amount && amount !== 0) return 'N/A';
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'Invalid Amount';
    
    return `${currency} ${numericAmount.toLocaleString()}`;
  };
  
  export const getCurrentMonth = (): string => {
    return new Date().toISOString().slice(0, 7); // YYYY-MM format
  };
  
  export const formatMonthYear = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const [year, month] = dateString.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };
  