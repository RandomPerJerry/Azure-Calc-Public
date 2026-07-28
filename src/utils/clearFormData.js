const cleanFormData = (formData) => {
  return Object.keys(formData).reduce((acc, key) => {
    const value = formData[key];
    acc[key] = value === '' ? undefined : value;
    return acc;
  }, {});
};

export default cleanFormData;