﻿; (function (window, angular, undefined) {

    'use strict';

    function controller(
		$log,
		$scope,
		streamService,
		serviceControlService
		) {

		$scope.model = { active_endpoints: 0, failing_endpoints: 0, number_of_failed_messages: 0, number_of_failed_checks: 0 };

		var heartbeatsUpdated = new OutOfOrderPurger();
		var failedMessageUpdated = new OutOfOrderPurger();
		var customChecksUpdated = new OutOfOrderPurger();

		serviceControlService.getHeartbeatStats().then(function (stat) {
			$scope.model.active_endpoints = stat.active;
			$scope.model.failing_endpoints = stat.failing;
			heartbeatsUpdated.resetToNow();
		});

		serviceControlService.getTotalFailedMessages().then(function (response) {
			$scope.model.number_of_failed_messages = response;
			failedMessageUpdated.resetToNow();
		});

		serviceControlService.getTotalFailingCustomChecks().then(function (response) {
			$scope.model.number_of_failed_checks = response;
			customChecksUpdated.resetToNow();
		});

        var subscriptionDisposalMethods = [];

		subscriptionDisposalMethods.push(streamService.subscribe('CustomChecksUpdated', function (message) {
			customChecksUpdated.runIfLatest(message, function () {
				$scope.model.number_of_failed_checks = message.failed;
			});
		}));

		subscriptionDisposalMethods.push(streamService.subscribe('MessageFailuresUpdated', function (message) {
			failedMessageUpdated.runIfLatest(message, function () {
				$scope.model.number_of_failed_messages = message.total;
			});
		}));

		subscriptionDisposalMethods.push(streamService.subscribe('HeartbeatsUpdated', function (message) {
			heartbeatsUpdated.runIfLatest(message, function () {
				$scope.model.failing_endpoints = message.failing;
				$scope.model.active_endpoints = message.active;
			});
		}));

		$scope.$on('$destroy', function () {
            for (var i = 0; i < subscriptionDisposalMethods.length; i++) {
                subscriptionDisposalMethods[i]();
            }
		});

		function OutOfOrderPurger() {
			var latestData = Date.now();

			this.resetToNow = function () {
				latestData = Date.now();
			};

			this.runIfLatest = function (message, func) {
				var raisedAt = new Date(Date.parse(message.raised_at));

				if (raisedAt > latestData) {
					latestData = raisedAt;
					func();
				}
			};
		}
    }

    controller.$inject = [
        '$log',
		'$scope',
		'streamService',
		'serviceControlService'
    ];

    angular.module('dashboard')
        .controller('DashboardCtrl', controller);


} (window, window.angular));