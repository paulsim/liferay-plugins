AUI().ready(
	'datatype-xml',
	'event',
	'io',
	'liferay-hudcrumbs',
	'liferay-navigation-interaction',
	'liferay-sign-in-modal',
	'node',
	'panel',
	function(A) {
		var navigation = A.one('#navigation');
		var poweredByLink = A.one('.powered-by > a');
		var signIn = A.one('li.sign-in a');
		var siteBreadcrumbs = A.one('#breadcrumbs');

		if (navigation) {
			navigation.plug(Liferay.NavigationInteraction);
		}

		if (siteBreadcrumbs) {
			siteBreadcrumbs.plug(A.Hudcrumbs);
		}

		if (signIn && signIn.getData('redirect') !== 'true') {
			signIn.plug(Liferay.SignInModal);
		}

		A.getBody().delegate('click', eventHandler, 'a.logo');

		var eventHandler = function(event) {
			event.preventDefault();
			alert(event.currentTarget.attr('title'));
		}

		var createNewWindow = function (event) {
			var newWindow = window.open (
				poweredByLink.get('href'),
				'Liferay',
				'height=700, left=200, location=1, menubar=0, resizable=1, scrollbars=1, statusbar=1, toolbar=0, top=200, width=1000'
			);
			
			event.preventDefault();
		}

		poweredByLink.on('click', createNewWindow);

		var breadcrumbClickFunc = function (event) {
			var bodyNode = A.one(document.body);
			var dialogPanelContent = A.Node.create('<div class="dialogPanelContent"></div>');
			var getRequestConfig, ioRequest, panel;
			var url = 'http://localhost:8080/web/guest/home';

			bodyNode.append(dialogPanelContent);

			panel = new A.Panel(
				{
					centered: true,
					height: 400,
					modal: true,
					render: true,
					srcNode: '.dialogPanelContent',
					visible: false,
					width: 500,
					zIndex: 99999,
				}
			);

			panel.on('visibleChange',
				function () {
					if (panel.get('visible')) {
						panel.destroy();
					}
				}
			);

			getRequestConfig = {
				method: 'GET',
				headers: {
					'Content-Type': 'text/html',
				},
				on: {
					success: function (transactionId, response, arguments) {
						var tempContent = A.Node.create('<div class="tempContent"></div>');

						tempContent.setHTML(response.responseText);

						var signInForm = tempContent.one('.sign-in-form').ancestor('.portlet');

						dialogPanelContent.append(signInForm);
						panel.show();
					},
					failure: function (transactionId, response, arguments) {
						dialogPanelContent.setHTML('Error occured');
						panel.show();
					}
				}
			}

			ioRequest = A.io(url, getRequestConfig);
		};

		if ( ! Liferay.ThemeDisplay.isSignedIn()) {

			if(siteBreadcrumbs) {
				siteBreadcrumbs.delegate('click', breadcrumbClickFunc, '> .breadcrumb > li > a');

				var breadcrumbs = A.all('#breadcrumbs > .breadcrumb > li > a');

				if (breadcrumbs) {
					breadcrumbs.each(
						function (breadcrumb) {
							breadcrumb.setAttribute('onclick', "return false");
						}
					)
				}
			}
		}
	}
);