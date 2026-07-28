const clearUrlParams = () => {
  const url = new URL(window.location);
  if (url.search) {
    url.search = '';
    window.history.replaceState({}, '', url);
  }
};

export default clearUrlParams;