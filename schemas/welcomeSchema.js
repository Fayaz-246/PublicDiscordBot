const { Schema, model } = require("mongoose");

const schemaWelcome = new Schema({
  GuildID: {
    type: String,
    required: true,
  },
  Channel: {
    required: true,
    type: String,
  },
  DmMessage: {
    required: false,
    type: String,
  },
  ChannelMessage: {
    required: true,
    type: String,
  },
});

module.exports = model("welcomes", schemaWelcome);
