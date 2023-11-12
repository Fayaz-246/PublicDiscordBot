const { Schema, model } = require("mongoose");

const afkSchema = new Schema({
  AFK: {
    type: Boolean,
    required: true,
  },
  UserID: {
    type: String,
    required: true,
  },
  GuildID: {
    type: String,
    required: true,
  },
  Reason: {
    type: String,
    required: true,
  },
  Time: {
    type: Number,
    required: true,
  },
});

module.exports = model("afkS", afkSchema);
