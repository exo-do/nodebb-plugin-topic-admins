"use strict";

var User = module.parent.require('./user');
var Topic = module.parent.require('./topics');
var db = module.parent.require('./database');
var Posts = module.parent.require('./posts');
var postsTools = module.parent.require('./postTools');


// Sockets Plugins
var SocketPlugins = module.parent.require('./socket.io/plugins');

var topicAdmins = {};


topicAdmins.havePermission = function(user, content)
{
  // Check if user have permission to edit post
  var admins = content.match(/\[admins\].*\[\/admins\]/i);
  if(admins)
  {
    // Remove BBCODE tag
    admins = admins[0].replace("[admins]", "");
    admins = admins.replace("[/admins]", "");
    // Split in an array all admins
    admins = admins.split("@");
    if(admins && admins.indexOf(user)>-1)
    {
      return true;
    }
  }
  return false;
};

SocketPlugins.editMainPost = function(socket, data, callback) {
  // i receive post edition!
  //console.log(data);

  if(socket.uid)
  {
    User.getUserData(socket.uid, function(err, user){
      Posts.getPostData(data.pid, function(err, post){
        if(post.uid == socket.uid || topicAdmins.havePermission(user.username, post.content))
        {
          /*
          Posts.setPostFields(data.pid, {title:data.title, content:data.content}, function(err, r){
            callback(err, "ok");
          });
          */
          postsTools.edit({pid:data.pid, uid:post.uid, title:data.title, content:data.content}, function(err, r){
            callback(err, "ok");
          });
        }
        else
        {
          callback("noPermission", "");
        }
      });
    });
  }
  else
  {
    callback("noPermission", "");
  }
};

module.exports = topicAdmins;
