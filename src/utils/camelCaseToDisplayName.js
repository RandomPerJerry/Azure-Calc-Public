const camelCaseToDisplayName = (camelCaseString) => {
  return camelCaseString
    // Insert space before capital letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Split into words and capitalize each
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default camelCaseToDisplayName;