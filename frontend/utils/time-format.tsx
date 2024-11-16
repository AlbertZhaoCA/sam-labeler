export const get_local_time_utc = (date: string) => {
  const d = new Date(date + 'Z');
  return d.toLocaleString();
};

export const get_local_date_and_time_utc = (date: string) => {
  const d = new Date(date + 'Z');

  const formattedDate = d.toLocaleDateString();
  const formattedTime = d.toLocaleTimeString();
  return [formattedDate, formattedTime];
};
