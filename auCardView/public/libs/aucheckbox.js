;
/**
    MIT License
    Copyright (c) 2017 Mario Vernari
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */


(function ($) {
    "use strict";

    $.fn.auCheckBox = function (options) {
        return this.each(function () {
            var obj = AuCheckBox();
            obj.init(options, this);
            $(this).data('auCheckBox', obj);
        });
    }


    $.fn.auCheckBox.options = {
        enabled: true,
        visible: true,
        status: 'unchecked',
        //mode: 2
    };


    function AuCheckBox() {
        "use strict";

        function update(sts) {
            var changed = false;
            if (sts != null && typeof sts === 'string') {
                changed = sts !== status;
                status = sts;
                //if (changed) console.log(status)
            }

            var cls, opacity = 0.65, color = 'black';
            switch (status) {
                case 'checked':
                    cls = 'glyphicon glyphicon-check';
                    opacity = 1;
                    color = me.options.checkedColor || color;
                    break;
                case 'indeterminate':
                    cls = 'glyphicon glyphicon-ok-circle';
                    break;
                default:
                    status = 'unchecked';
                    cls = 'glyphicon glyphicon-unchecked';
                    break;
            }
            ctr.children('span').attr('class', cls);

            if (enabled) {
                ctr.css({
                    'pointer-events': 'initial',
                    'opacity': opacity,
                    'color': color
                });
            }
            else {
                ctr.css({
                    'pointer-events': 'none',
                    'opacity': 0.33,
                    'color': color
                });
            }

            if (changed) me.$elem.trigger('change');
            return changed;
        }


        function hbutton(e) {
            e.stopPropagation();
            var chg;
            switch (status) {
                case 'checked':
                case 'indeterminate':
                    chg = update('unchecked');
                    break;
                default:
                    chg = update('checked');
            }
            me.$elem.trigger('click', [!!chg]);
        }

        var me = {}, ctr;
        var status, enabled, visible, mode;

        me.getEnabled = function () { return enabled; }
        me.setEnabled = function (v) {
            if (v !== enabled) {
                enabled = !!v;
                update();
            }
        }

        //me.getVisible = function () { return visible; }
        //me.setVisible = function (v) {
        //    if (v !== visible) {
        //        visible = !!v;
        //        update();
        //    }
        //}

        me.getStatus = function () { return status; }
        me.setStatus = function (v) {
            update(v);
        }

        me.init = function (options, elem) {
            me.$elem = $(elem);
            me.options = $.extend({}, $.fn.auCheckBox.options, options);

            status = me.options.status != null ? me.options.status : 'unchecked';
            enabled = me.options.enabled != null ? !!me.options.enabled : true;
            visible = me.options.visible != null ? !!me.options.visible : true;
            //mode = me.options.mode === 3 ? 3 : 2;

            ctr = $('<div>').appendTo(me.$elem);
            $('<span>').attr('aria-hidden', true).appendTo(ctr);
            ctr.on('click', hbutton);
            ctr.css('background-color', 'transparent');

            update();
        }

        return me;
    }

})(jQuery);
