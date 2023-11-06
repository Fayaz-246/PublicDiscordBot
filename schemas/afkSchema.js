const { Schema, model } = require("mongoose");

const afkSchema = new Schema({
  AFK: Boolean,
  UserID: Number,
  GuildID: Number,
  Reason: String,
  Time: Number,
});

module.exports = model("afkS", afkSchema);
