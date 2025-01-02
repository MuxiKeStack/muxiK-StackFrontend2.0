const formatIsoDate = (isoDateString: string = new Date().toISOString()) => {
  const date = new Date(isoDateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}年${month}月${day}日`;
};

export default formatIsoDate;
