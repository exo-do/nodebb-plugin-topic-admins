"use strict";

var User = module.parent.require('./user');
var Topic = module.parent.require('./topics');
var db = module.parent.require('./database');
var Posts = module.parent.require('./posts');
var postsTools = module.parent.require('./postTools');


// Sockets Plugins
var SocketPlugins = module.parent.require('./socket.io/plugins');

var topicAdmins = {};


topicAdmins.havePermission = function(user, admins, isAdmin)
{
    return ( isAdmin || ( admins && (JSON.parse(admins)).indexOf(user) > -1) );
};

SocketPlugins.editMainPost = function(socket, data, callback) {
  // i receive post edition!
  //console.log(data);

  if(socket.uid)
  {
    User.getUserData(socket.uid, function(err, user){
      Posts.getPostData(data.pid, function(err, post){
        var admins = post.admins || "[]";
        if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, admins, false))
        {
          /*
          Posts.setPostFields(data.pid, {title:data.title, content:data.content}, function(err, r){
            callback(err, "ok");
          });
          */
          Topic.getTopicData(post.tid, function(err, topic){
            // Dont allow to change topics name
            if(!err)
            {
              postsTools.edit({pid:data.pid, uid:post.uid, title:data.title, content:data.content}, function(err, r){
                callback(err, "ok");
              });
            }
            else
            {
              callback("err","");
            }
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
        User.isAdministrator(socket.uid, function(err, isAdmin){
          if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, post.admins, isAdmin))
          {
            var actAdmins = post.admins || "[]";
            actAdmins = JSON.parse(actAdmins);
            User.getUidByUsername(data.user, function(err, nAdmin){
              if(err || !nAdmin || topicAdmins.havePermission(nAdmin, post.admins, false))
              { // if error, no user with this username or this user is admin -> ERROR
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
        User.isAdministrator(socket.uid, function(nAdmin, isAdmin){
          if(post.uid == socket.uid || topicAdmins.havePermission(user.uid, post.admins, isAdmin))
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
    User.isAdministrator(socket.uid, function(nAdmin, isAdmin){
      var admins = post.admins || "[]";
      if(post.uid == socket.uid || topicAdmins.havePermission(socket.uid, admins, isAdmin) )
      {
        callback(null, true);
      }
      else
      {
        callback(null, false);
      }
    });
  });
};

module.exports = topicAdmins;
