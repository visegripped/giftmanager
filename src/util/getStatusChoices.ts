export const getStatusChoices = (itemRemoved: number) => {
  const statusChoices = [
    {
      label: 'no change',
      value: -1,
    },
  ];

  if (itemRemoved === 0) {
    statusChoices.push({
      label: 'cancelled',
      value: 1,
    });
  } else {
    statusChoices.push({
      label: 'uncancel',
      value: 0,
    });
  }

  return statusChoices;
};
