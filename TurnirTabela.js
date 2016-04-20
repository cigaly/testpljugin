// jQueryId: TurnirTabela.ts 18608 2016-04-11 11:10:36Z cigaly $
/// <reference path="include/jquery/jquery.d.ts"/>
/// <reference path="include/jqueryui/jqueryui.d.ts"/>
/// <reference path="include/misc.d.ts"/>
/// <reference path="include/es6-promise/es6-promise.d.ts" />
var TurnirTabela;
(function($) {
(function (TurnirTabela) {
    var TeamMatchDisplay = (function () {
        function TeamMatchDisplay(urlArhivaPartija, urlArhivaIgrac, whiteLabel, blackLabel) {
            if (whiteLabel === void 0) { whiteLabel = 'A'; }
            if (blackLabel === void 0) { blackLabel = 'B'; }
            this.urlArhivaPartija = urlArhivaPartija;
            this.urlArhivaIgrac = urlArhivaIgrac;
            this.whiteLabel = whiteLabel;
            this.blackLabel = blackLabel;
        }
        TeamMatchDisplay.prototype.isWhite = function (whites) {
            var _this = this;
            var wh = {};
            whites.forEach(function (w) { return wh[w] = 1; });
            return function (id) { return (id in wh) ? _this.whiteLabel : _this.blackLabel; };
        };
        TeamMatchDisplay.prototype.renderingContext = function (data) {
            var isWhite = this.isWhite(data.whites);
            return $.extend({
                urlArhivaPartija: this.urlArhivaPartija,
                urlArhivaIgrac: this.urlArhivaIgrac,
                whiteLabel: this.whiteLabel,
                blackLabel: this.blackLabel,
                teamW: function () { return isWhite(this.whiteId); },
                teamB: function () { return isWhite(this.blackId); },
                board: (function () { var b = 0; return function () { return ++b; }; })()
            }, data);
        };
        TeamMatchDisplay.prototype.render = function (data) {
            return templates["team_match"].render(this.renderingContext(data));
        };
        return TeamMatchDisplay;
    }());
    var Internal = (function () {
        function Internal(table, props) {
            this.teamMatches = {};
            this.props = props;
            this.turnirId = props.turnirId;
            this.table = $(table);
            this.tmd = new TeamMatchDisplay(props.urlArhivaPartija, props.urlArhivaIgrac);
        }
        Internal.prototype.showTeamMatch = function (st, target) {
            var position = target.position();
            $(".team_match").hide();
            $("body").append(st.hide());
            var h = st.height();
            var diag_top = position.top + h > this.table_bottom ? this.table_bottom - h : position.top;
            st.css({
                'z-index': 2000,
                position: 'absolute',
                top: diag_top + "px",
                left: (position.left + 32) + "px",
                display: 'block'
            }).show();
        };
        Internal.prototype.initTeamMatchesDisplay = function () {
            var _this = this;
            $("a.team_match_link").parent().click(function (event) {
                var target = $(event.currentTarget);
                var uid = target.find(".team_match_link").data('uid');
                new Promise(function (fulfill, reject) {
                    if (uid in _this.teamMatches) {
                        fulfill(_this.teamMatches[uid]);
                    }
                    else {
                        $.getJSON('service/team_match/' + _this.turnirId + '/' + uid)
                            .then(function (response) {
                            _this.teamMatches[uid] = response;
                            fulfill(response);
                        }, function (xhr, status, exception) { return reject(exception); });
                    }
                })
                    .then(function (value) { return _this.showTeamMatch($(_this.tmd.render(_this.teamMatches[uid])).css('background-color', 'white'), target); }, function (error) { return console.log("Exception: ", error); });
                return false;
            }).mouseout(function (event) {
                if (event.target.tagName == 'TD') {
                    $(".team_match").hide();
                }
                return false;
            }).keypress(function (event) {
                console.log('keypress', event);
                if (event.keyCode == 27) {
                    $(".team_match").hide();
                }
            })
                .keydown(function (event) { return console.log('keydown', event); })
                .keyup(function (event) { return console.log('keyup', event); });
        };
        Internal.prototype.gameLink = function (game, white, black) {
            var title = white + ' - ' + black;
            if (game.score == '*') {
                game.score = '\u00a0';
            }
            if (game.id) {
                if (game.teams == true) {
                    return this.props.gameLink_extra($("<a>").attr({
                        target: "_blank",
                        //title : title,
                        href: 'team_match.jsx?tid=' + this.props.turnirId + '&uid=' + game.id
                    }).addClass('team_match_link').data('uid', game.id).text(game.score), game, white, black);
                }
                else {
                    return this.props.gameLink_extra($("<a>").attr({
                        target: "_blank",
                        href: this.props.urlArhivaPartija + game.id,
                        title: title
                    }).addClass('game_link').text(game.score), game, white, black);
                }
            }
            else {
                return game.score;
            }
        };
        Internal.prototype.turnir_tabela = function (groups) {
            var _this = this;
            if (!this.props.gameLink_extra) {
                this.props.gameLink_extra = function (lnk, game, c, d) { return lnk; };
            }
            var tabs = groups.length > 1;
            var ul;
            if (tabs) {
                ul = $("<ul>").appendTo(this.table);
            }
            for (var n = 0; n < groups.length; ++n) {
                var group = groups[n];
                var anchor;
                if (tabs) {
                    anchor = $("<a>").attr("href", "#grupa" + n);
                    $("<li>").append(anchor).appendTo(ul);
                }
                var div = $("<div>").attr("id", "grupa" + n).appendTo(this.table);
                if ('name' in group && group.name != null && group.name != '') {
                    div.append($("<b>").text(group.name));
                    if (anchor)
                        anchor.text(group.name);
                }
                else if (groups.length > 1) {
                    div.append($("<b>").text('Grupa ' + n));
                    if (anchor)
                        anchor.text('Grupa ' + n);
                }
                if (this.props.damaAdmin) {
                    div.append(' ')
                        .append($("<input>").attr({
                        type: 'text',
                        name: 'name' + n,
                        size: 64
                    }).val(this.props.turnir))
                        .append($("<button>").attr({
                        type: 'submit',
                        name: 'split' + n
                    }).val('true').text('Split')); // TODO : was true (without quotes)
                }
                div.append($("<br>"));
                var table = $("<table>").attr('border', 1).addClass("turnirskaTablica")
                    .appendTo(div);
                var thead = $("<thead>").appendTo(table);
                var headRow = $("<tr>")
                    .append($("<th>").attr('colspan', 2).addClass('tt1').html("&nbsp;"));
                for (var m = 0; m < group.data.length; ++m) {
                    $("<th>").attr({
                        align: 'center',
                        valign: 'bottom'
                    }).css('font-size', 'x-small')
                        .text(m + 1)
                        .appendTo(headRow);
                }
                headRow.append($("<th>").addClass('tt1').html("&nbsp;"));
                if (this.props.show_sb) {
                    headRow.append($("<th>").addClass('tt1').text("SB"));
                }
                headRow.appendTo(thead);
                var tbody = $("<tbody>").appendTo(table);
                for (var nn = 0; nn < group.data.length; ++nn) {
                    var rc = this.props.rowClass[nn % this.props.rowClass.length];
                    var igrac = group.data[nn];
                    var tr = $("<tr>").appendTo(tbody);
                    var tdd = $("<td>").addClass(rc).css('font-size', 'small');
                    if (igrac.cc) {
                        tdd.append($("<img>").attr({
                            src: this.props.urlFlag + '?c=' + igrac.cc,
                            title: igrac.country
                        })).append("&nbsp;");
                    }
                    var txx = igrac.tim ?
                        $("<span>")
                        :
                            $("<a>").attr({
                                target: "_blank",
                                href: this.props.urlArhivaIgrac + (igrac.eid || igrac.id)
                            });
                    tr.append($("<td>").addClass(rc).css('font-size', 'small').attr('align', 'right').text(nn + 1))
                        .append(tdd.append(txx.text(igrac.igrac))
                        .append($("<input>").attr({
                        type: "hidden",
                        name: 'igrac' + (n)
                    }).val(igrac.id)));
                    var size = $("td", tr).length;
                    for (var mm = 0; mm < group.data.length; ++mm) {
                        if (nn == mm) {
                            tr.append($("<td>").attr('bgcolor', 'black').append($('<img>').attr({
                                border: 0,
                                src: this.props.filler,
                                width: 24,
                                height: 21
                            })));
                        }
                        else {
                            tr.append($("<td>").addClass(rc).addClass('c').html("&nbsp;"));
                        }
                    }
                    var makeGameLink = function (game) { return _this.gameLink(game, group.data[game.wh].igrac, group.data[game.bl].igrac); };
                    var tds = $("td", tr).slice(size);
                    for (var xx in igrac.games) {
                        var games = igrac.games[xx];
                        var td = $(tds[xx]).empty();
                        if (Array.isArray(games)) {
                            for (var gg = 0; gg < games.length; ++gg) {
                                if (gg > 0) {
                                    if (nn != xx) {
                                        td.append('&nbsp;, ');
                                    } // TODO : !!!!!
                                }
                                td.append(makeGameLink(games[gg]));
                            }
                        }
                        else {
                            td.append(makeGameLink(games));
                        }
                    }
                    tr.append($("<td>").addClass(rc).addClass('r')
                        .append($("<b>").text(igrac.score)).append(' (').append(igrac.count.toString()).append(')'));
                    if (this.props.show_sb) {
                        tr.append($("<td>").addClass(rc).addClass('r').text(igrac.sb));
                    }
                }
            }
            if (groups.length > 1) {
                this.table.tabs({});
            }
            this.table_top = this.table.position().top;
            this.table_bottom = this.table_top + this.table.height();
        };
        return Internal;
    }());
    TurnirTabela.gameLink_extra = function (table) {
        var table_top = table.position().top;
        var table_bottom = table_top + table.height();
        return function (lnk, game, white, black) {
            if (game.pozicija && lnk.length > 0) {
                lnk[0].pozicija = game.pozicija; // TODO : !!!!!
                lnk.mouseover(function (event) {
                    var st = $("#status"), h, diag_top, position = $(event.target).position();
                    CP.crtaj(event.target.pozicija, "pozicija", false); // TODO event.target !!!
                    st.find("#bijeli").text(white + (game.wm == true ? ' *' : ''));
                    st.find("#crni").text(black + (game.wm == false ? '*' : ' '));
                    h = st.height();
                    diag_top = position.top + h > table_bottom ? table_bottom - h : position.top;
                    if (diag_top < 0) {
                        table.height(table.height() - diag_top);
                        table_bottom = table_top + table.height();
                        diag_top = 0;
                    }
                    st.css({
                        'z-index': 2000,
                        position: 'absolute',
                        top: diag_top + "px",
                        left: (position.left + 32) + "px",
                        display: 'block'
                    }).show();
                }).mouseout(function (event) { return $("#status").hide(); }).attr("title", null);
            }
            return lnk;
        };
    };
    TurnirTabela.init = function (tabela, props) {
        var data = $.ajax({
            url : 'http://w090c042.kapsch.co.at/forum/dama/service/dopisno_tabela/' + props.turnirId + (props.sort ? ('/sort/' + props.sort) : '') + (props.gr ? '/groups/true' : ''),
            headers: { 'Access-Control-Allow-Origin' : true },
            dataType : 'json'
        });
        console.log('Data: ', data);
        var obj = new Internal(tabela, props);
        $(function () {
            data.done(function (groups) {
                console.log('Data is done: ', groups);
                obj.turnir_tabela(groups);
                obj.initTeamMatchesDisplay();
            });
        });
    };
})(TurnirTabela || (TurnirTabela = {}));
})(jQuery);