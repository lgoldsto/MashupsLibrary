tau.mashups.addModule('WorkflowEditor', function () {

    function xCanvas(canvasId) {


        function State(_id, _name, _next, _isInitial, _isFinal) {
            this.ID = _id;
            this.name = _name;
            this.next = _next;
            this.x = 0;
            this.y = 0;
            this.angle = 0;
            this.isInitial = _isInitial;
            this.isFinal = _isFinal;
        }

        var that = this;
        var canvas = document.getElementById(canvasId);
        if (!canvas.getContext) {
            alert('not compartiable with HTML5');
        }

        canvas.addEventListener("mousemove", function (e) { that.onMouseMove(e); }, false);
        //canvas.addEventListener("mousedown", function(e) { that.onMouseDown(e); }, false);
        //canvas.addEventListener("mouseup", function(e) { that.onMouseUp(e); }, false);
        var context = canvas.getContext("2d");

        this.backColor = "white";

        var states = [];

        this.Add = function (stateObj) {
            var id = stateObj.Id;
            var state = stateObj.Name;
            var isInitial = stateObj.IsInitial;
            var isFinal = stateObj.IsFinal;

            var next = [];
            for (var i = 0; i < stateObj.NextStates.length; i++) {
                next.push(stateObj.NextStates[i].Id);
            }

            states.push(new State(id, state, next, isInitial, isFinal));

            var delta = 2 * Math.PI / states.length;
            var angle = -Math.PI / 2;
            var cx = canvas.width / 2;
            var cy = canvas.height / 2;
            var r = 150;

            for (var s = 0; s < states.length; s++) {
                states[s].x = cx + r * Math.cos(angle);
                states[s].y = cy + r * Math.sin(angle);
                states[s].angle = angle;
                angle += delta;
            }
        }

        this.Update = function () {
            context.fillStyle = this.backColor;
            context.fillRect(0, 0, 500, 500);

            for (var o = 0; o < states.length; o++) {
                var state = states[o];
                this.DrawState(state);
                for (var n = 0; n < state.next.length; n++) {
                    this.DrawLinkByStates(state, FindStateByID(state.next[n]));
                }

            }


            if (fromState != null) {
                this.DrawLink(fromState.x, fromState.y, endX, endY, true);
            }
        }

        var stateRadius = 20;
        var arrowHeadSize = 5;

        this.DrawState = function (state) {
            context.lineWidth = 2;
            context.strokeStyle = "#000000";
            context.fillStyle = "#A0A0A0"
            this.drawEllipse(state.x - stateRadius, state.y - stateRadius, 2 * stateRadius, 2 * stateRadius);
            if (state == hoverState) {
                context.fillStyle = "#268a1b";
                context.fill();
            } else if (state.isInitial) {
                context.fillStyle = "#90dd80";
                context.fill();
            } else if (state.isFinal) {
                context.fillStyle = "#666666";
                context.fill();
            }

            context.font = "16px Arial";
            context.fillStyle = "Black";
            var sz = context.measureText(state.name);

            var coos = Math.cos(state.angle);
            var siin = Math.sin(state.angle);

            var offsx = 0;
            var offsy = 0;


            if (coos < 0) {
                offsx -= sz.width + stateRadius + 5;
            } else if (coos > 0) {
                offsx += stateRadius + 5;
            }

            if (siin < 0) {
                offsy -= stateRadius;
            } else {
                offsy += stateRadius;
            }

            context.fillText(state.name, state.x + offsx, state.y + offsy);

        }

        this.DrawLinkByStates = function (st1, st2) {
            if (st1 == hoverState || st2 == hoverState)
                this.DrawLink(st1.x, st1.y, st2.x, st2.y, null, "#268a1b");
            else if (StateHasLink(st2, st1))
                this.DrawLink(st1.x, st1.y, st2.x, st2.y, null, 0);
            else
                this.DrawLink(st1.x, st1.y, st2.x, st2.y, null, "#888888");
        }

        this.DrawLink = function (x1, y1, x2, y2, noOffset, linkColor) {

            var angle = Math.atan2(y2 - y1, x2 - x1);
            var offs = noOffset ? 0 : arrowHeadSize + stateRadius + 3;
            var color = linkColor ? linkColor : "#000000";

            var rx1 = x1 - offs * Math.cos(angle + Math.PI);
            var ry1 = y1 - offs * Math.sin(angle + Math.PI);

            var rx2 = x2 - offs * Math.cos(angle);
            var ry2 = y2 - offs * Math.sin(angle);

            context.lineWidth = 2;
            context.strokeStyle = color;
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(rx1, ry1);
            context.lineTo(rx2, ry2);
            this.DrawArrowHead(rx2, ry2, angle);
            context.stroke();
            context.fill();
            context.closePath();
        }

        this.DrawArrowHead = function (x, y, direction) {
            var x1 = x + arrowHeadSize * Math.cos(direction);
            var y1 = y + arrowHeadSize * Math.sin(direction);
            var x2 = x + arrowHeadSize * Math.cos(direction - 2 * Math.PI / 3);
            var y2 = y + arrowHeadSize * Math.sin(direction - 2 * Math.PI / 3);
            var x3 = x + arrowHeadSize * Math.cos(direction + 2 * Math.PI / 3);
            var y3 = y + arrowHeadSize * Math.sin(direction + 2 * Math.PI / 3);

            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.lineTo(x3, y3);
            context.lineTo(x1, y1);
        }

        this.drawEllipse = function (x, y, w, h) {
            var kappa = .5522848;
            ox = (w / 2) * kappa, // control point offset horizontal
		oy = (h / 2) * kappa, // control point offset vertical
		xe = x + w,           // x-end
		ye = y + h,           // y-end
		xm = x + w / 2,       // x-middle
		ym = y + h / 2;       // y-middle

            context.beginPath();
            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
            context.stroke();
        }

        function FindStateByID(id) {
            for (var o = 0; o < states.length; o++) {
                if (states[o].ID == id)
                    return states[o];
            }
            return null;
        }

        function StateHasLink(fromState, toState) {
            for (var n = 0; n < fromState.next.length; n++) {
                if (fromState.next[n] == toState.ID) return true;
            }
            return false;
        }

        function FindState(x, y) {
            for (var o = 0; o < states.length; o++) {
                var st = states[o];
                if ((st.x - x) * (st.x - x) + (st.y - y) * (st.y - y) < 25 * 25) {
                    return st;
                }
            }
            return null;
        }

        function ConvertCoords(e) {


            var x;
            var y;
            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            x -= $(canvas).offset().left;
            y -= $(canvas).offset().top;

            return { x: x, y: y };
        }

        var connectingMode = false;
        var fromState = null;
        var endX = 0;
        var endY = 0;
        var hoverState = null;

        this.onMouseMove = function (e) {
            var coord = ConvertCoords(e);
            var tx = coord.x;
            var ty = coord.y;
            var st = FindState(tx, ty);
            if (st != null)
                hoverState = st;
            else
                hoverState = null;

            this.Update();

            /*if (fromState != null) {
            endX = tx;
            endY = ty;
            this.Update();
            }*/
        }

        function isContainLink(state, id) {
            for (var n = 0; n < state.next.length; n++) {
                if (state.next[n] == id)
                    return true;
            }

            return false;
        }

        function removeLink(state, id) {
            for (var n = 0; n < state.next.length; n++) {
                if (state.next[n] == id)
                    state.next.splice(n, 1);
            }
            $(canvas).trigger('change');
            return false;
        }

        this.bind = function (event, fn) {
            $(canvas).bind(event, fn);
        }

        this.onMouseUp = function (e) {
            var coord = ConvertCoords(e);
            var tx = coord.x;
            var ty = coord.y;
            if (fromState != null) {
                var st = FindState(tx, ty);
                if (st != null && st != fromState) {
                    if (isContainLink(fromState, st.ID)) {
                        removeLink(fromState, st.ID);
                    } else {
                        fromState.next.push(st.ID);
                    }
                }
            }
            fromState = null;
            this.Update();
        }

        this.onMouseDown = function (e) {
            var coord = ConvertCoords(e);
            var tx = coord.x;
            var ty = coord.y;

            var st = FindState(tx, ty);
            if (st != null) {
                fromState = st;
            }
        }

    }

    return xCanvas;
});
