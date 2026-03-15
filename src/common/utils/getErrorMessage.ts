const getErrorMessage = (response: any, defaultMsg: string = '操作失败'): string => {
  if (!response) return defaultMsg;

  return (
    response.message || response.msg || response.error || response.errMsg || defaultMsg
  );
};

export default getErrorMessage;
