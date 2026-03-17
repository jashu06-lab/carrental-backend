export function isSequelizeModel(model) {
  return model && typeof model.findAndCountAll === "function";
}

export function isMongooseModel(model) {
  return model && typeof model.find === "function" && typeof model.countDocuments === "function";
}

export function toJson(instance) {
  if (!instance) return null;
  if (typeof instance.toJSON === "function") return instance.toJSON();
  return instance;
}
