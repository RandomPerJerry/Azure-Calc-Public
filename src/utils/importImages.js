function importAll(r) {
    const images = {};
    r.keys().forEach((item) => {
      const key = item.replace('./', '').replace(/\.\w+$/, '');
      images[key] = r(item);
    });
    return images;
  }

export default importAll