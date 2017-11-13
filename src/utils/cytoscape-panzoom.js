/*!
Copyright (c) The Cytoscape Consortium

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
    // registers the extension on a cytoscape lib ref
    const register = function (cytoscape, $) {
        if (!cytoscape || !$) {
            return;
        } // can't register if cytoscape or jquery unspecified

        $.fn.cyPanzoom = $.fn.cytoscapePanzoom = function (options) {
            panzoom.apply(this, [options, cytoscape, $]);

            return this; // chainability
        };

        // if you want a core extension
        cytoscape('core', 'panzoom', function (options) { // could use options object, but args are up to you
            panzoom.apply(this, [options, cytoscape, $]);

            return this; // chainability
        });
    };

    const defaults = {
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit() { // whether to animate on fit
            return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand',
    };

    var panzoom = function (params, cytoscape, $) {
        const cyRef = this;
        const options = $.extend(true, {}, defaults, params);
        const fn = params;

        const functions = {
            destroy() {
                const $this = $(cyRef.container());
                const $pz = $this.find('.cy-panzoom');

                $pz.data('winbdgs').forEach((l) => {
                    $(window).unbind(l.evt, l.fn);
                });

                $pz.data('cybdgs').forEach((l) => {
                    cyRef.off(l.evt, l.fn);
                });

                $pz.remove();
            },

            init() {
                const browserIsMobile = 'ontouchstart' in window;

                return $(cyRef.container()).each(function () {
                    const $container = $(this);
                    $container.cytoscape = cytoscape;

                    const winbdgs = [];
                    const $win = $(window);

                    const windowBind = function (evt, fn) {
                        winbdgs.push({evt, fn});

                        $win.bind(evt, fn);
                    };

                    const windowUnbind = function (evt, fn) {
                        for (let i = 0; i < winbdgs.length; i++) {
                            const l = winbdgs[i];

                            if (l.evt === evt && l.fn === fn) {
                                winbdgs.splice(i, 1);
                                break;
                            }
                        }

                        $win.unbind(evt, fn);
                    };

                    const cybdgs = [];

                    const cyOn = function (evt, fn) {
                        cybdgs.push({evt, fn});

                        cyRef.on(evt, fn);
                    };

                    const cyOff = function (evt, fn) {
                        for (let i = 0; i < cybdgs.length; i++) {
                            const l = cybdgs[i];

                            if (l.evt === evt && l.fn === fn) {
                                cybdgs.splice(i, 1);
                                break;
                            }
                        }

                        cyRef.off(evt, fn);
                    };

                    const $panzoom = $('<div class="cy-panzoom"></div>');
                    $container.prepend($panzoom);

                    $panzoom.css('position', 'absolute'); // must be absolute regardless of stylesheet

                    $panzoom.data('winbdgs', winbdgs);
                    $panzoom.data('cybdgs', cybdgs);

                    if (options.zoomOnly) {
                        $panzoom.addClass('cy-panzoom-zoom-only');
                    }

                    // add base html elements
                    // ///////////////////////

                    const $zoomIn = $(`<div class="cy-panzoom-zoom-in cy-panzoom-zoom-button"><span class="icon ${options.zoomInIcon}"></span></div>`);
                    $panzoom.append($zoomIn);

                    const $zoomOut = $(`<div class="cy-panzoom-zoom-out cy-panzoom-zoom-button"><span class="icon ${options.zoomOutIcon}"></span></div>`);
                    $panzoom.append($zoomOut);

                    const $reset = $(`<div class="cy-panzoom-reset cy-panzoom-zoom-button"><span class="icon ${options.resetIcon}"></span></div>`);
                    $panzoom.append($reset);

                    const $slider = $('<div class="cy-panzoom-slider"></div>');
                    $panzoom.append($slider);

                    $slider.append('<div class="cy-panzoom-slider-background"></div>');

                    const $sliderHandle = $(`<div class="cy-panzoom-slider-handle"><span class="icon ${options.sliderHandleIcon}"></span></div>`);
                    $slider.append($sliderHandle);

                    const $noZoomTick = $('<div class="cy-panzoom-no-zoom-tick"></div>');
                    $slider.append($noZoomTick);

                    const $panner = $('<div class="cy-panzoom-panner"></div>');
                    $panzoom.append($panner);

                    const $pHandle = $('<div class="cy-panzoom-panner-handle"></div>');
                    $panner.append($pHandle);

                    const $pUp = $('<div class="cy-panzoom-pan-up cy-panzoom-pan-button"></div>');
                    const $pDown = $('<div class="cy-panzoom-pan-down cy-panzoom-pan-button"></div>');
                    const $pLeft = $('<div class="cy-panzoom-pan-left cy-panzoom-pan-button"></div>');
                    const $pRight = $('<div class="cy-panzoom-pan-right cy-panzoom-pan-button"></div>');
                    $panner.append($pUp).append($pDown).append($pLeft).append($pRight);

                    const $pIndicator = $('<div class="cy-panzoom-pan-indicator"></div>');
                    $panner.append($pIndicator);

                    // functions for calculating panning
                    // //////////////////////////////////

                    function handle2pan(e) {
                        let v = {
                            x: e.originalEvent.pageX - $panner.offset().left - $panner.width() / 2,
                            y: e.originalEvent.pageY - $panner.offset().top - $panner.height() / 2,
                        };

                        const r = options.panDragAreaSize;
                        const d = Math.sqrt(v.x * v.x + v.y * v.y);
                        let percent = Math.min(d / r, 1);

                        if (d < options.panInactiveArea) {
                            return {
                                x: NaN,
                                y: NaN,
                            };
                        }

                        v = {
                            x: v.x / d,
                            y: v.y / d,
                        };

                        percent = Math.max(options.panMinPercentSpeed, percent);

                        const vnorm = {
                            x: -1 * v.x * (percent * options.panDistance),
                            y: -1 * v.y * (percent * options.panDistance),
                        };

                        return vnorm;
                    }

                    function donePanning() {
                        clearInterval(panInterval);
                        windowUnbind('mousemove', handler);

                        $pIndicator.hide();
                    }

                    function positionIndicator(pan) {
                        const v = pan;
                        const d = Math.sqrt(v.x * v.x + v.y * v.y);
                        const vnorm = {
                            x: -1 * v.x / d,
                            y: -1 * v.y / d,
                        };

                        const w = $panner.width();
                        const h = $panner.height();
                        const percent = d / options.panDistance;
                        const opacity = Math.max(options.panIndicatorMinOpacity, percent);
                        const color = 255 - Math.round(opacity * 255);

                        $pIndicator.show().css({
                            left: w / 2 * vnorm.x + w / 2,
                            top: h / 2 * vnorm.y + h / 2,
                            background: `rgb(${color}, ${color}, ${color})`,
                        });
                    }

                    function calculateZoomCenterPoint() {
                        const pan = cyRef.pan();
                        const zoom = cyRef.zoom();

                        zx = $container.width() / 2;
                        zy = $container.height() / 2;
                    }

                    let zooming = false;

                    function startZooming() {
                        zooming = true;

                        calculateZoomCenterPoint();
                    }


                    function endZooming() {
                        zooming = false;
                    }

                    let zx,
                        zy;

                    function zoomTo(level) {
                        if (!zooming) { // for non-continuous zooming (e.g. click slider at pt)
                            calculateZoomCenterPoint();
                        }

                        cyRef.zoom({
                            level,
                            renderedPosition: {x: zx, y: zy},
                        });
                    }

                    let panInterval;

                    var handler = function (e) {
                        e.stopPropagation(); // don't trigger dragging of panzoom
                        e.preventDefault(); // don't cause text selection
                        clearInterval(panInterval);

                        const pan = handle2pan(e);

                        if (isNaN(pan.x) || isNaN(pan.y)) {
                            $pIndicator.hide();
                            return;
                        }

                        positionIndicator(pan);
                        panInterval = setInterval(() => {
                            cyRef.panBy(pan);
                        }, options.panSpeed);
                    };

                    $pHandle.bind('mousedown', (e) => {
                        // handle click of icon
                        handler(e);

                        // update on mousemove
                        windowBind('mousemove', handler);
                    });

                    $pHandle.bind('mouseup', () => {
                        donePanning();
                    });

                    windowBind('mouseup blur', () => {
                        donePanning();
                    });


                    // set up slider behaviour
                    // ////////////////////////

                    $slider.bind('mousedown', () =>
                        false, // so we don't pan close to the slider handle
                    );

                    let sliderVal;
                    let sliding = false;
                    const sliderPadding = 2;

                    function setSliderFromMouse(evt, handleOffset) {
                        if (handleOffset === undefined) {
                            handleOffset = 0;
                        }

                        const padding = sliderPadding;
                        const min = 0 + padding;
                        const max = $slider.height() - $sliderHandle.height() - 2 * padding;
                        let top = evt.pageY - $slider.offset().top - handleOffset;

                        // constrain to slider bounds
                        if (top < min) {
                            top = min;
                        }
                        if (top > max) {
                            top = max;
                        }

                        const percent = 1 - (top - min) / (max - min);

                        // move the handle
                        $sliderHandle.css('top', top);

                        const zmin = options.minZoom;
                        const zmax = options.maxZoom;

                        // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
                        const x = Math.log(zmin) / Math.log(zmax);
                        const p = (1 - x) * percent + x;

                        // change the zoom level
                        let z = Math.pow(zmax, p);

                        // bound the zoom value in case of floating pt rounding error
                        if (z < zmin) {
                            z = zmin;
                        } else if (z > zmax) {
                            z = zmax;
                        }

                        zoomTo(z);
                    }

                    let sliderMdownHandler,
                        sliderMmoveHandler;
                    $sliderHandle.bind('mousedown', sliderMdownHandler = function (mdEvt) {
                        const handleOffset = mdEvt.target === $sliderHandle[0] ? mdEvt.offsetY : 0;
                        sliding = true;

                        startZooming();
                        $sliderHandle.addClass('active');

                        let lastMove = 0;
                        windowBind('mousemove', sliderMmoveHandler = function (mmEvt) {
                            const now = +new Date();

                            // throttle the zooms every 10 ms so we don't call zoom too often and cause lag
                            if (now > lastMove + 10) {
                                lastMove = now;
                            } else {
                                return false;
                            }

                            setSliderFromMouse(mmEvt, handleOffset);

                            return false;
                        });

                        // unbind when
                        windowBind('mouseup', () => {
                            windowUnbind('mousemove', sliderMmoveHandler);
                            sliding = false;

                            $sliderHandle.removeClass('active');
                            endZooming();
                        });

                        return false;
                    });

                    $slider.bind('mousedown', (e) => {
                        if (e.target !== $sliderHandle[0]) {
                            sliderMdownHandler(e);
                            setSliderFromMouse(e);
                        }
                    });

                    function positionSliderFromZoom() {
                        const z = cyRef.zoom();
                        const zmin = options.minZoom;
                        const zmax = options.maxZoom;

                        // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
                        const x = Math.log(zmin) / Math.log(zmax);
                        const p = Math.log(z) / Math.log(zmax);
                        const percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction

                        const min = sliderPadding;
                        const max = $slider.height() - $sliderHandle.height() - 2 * sliderPadding;
                        let top = percent * (max - min);

                        // constrain to slider bounds
                        if (top < min) {
                            top = min;
                        }
                        if (top > max) {
                            top = max;
                        }

                        // move the handle
                        $sliderHandle.css('top', top);
                    }

                    positionSliderFromZoom();

                    cyOn('zoom', () => {
                        if (!sliding) {
                            positionSliderFromZoom();
                        }
                    });

                    // set the position of the zoom=1 tick
                    (function () {
                        const z = 1;
                        const zmin = options.minZoom;
                        const zmax = options.maxZoom;

                        // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
                        const x = Math.log(zmin) / Math.log(zmax);
                        const p = Math.log(z) / Math.log(zmax);
                        const percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction

                        if (percent > 1 || percent < 0) {
                            $noZoomTick.hide();
                            return;
                        }

                        const min = sliderPadding;
                        const max = $slider.height() - $sliderHandle.height() - 2 * sliderPadding;
                        let top = percent * (max - min);

                        // constrain to slider bounds
                        if (top < min) {
                            top = min;
                        }
                        if (top > max) {
                            top = max;
                        }

                        $noZoomTick.css('top', top);
                    }());

                    // set up zoom in/out buttons
                    // ///////////////////////////

                    function bindButton($button, factor) {
                        let zoomInterval;

                        $button.bind('mousedown', (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (e.button != 0) {
                                return;
                            }

                            const doZoom = function () {
                                const zoom = cyRef.zoom();
                                let lvl = cyRef.zoom() * factor;

                                if (lvl < options.minZoom) {
                                    lvl = options.minZoom;
                                }

                                if (lvl > options.maxZoom) {
                                    lvl = options.maxZoom;
                                }

                                if ((lvl == options.maxZoom && zoom == options.maxZoom) ||
                                    (lvl == options.minZoom && zoom == options.minZoom)
                                ) {
                                    return;
                                }

                                zoomTo(lvl);
                            };

                            startZooming();
                            doZoom();
                            zoomInterval = setInterval(doZoom, options.zoomDelay);

                            return false;
                        });

                        windowBind('mouseup blur', () => {
                            clearInterval(zoomInterval);
                            endZooming();
                        });
                    }

                    bindButton($zoomIn, (1 + options.zoomFactor));
                    bindButton($zoomOut, (1 - options.zoomFactor));

                    $reset.bind('mousedown', (e) => {
                        if (e.button != 0) {
                            return;
                        }

                        const elesToFit = options.fitSelector ? cyRef.elements(options.fitSelector) : cyRef.elements();

                        if (elesToFit.size() === 0) {
                            cyRef.reset();
                        } else {
                            const animateOnFit = typeof options.animateOnFit === 'function' ? options.animateOnFit.call() : options.animateOnFit;
                            if (animateOnFit) {
                                cyRef.animate({
                                    fit: {
                                        eles: elesToFit,
                                        padding: options.fitPadding,
                                    },
                                }, {
                                    duration: options.fitAnimationDuration,
                                });
                            } else {
                                cyRef.fit(elesToFit, options.fitPadding);
                            }
                        }

                        return false;
                    });
                });
            },
        };

        if (functions[fn]) {
            return functions[fn].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof fn === 'object' || !fn) {
            return functions.init.apply(this, arguments);
        }
        $.error(`No such function \`${fn}\` for jquery.cytoscapePanzoom`);


        return $(this);
    };


    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = function (cytoscape, jquery) {
            register(cytoscape, jquery || require('jquery'));
        };
    } else if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-panzoom', () => register);
    }

    if (typeof cytoscape !== 'undefined' && typeof jQuery !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape, jQuery);
    }
}());
