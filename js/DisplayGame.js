// $Id: DisplayGame.ts 19729 2016-11-21 11:44:53Z cigaly $
/// <reference path="include/dijagram.d.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts"/>
var DisplayGame = (function($) {
var DisplayGame;
(function (DisplayGame) {
    var Partija = (function () {
        function Partija(pozicija, num, whiteMove) {
            this.pozicija = pozicija;
            this.num = num;
            this.whiteMove = whiteMove;
        }
        return Partija;
    }());
    var Internal = (function () {
        function Internal() {
        }
        Internal.prototype.swapBlackAndWhite = function (array) {
            var copy = array.slice(0);
            var tmp = copy[0];
            copy[0] = copy[4];
            copy[4] = tmp;
            tmp = copy[1];
            copy[1] = copy[3];
            copy[3] = tmp;
            return copy;
        };
        Internal.prototype.displayGameInit = function (props) {
            var _this = this;
            props = $.extend({
                size: 10,
                okreni: false,
                prefix: '',
                autoDelay: 2000,
                animationSpeed: 700,
                fadeOutSpeed: 300,
                game: { m: [] }
            }, props);
            this.board = $('#' + props.idPozicija);
            this.engine = draughts_engine(props.gameType);
            this.prefix = props.prefix;
            this.okreni = props.okreni;
            this.autoDelay = props.autoDelay;
            this.icons = { plus: props.iconPlus, minus: props.iconMinus };
            this.nav = {
                start: props.nav_start,
                prev: props.nav_prev,
                next: props.nav_next,
                end: props.nav_end,
                auto: props.nav_auto
            };
            this.start = props.start;
            this.hideMoves = props.hideMoves;
            var upsideDown = props.upsideDown ? $(props.upsideDown) : props.board.find(".button_upside_down");
            this.partija = new Partija(props.pozicija ? this.engine.unpackPosition(props.pozicija) : this.engine.initialPosition(), typeof props.num === 'undefined' ? 1 : props.num, typeof props.whiteMove === 'undefined' || props.whiteMove);
            if (!this.engine.firstMoveWhite) {
                this.figure = $.extend(props.figure, {
                    gifs: this.swapBlackAndWhite(this.figure.gifs),
                    alts: this.swapBlackAndWhite(this.figure.alts)
                });
            }
            else {
                this.figure = props.figure;
            }
            this.initialState = new Partija([].concat(this.partija.pozicija), this.partija.num, this.partija.whiteMove);
            this.board.dijagram({
                figure: this.figure,
                engine: this.engine,
                animationSpeed: props.animationSpeed,
                fadeOutSpeed: props.fadeOutSpeed
            });
            upsideDown.click(function () {
                _this.okreni = !_this.okreni;
                _this.board.dijagram('crtaj', { position: _this.board.data('current').attr('pozicija'), upsideDown: _this.okreni });
                return false;
            });
            this.drawPosition();
            this.potezi = $("#" + props.idPotezi);
            this.potezi.prepend($("<span>").attr('pozicija', this.engine.packPosition(this.partija.pozicija))
                .hide());
            this.game = props.game;
            if (this.game.m.length > 0 && this.game.m[0].s == 'b') {
                this.partija.whiteMove = false;
            }
            var state = { num: 1, white: true };
            this.game.m.forEach(function (move) {
                state = { num: move.n || state.num, white: 's' in move ? move.s == 'w' : state.white };
                var txt = move.d || move.m;
                var last;
                if (txt) {
                    var id = _this.prefix + state.num + (state.white ? 'w' : 'b');
                    var ml = $("#" + id);
                    if (ml.length < 1) {
                        if (state.white) {
                            _this.potezi.append(state.num + ".");
                        }
                        ml =
                            _this.moveLink(txt, id)
                                .css({
                                'color': 'black',
                                'text-decoration': 'none'
                            });
                        _this.potezi.append(ml).append(" ");
                    }
                    if ('ic' in move) {
                        last = $("<span>").text(move.ic).insertAfter(ml);
                    }
                    else {
                        last = ml;
                    }
                }
                if ("c" in move) {
                    _this.spanComment(move.c).insertAfter(last.append(" "));
                }
                // TODO : white moves first???
                if (state.white) {
                    state = {
                        num: state.num, white: false
                    };
                }
                else {
                    state = {
                        num: state.num + 1, white: true
                    };
                }
            });
            var pr = new Promise(function (fulfill, reject) {
                try {
                    fulfill(_.reduce(_this.game.m, function (r, i, n) { return _this.makeOneMove.call(_this, r, i, n); }, { partija: _this.partija, error: false }));
                }
                catch (ex) {
                    console.log('Error:', ex);
                    reject(ex);
                }
            }).then(function (res) { return _this.doFinish(res.partija); });
        };
        Internal.prototype.moveLink = function (text, id) {
            return $("<span>")
                .attr('id', id)
                .addClass('l1')
                .text(text);
        };
        Internal.prototype.spanComment = function (comment) {
            var icons = this.icons;
            return $("<span>")
                .addClass("move_comment")
                .append($("<img>")
                .attr('src', icons.plus)
                .addClass("show-hide")
                .click(function () {
                var txt = $(this.nextSibling);
                if (txt.is(":hidden")) {
                    $(this).attr("src", icons.minus);
                    txt.show();
                }
                else {
                    $(this).attr("src", icons.plus);
                    txt.hide();
                }
            }))
                .append($("<span>")
                .css("display", "inline")
                .text(" " + comment)
                .addClass("comment")
                .hide())
                .append(" ");
        };
        Internal.prototype.makeOneMove = function (args, move, n) {
            if (!move.m) {
                return args;
            }
            var t1 = $("#" + this.prefix + args.partija.num + (args.partija.whiteMove ? 'w' : 'b'));
            if (!t1 || !t1[0]) {
                return args;
            }
            t1[0].potez = move; // TODO : !!!!!
            var newError = false;
            var mm;
            var partija = $.extend({}, args.partija);
            if (!args.error) {
                if (move.error || move.p) {
                    if (move.p) {
                        console.log("Pozicija: " + move.p);
                        partija.pozicija = this.engine.unpackPosition(move.p);
                        this.engine.advanceMove(partija);
                        t1.wrap("<span class='error'></span>");
                    }
                    else {
                        newError = true;
                    }
                }
                else {
                    mm = this.engine.makeMove(move.m, partija.pozicija, partija.whiteMove);
                    this.engine.advanceMove(partija);
                    if (!mm) {
                        newError = true;
                    }
                    else {
                        partija.pozicija = mm.position;
                    }
                }
            }
            if (newError || args.error) {
                this.engine.advanceMove(partija);
                if (newError) {
                    t1.wrap("<span class='error'></span>");
                }
                else {
                    t1.wrap("<span></span>");
                }
                t1.click(function () { return false; });
            }
            else {
                var that = this;
                t1.attr('pozicija', this.engine.packPosition(partija.pozicija))
                    .css({
                    'color': 'blue',
                    'font-weight': '500'
                })
                    .click(function () {
                    that.stopAuto();
                    that.board.dijagram('simpleMove', $(this), that.okreni);
                    return false;
                });
                if (mm.move.preko && mm.move.preko.length > 0) {
                    t1.data("preko", mm.move.preko.join(","));
                }
            }
            return { partija: partija, error: args.error || newError };
        };
        Internal.prototype.drawPosition = function () {
            this.board.dijagram('crtaj', { position: this.partija.pozicija, upsideDown: this.okreni });
        };
        Internal.prototype.doFinish = function (partija) {
            var _this = this;
            if (!this.board.data('current')) {
                if (this.start == 'end') {
                    this.board.data('current', this.potezi.find("*[pozicija]:last"));
                }
                else {
                    this.partija = this.initialState;
                    this.board.data('current', this.potezi.find("*[pozicija]:first"));
                }
                this.drawPosition();
                this.board.data('current').addClass("potez2");
            }
            $("span.comment").hide();
            $(this.nav.start).click(function () {
                _this.stopAuto();
                _this.board.dijagram('simpleMove', _this.potezi.find("*[pozicija]:first"), _this.okreni);
                return false;
            });
            $(this.nav.prev).click(function () {
                _this.stopAuto();
                var all = _this.potezi.find("*[pozicija]"), index = all.index(_this.board.data('current'));
                if (index > 0) {
                    --index;
                }
                else {
                    index = 0;
                }
                _this.board.dijagram('simpleMove', $(all.get(index)), _this.okreni);
                return false;
            });
            $(this.nav.next).click(function () {
                _this.stopAuto();
                _this.next();
                return false;
            });
            $(this.nav.end).click(function () {
                _this.stopAuto();
                _this.board.dijagram('simpleMove', _this.potezi.find("*[pozicija]:last"), _this.okreni);
                return false;
            });
            $(this.nav.auto).click(function () {
                if (_this.auto_iid) {
                    _this.stopAuto();
                    return false;
                }
                _this.auto_iid =
                    setInterval(function () {
                        if (!_this.next()) {
                            _this.stopAuto();
                        }
                    }, _this.autoDelay);
                return false;
            });
            if (!this.hideMoves) {
                this.potezi.show();
            }
        };
        Internal.prototype.next = function () {
            var all = this.potezi.find("*[pozicija]"), index = all.index(this.board.data('current'));
            if (++index >= all.length) {
                return false;
            }
            if (this.figure.transparent) {
                this.board.dijagram('animateMove', $(all.get(index)), this.okreni);
            }
            else {
                this.board.dijagram('simpleMove', $(all.get(index)), this.okreni);
            }
            return true;
        };
        ;
        Internal.prototype.stopAuto = function () {
            if (this.auto_iid) {
                clearInterval(this.auto_iid);
                this.auto_iid = null;
            }
        };
        return Internal;
    }());
    DisplayGame.init = function (props) {
        return new Internal().displayGameInit(props);
    };
})(DisplayGame || (DisplayGame = {}));
return DisplayGame;
})(jQuery);
