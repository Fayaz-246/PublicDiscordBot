const { Schema, model } = require("mongoose");

let schema = new Schema({
  GuildID: {
    type: String,
    required: true,
  },
  Channel: {
    type: String,
    required: true,
  },
  ChannelMessage: {
    type: String,
    required: true,
  },
});

module.exports = model("leaves", schema);
