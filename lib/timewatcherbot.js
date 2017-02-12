'use strict';

var util = require('util');
var path = require('path');
var Bot = require('slackbots');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "time-watcher-bot")
 *
 * @param {object} settings
 * @constructor
 *
 * @author Anderson Fernando Custódio <afcustodioo@gmail.com>
 */
var TimeWatcherBot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'time-watcher-bot';
  this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(TimeWatcherBot, Bot);

/**
 * Run the bot
 * @public
 */
TimeWatcherBot.prototype.run = function () {
  TimeWatcherBot.super_.call(this, this.settings);

  this.on('message', this._onStart);
  this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
TimeWatcherBot.prototype._onStart = function () {
  this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
TimeWatcherBot.prototype._onMessage = function (message) {
  console.log(message);
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) && !this._isFromTimeWatcherBot(message) &&
    this._isMentioningKeyWord(message)
  ) {
    this._replyWithHourBankBalance(message);
  }
};

/**
 * Replyes to a message with a hour bank balance
 * @param {object} originalMessage
 * @private
 */
TimeWatcherBot.prototype._replyWithHourBankBalance = function (originalMessage) {
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);
  self.postMessageToChannel(channel.name, 'Você tem 3h00m positivas.', {as_user: true});
};

/**
 * Loads the user object representing the bot
 * @private
 */
TimeWatcherBot.prototype._loadBotUser = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name === self.name;
  })[0];
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' &&
    message.channel[0] === 'C'
    ;
};

/**
 * Util function to check if a given real time message is mentioning 'banco' or the time-watcher-bot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isMentioningKeyWord = function (message) {
  return message.text.toLowerCase().indexOf('banco') > -1 ||
    message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by the time-watcher-bot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isFromTimeWatcherBot = function (message) {
  return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
TimeWatcherBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

module.exports = TimeWatcherBot;
