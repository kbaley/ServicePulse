; (function (window, angular, undefined) {
    'use strict';

    function formatter() {
        var secondDuration = moment.duration(1000);
        var minuteDuration = moment.duration(60 * 1000);
        var hourDuration = moment.duration(60 * 60 * 1000);
        var dayDuration = moment.duration(24 * 60 * 60 * 1000);

        function formatTime(value) {
            var duration = moment.duration(value);

            if (duration >= dayDuration) {
                return duration.format('D [d] h [h]')
            } else if (duration >= hourDuration) {
                return duration.format('hh:mm [h]');
            } else if (duration >= minuteDuration) {
                return duration.format('mm:ss [min]');
            } else if (duration >= secondDuration) {
                return duration.format('ss.S [s]');
            } else {
                return duration.format('S [ms]');
            }
        }

        function formatLargeNumber(value, decimals) {
            var exp, rounded,
                suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

            if (window.isNaN(value)) {
                return null;
            }

            if (value < 1000) {
                return value.toFixed(decimals);
            }

            exp = Math.floor(Math.log(value) / Math.log(1000));

            return (value / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
        }

        return {
            formatTime: formatTime,
            formatLargeNumber: formatLargeNumber
        };
    }

    formatter.$inject = [];

    angular.module('sc')
        .service('formatter', formatter);
}(window, window.angular));