/**
 * Validate input data
 */
function validateInput(data, rules) {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} exceeds maximum length of ${rule.maxLength}`);
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
    }
  }
  
  return errors;
}

/**
 * Sanitize string input
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, 10000);
}

module.exports = {
  validateInput,
  sanitize
};
