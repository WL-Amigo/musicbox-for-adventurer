export const downloadJson = (data: unknown, fileName: string): void => {
  download(`data:application/json,${encodeURIComponent(JSON.stringify(data))}`, fileName);
};

const download = (dataUrl: string, fileName: string): void => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
