export const errorCatch = (error: any) => {
    return error.response && error.response.data
      ? typeof error.response.data.message === 'object'
        ? error.response.data.message[0]
        : error.response.data.message
      : error.message;
  };
  