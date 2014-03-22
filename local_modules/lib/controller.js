var _ = require('underscore');

var Controller = function(config){
	config = config || {};

	var self = function (server) {
		self._routes.get.forEach(function (routeArgs) {
			// cast arguments to array
			var callStack =  Array.prototype.slice.call(routeArgs, 0);

			self._beforeEach.forEach(function (fn, i) {
				callStack.splice(1 + i, 0, fn);
			});

			server.get.apply(server, callStack);
		});

		self._routes.post.forEach(function (routeArgs) {
			// cast arguments to array
			var callStack =  Array.prototype.slice.call(routeArgs, 0);

			self._beforeEach.forEach(function (fn, i) {
				callStack.splice(1 + i, 0, fn);
			});
			
			server.post.apply(server, callStack);
		});
	};

	self.isController = true;

	self.attach = function (subcontroller) {
		if( !subcontroller.isController ){
			throw 'cant attach non Controller objects';
		}

		subcontroller._routes.get.forEach(function (routeArgs) {
			routeArgs[0] = '/' + self.path + routeArgs[0];

			var callStack =  Array.prototype.slice.call(routeArgs, 0);

			subcontroller._beforeEach.forEach(function (fn) {
				callStack.splice(1,0,fn);
			});

			self._routes.get.push(callStack);
		});

		subcontroller._routes.post.forEach(function (routeArgs) {
			routeArgs[0] = '/' + self.path + routeArgs[0];

			var callStack =  Array.prototype.slice.call(routeArgs, 0);

			subcontroller._beforeEach.forEach(function (fn) {
				callStack.splice(1,0,fn);
			});

			self._routes.post.push(callStack);
		});
	};

	self._routes = {
		get  : [],
		post : []
	};

	self._beforeEach = [];

	// Modify render to add req.data to be pass from middleware to the view
	self._beforeEach.push(function(req, res, next){
		req.data = {};

		res._render = res.render;
		res.render = function(view, data){
			data = data || {};
			data = _.extend(data, req.data);

			res._render(view, data);
		};

		next();
	});

	self.beforeEach = function (fn) {
		self._beforeEach.push(fn);
	};

	self.config = function(config){
		this.path = config.path || "";
	};

	self.get = function () {
		arguments[0] = '/' + self.path + arguments[0];

		self._routes.get.push(arguments);
	};

	self.post = function () {
		arguments[0] = '/' + self.path + arguments[0];

		self._routes.post.push(arguments);
	};

	self.config(config);

	return self;
};

module.exports = Controller;