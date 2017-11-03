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
        vm.clientName = clientName;
        vm.reload = reload;
        vm.isWeekday = isWeekday;

        vm.start_date; // = moment('2017-09-15T08:00:00+00:00').toDate();
        vm.end_date; // = moment('2017-11-30T18:00:00+00:00').toDate();

        activate();
        vm.USER = USER;
        ////////////////

        function projectName(wid, pid) {
          var proj = project(wid, pid)
          return (proj) ? proj.name : null;
        }

        function project(wid, pid) {
          if(!(wid && pid)){
            return 'None';
          }

          if('undefined' === typeof(vm.USER.data)){
            return;
          }
          if('undefined' === typeof(vm.USER.data.workspaces)){
            return;
          }

          var project =  vm.USER.data.workspaces[wid].projects.find(function(project) { return project.id == pid})
          return project;
        }



        function client(wid, cid) {
          return vm.USER.data.workspaces[wid].clients.find(function(client) { return client.id == cid})
        }


        function clientName(wid, pid) {

          var proj = project(wid, pid);


          if(!proj) {
            return;
          }

          var cli = client(wid, proj.cid)

          if(!cli) {
            return;
          }
          return cli.name;
        }

        function activate() {
          vm.start_date = moment().startOf('week').toDate();
          vm.end_date = moment().endOf('day').toDate();
          reload();
        }

        function reload() {
          vm.entries = toggl.query({endpoint: 'time_entries', start_date: vm.start_date, end_date: vm.end_date })
        }

        function isWeekday(date) {
          var day = moment(date).toDate().getDay();
          var weekend = [0, 6];
          return (weekend.indexOf(day) == -1);
        }
    }
})();
