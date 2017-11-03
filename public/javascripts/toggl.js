(function() {
    'use strict';

    angular
        .module('toggl', ['ngResource', 'config'])
        .value('USER', {})
        .run(['$resource', 'toggl', 'USER', function($resource, toggl, USER){

          toggl.get({ endpoint: 'me'}).$promise.then(function(me){
            USER.since = me.since;
            USER.data = me.data;

            var ws = {};

            for (var i = 0; i < USER.data.workspaces.length; i++) {
              var id = USER.data.workspaces[i].id;
              ws[id] = USER.data.workspaces[i];
              ws[id].projects = toggl.query( {endpoint : 'workspaces', id: id, action: 'projects'});
              ws[id].tasks = toggl.query( {endpoint : 'workspaces', id: id, action: 'tasks'});
              ws[id].tags = toggl.query( {endpoint : 'workspaces', id: id, action: 'tags'});
              ws[id].clients = toggl.query( {endpoint : 'workspaces', id: id, action: 'clients'});
            }
            USER.data.workspaces = ws;

          });
        }])
        ;
})();

(function() {
    'use strict';

    angular
        .module('toggl')
        .factory('toggl', toggl);

    toggl.$inject = ['$resource', '$http', 'API_URL', 'API_KEY', 'API_PASS'];

    /*jshint latedef: false */
    /* @ngInject */
    function toggl($resource, $http, API_URL, API_KEY, API_PASS) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + window.btoa(API_KEY + ':' + API_PASS);
      return $resource(API_URL + '/api/v8/:endpoint/:id/:action');
    }
})();

(function() {
    'use strict';

    angular
        .module('toggl')
        .controller('TimesController', TimesController);

    TimesController.$inject = ['toggl', 'USER'];

    /*jshint latedef: false */
    /* @ngInject */
    function TimesController(toggl, USER) {
        var vm = this;


        vm.projectName = projectName;

        activate();
        vm.USER = USER;
        ////////////////

        function projectName(wid, id) {
          if(!(wid && id)){
            return 'None';
          }
          return vm.USER.data.workspaces[wid].projects.find(function(project) { return project.id == id}).name;
        }
        function clientName(wid, id) {
          if(!(wid && id)){
            return 'None';
          }
          return vm.USER.data.workspaces[wid].projects.find(function(project) { return project.id == id}).name;
        }

        function activate() {
          vm.entries = toggl.query({endpoint: 'time_entries', start_date: '2017-09-15T08:00:00+00:00', end_date: '2017-11-30T18:00:00+00:00'})
        }
    }
})();
