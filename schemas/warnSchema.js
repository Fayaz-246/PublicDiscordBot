const { model, Schema } = require("mongoose");

let schema = new Schema({
  GuildID: String,
  UserID: String,
  UserTag: String,
  Content: Array,
});

module.exports = model("warns", schema);
