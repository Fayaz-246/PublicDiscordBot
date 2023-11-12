const { model, Schema } = require("mongoose");

let schema = new Schema({
  GuildID: {
    type: String,
    required: true,
  },
  Role: {
    type: String,
    required: true,
  },
});

module.exports = model("verify", schema);
