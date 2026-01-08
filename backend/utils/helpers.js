const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

const formatDate = (date) => {
  return new Date(date).toISOString();
};

module.exports = {
  isValidObjectId,
  generateRandomString,
  formatDate
};