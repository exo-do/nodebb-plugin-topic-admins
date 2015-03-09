
(function(TopicAdmins) {
	// Funcion para deteccion de multicuenta por cookie
	init = function()
	{
		
		$(window).on('action:ajaxify.contentLoaded', function () {
			require(['composer', 'string'], function(composer, String) {
				S = String;
				// Do something
				var editBtn = '<button class="btn btn-sm btn-default edit" type="button" title="Edit" id="topicAdminsEdit"><i class="fa fa-pencil"></i> Editar</button>';
				var adminsBtn = '<button class="btn btn-sm btn-default" type="button" title="Admins" id="topicAdminsShow">Admins</button>';
				// Get posts
				var posts = $(".post-row");
				// Load Composer to edit post
				var pid = $(posts[0]).attr("data-pid");
				if(pid && $(".topic-buttons.clearfix"))
				{
					$(posts[0]).find(".topic-buttons.clearfix").append(adminsBtn);
					$("#topicAdminsShow").on("click", createAdminEditor);
					socket.emit("plugins.isTopicAdmin", {pid:pid}, function(err, isTopicAdmin){
						console.log(isTopicAdmin);
						if($(".topic-buttons.clearfix") && isTopicAdmin)
						{
							$(posts[0]).find(".topic-buttons.clearfix").append(editBtn);
							$("#topicAdminsEdit").on("click", function()
							{
								// Get posts
								var posts = $(".post-row");
								// Load Composer to edit post
								var pid = $(posts[0]).attr("data-pid");
								composer.editPost(pid);
								setTimeout(function(){
									var submitBtn = $(".composer-container").find(".btn.btn-primary");
									submitBtn.attr("data-action", "editTopicAdmins");
									submitBtn.on("click", function(){
										var c = $(".write").val();
										var t = $(".title.form-control").val();
										data = {pid:pid, title:t, content:c};
										socket.emit("plugins.editMainPost", data, function(err, res){
											if(!err)
											{
												app.alert({
													type: 'success',
													timeout: 3000,
													title: 'Editado',
													message: "El post fue editado correctamente!",
													alert_id: 'post_success'
												});
											}
											else
											{
												app.alert({
													type: 'danger',
													timeout: 3000,
													title: 'Error',
													message: "Hubo un error al editar! Quizás no tengas sufucuentes permisos.",
													alert_id: 'post_error'
												});
											}
											var compid = $($(".composer")[0]).attr("id");
											compid = compid.replace("cmp-uuid-", "");
											composer.minimize(compid);
										});
									});
								}, 300);
							})
						}
					});
				}

			});
		});
		
	}

	addNewAdmin = function()
	{
		var user = $("#newAdmin").val();
		var posts = $(".post-row");
		var pid = $(posts[0]).attr("data-pid");
		socket.emit("plugins.addTopicAdmin", {user:user, pid:pid}, function(err, res){
			if(!err)
			{
				app.alert({
					type: 'success',
					timeout: 3000,
					title: 'Añadido',
					message: "Admin añadido correctamente!",
					alert_id: 'post_success'
				});
				getTopicAdmin();
			}
			else
			{
				app.alert({
					type: 'danger',
					timeout: 3000,
					title: 'Error',
					message: "Hubo un error al añadir este admin! Quizás no tengas sufucuentes permisos.",
					alert_id: 'post_error'
				});
			}
		});
	}

	getTopicAdmin = function()
	{
		var user = $("#newAdmin").val();
		var posts = $(".post-row");
		var pid = $(posts[0]).attr("data-pid");
		socket.emit("plugins.getTopicAdmin", {pid:pid}, function(err, res){
			if(!err)
			{
				console.log(res);
				$("#actAdmins").html(""); // Clear admins..
				for(var i=0;i<res.length;i++)
				{
					$("#actAdmins").append("<p style='display:inline;'><img src='"+res[i].picture+"' width='60' height='60'><a href='/user/"+res[i].userslug+"'><h3>"+res[i].username+"</h3></a> (<a href='#' onclick='deleteAdmin("+res[i].uid+")'>Eliminar</a>) </p>");
				}
			}
			else
			{
				app.alert({
					type: 'danger',
					timeout: 3000,
					title: 'Error',
					message: "Hubo un error al obtener los admins!",
					alert_id: 'post_error'
				});
			}
		});
	}

	deleteAdmin = function(uid)
	{
		var user = $("#newAdmin").val();
		var posts = $(".post-row");
		var pid = $(posts[0]).attr("data-pid");
		socket.emit("plugins.deleteTopicAdmin", {pid:pid, uid:uid}, function(err, res){
			if(!err)
			{
				app.alert({
					type: 'success',
					timeout: 3000,
					title: 'Eliminado!',
					message: "Admin eliminado",
					alert_id: 'post_error'
				});
			}
			else
			{
				app.alert({
					type: 'danger',
					timeout: 3000,
					title: 'Error',
					message: "Hubo un error al eliminar los admins!",
					alert_id: 'post_error'
				});
			}
			getTopicAdmin();
		});
	}

	createAdminEditor = function()
	{
		var template = "Añadir nuevo administrador: <input type='text' id='newAdmin' placeholder='Nombre de Usuario'><button id='addNewAdmin' onclick='addNewAdmin()'>Añadir</button><br><h1>Administradores:</h1><div id='actAdmins'></div><script>getTopicAdmin();</script>";
		bootbox.dialog({
			title: 'Administradores del topic',
			message: template,
			buttons: {
				cancel: {
					label: 'Cancelar',
					className: 'btn-default',
					callback: function (e) {
						return true;
					}
				},
				save: {
					label: 'Aceptar',
					className: 'btn-primary',
					callback: function (e) {
						return addNewAdmin();
					}
				}
			}
		}, getTopicAdmin);
	}

	init();

})(window.TopicAdmins);

