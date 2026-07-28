const getSafeValue = (value, defaultValue = "") => {
    return value != null ? value : defaultValue;
  };

export default getSafeValue