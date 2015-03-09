"use strict";

var User = module.parent.require('./user');
var Topic = module.parent.require('./topics');
var db = module.parent.require('./database');
var Posts = module.parent.require('./posts');
var postsTools = module.parent.require('./postTools');


// Sockets Plugins
var SocketPlugins = module.parent.require('./socket.io/plugins');

var topicAdmins = {};


topicAdmins.havePermission = function(user, admins)
{
  /* Check if user have permission to edit post
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
  */

  return ( admins && (JSON.parse(admins)).indexOf(user) > -1);

};

SocketPlugins.editMainPost = function(socket, data, callback) {
  // i receive post edition!
  //console.log(data);

  if(socket.uid)
  {
    User.getUserData(socket.uid, function(err, user){
      Posts.getPostData(data.pid, function(err, post){
        var admins = post.admins || "[]";
        if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, admins))
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

SocketPlugins.addTopicAdmin = function(socket, data, callback) {
  // i receive post edition!
  //console.log(data);

  if(socket.uid && data.user)
  {
    User.getUserData(socket.uid, function(err, user){
      Posts.getPostData(data.pid, function(err, post){
        if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, post.admins))
        {
          var actAdmins = post.admins || "[]";
          actAdmins = JSON.parse(actAdmins);
          User.getUidByUsername(data.user, function(err, nAdmin){
            if(err || !nAdmin)
            {
              callback("noUser", "");
              return;
            }
            actAdmins.push(nAdmin);
            Posts.setPostFields(data.pid, {admins:JSON.stringify(actAdmins)}, function(err, r){
              callback(err, "ok");
            });
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

SocketPlugins.deleteTopicAdmin = function(socket, data, callback) {
  // i receive post edition!
  //console.log(data);

  if(socket.uid && data.uid && data.pid)
  {
    User.getUserData(socket.uid, function(err, user){
      Posts.getPostData(data.pid, function(err, post){
        if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, post.admins))
        {
          var actAdmins = post.admins || "[]";
          actAdmins = JSON.parse(actAdmins);
          if(err)
          {
            callback("noUser", "");
            return;
          }
          var deleteAdmin = actAdmins.indexOf(data.uid);
          actAdmins.splice(deleteAdmin, 1);
          Posts.setPostFields(data.pid, {admins:JSON.stringify(actAdmins)}, function(err, r){
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

SocketPlugins.getTopicAdmin = function(socket, data, callback){
  Posts.getPostData(data.pid, function(err, post){
    //console.log(post);
    if(post.admins)
    {
      User.getUsersData(JSON.parse(post.admins), function(err, admins){
        if(err)
        {
          callback("err", "");
          return;
        }
        else
        {
          callback(null, admins);
        }
      });
    }
    else
    { // No admins
      callback(null, []);
    }
  });
};

SocketPlugins.isTopicAdmin = function(socket, data, callback){
  Posts.getPostData(data.pid, function(err, post){
    var admins = post.admins || "[]";
    if(post.uid == socket.uid || topicAdmins.havePermission(socket.uid, admins) )
    {
      callback(null, true);
    }
    else
    {
      callback(null, false);
    }
  });
};

module.exports = topicAdmins;
