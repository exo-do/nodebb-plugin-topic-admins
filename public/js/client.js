
(function(TopicAdmins) {
	// Funcion para deteccion de multicuenta por cookie
	init = function()
	{
		
		$(window).on('action:ajaxify.contentLoaded', function () {
			require(['composer', 'string'], function(composer, String) {
				S = String;
				// Do something
				var editBtn = '<button class="btn btn-sm btn-default edit" type="button" title="Edit" id="topicAdminsEdit"><i class="fa fa-pencil"></i> Editar</button>';
				if($(".topic-buttons.clearfix"))
				{
					$(".topic-buttons.clearfix").append(editBtn);
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
									compid = compid.replace("cmp-uuid-");
									composer.minimize(compid);
								});
							});
						}, 300);
					})
				}

			});
		});
		
	}

	init();

})(window.TopicAdmins);

