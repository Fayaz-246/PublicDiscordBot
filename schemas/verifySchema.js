const { model, Schema } = require("mongoose");

let schema = new Schema({
  GuildID: String,
  Role: String,
});

module.exports = model("verify", schema);
