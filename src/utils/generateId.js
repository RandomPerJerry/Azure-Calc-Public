const generateId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for old browsers
  return 'ship_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export default generateId;