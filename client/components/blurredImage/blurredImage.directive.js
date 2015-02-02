'use strict';


angular.module('digApp.directives')
.directive('blurredImage', function(blurImageService, $timeout) {
    return {
        scope: {
            isBlurred: '&'
        },
        restrict: 'A',
        link: function($scope, el, attrs) {
            var processing = false;
            var fallback = false;
            var blurImagesEnabled = blurImageService.getBlurImagesEnabled();
            var blurImagesPercentage = blurImageService.getBlurImagesPercentage();
            var pixelateImagesPercentage = blurImageService.getPixelateImagesPercentage();

            $scope.getMaxSize = function() {
                return Math.max(el.height(), el.width());
            };

            var cssBlur = function() {
                if($scope.getMaxSize() !== 0) {
                    var blurSize = ($scope.getMaxSize() * (blurImagesPercentage / 100));

                    el.css({
                        '-webkit-filter': 'blur(' + blurSize + 'px)',
                        '-moz-filter': 'blur(' + blurSize + 'px)',
                        '-o-filter': 'blur(' + blurSize + 'px)',
                        '-ms-filter': 'blur(' + blurSize + 'px)',
                        'filter': 'blur(' + blurSize + 'px)'
                    });
                }
            };

            var bindErrorHandler = function(img) {
                if(img.addEventListener) {
                    img.addEventListener('error', function (e) {

                        $scope.$apply(function() {
                            $scope.$watch($scope.getMaxSize, function() {
                                cssBlur();
                            });
                            fallback = true;
                            processing = null;
                            el.removeClass('hide-preblur-image');
                            $timeout(cssBlur);
                            e.preventDefault(); // Prevent error from getting thrown
                        });
                    });
                } else {
                    // Old IE uses .attachEvent instead
                    img.attachEvent('onerror', function (e) {
                        $scope.$watch($scope.getMaxSize, function() {
                            cssBlur();
                        });
                        fallback = true;
                        el.removeClass('hide-preblur-image');
                        processing=null;
                        $scope.$watch('getMaxSize', cssBlur);
                        $timeout(cssBlur);
                        return false; // Prevent propagation
                    });
                }
            };

            var pixelate = function(imageSource) {
                el.addClass('hide-preblur-image');

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.crossOrigin = 'Anonymous';

                processing = img;

                img.onload = function() {
                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img,0,0);

                    var pixelateSize = (Math.max(img.height, img.width) * (pixelateImagesPercentage / 100));

                    if(blurImagesEnabled === 'pixelate' && !fallback) {
                        var imgStr = ctx.getImageData(0, 0, canvas.width, canvas.height);


                        JSManipulate.pixelate.filter(imgStr, {
                            size: pixelateSize
                        });

                        ctx.putImageData(imgStr,0,0);

                        var imgStr2 = canvas.toDataURL('image/png');

                        el.attr('src', imgStr2);
                        el.removeClass('hide-preblur-image');
                    } else {
                        cssBlur();
                    }

                    processing = null;
                };

                bindErrorHandler(img);

                img.src = imageSource;
            };

            var blurImage = function(imageSource) {
                if(!fallback && blurImagesEnabled === 'pixelate') {
                    pixelate(imageSource);
                } else if(!fallback && blurImagesEnabled === 'blur') {
                    fallback = true;

                    $scope.$watch($scope.getMaxSize, function() {
                        cssBlur();
                    });

                    $timeout(cssBlur);
                } else if(fallback || blurImagesEnabled === 'blur') {
                    $timeout(cssBlur);
                }


            };

            $scope.processImageBlur = function(imageSource) {
                blurImagesEnabled = blurImageService.getBlurImagesEnabled();
                blurImagesPercentage = blurImageService.getBlurImagesPercentage();
                pixelateImagesPercentage = blurImageService.getPixelateImagesPercentage();

                if(!processing) {
                    blurImage(imageSource);
                } else {
                    processing.onload = null; //cancel the onload
                    blurImage(imageSource);
                }
            };

            attrs.$observe('src', function(imageSource) {
                $scope.processImageBlur(imageSource);
            });

           $scope.$watch('isBlurred()', function(newVal, oldVal) {
                if(newVal !== oldVal) {
                    $scope.processImageBlur(attrs.src);
                }
            });

        }
    };
});