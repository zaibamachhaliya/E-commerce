const Joi = require("joi");

// Single user status update
const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "blocked", "inactive").required(),
});

// Bulk update
const bulkUpdateUserStatusSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).max(50).required(),
  status: Joi.string().valid("active", "blocked", "inactive").required(),
});

module.exports = {
  updateUserStatusSchema,
  bulkUpdateUserStatusSchema,
};