// $Id: CrtacPozicije.ts 18683 2016-04-29 15:06:59Z cigaly $
/// <reference path="include/misc.d.ts"/>
/// <reference path="typings/jquery/jquery.d.ts"/>
var TurnirTabela = (function($) {
var CrtacPozicije = (function () {
    function CrtacPozicije(f, sizeIsIgnored, bcs, engine) {
        var _this = this;
        this.gifs = [];
        this.msiestyle = typeof document.createStyleSheet != 'undefined'; // TODO : !!!!!
        if (!f.id)
            f.id = new Date().getTime();
        this.engine = this.selectEngine(engine);
        this.bodyCountString = bcs || (function (bodyCount) { return _this.displayBodyCount(bodyCount); });
        this.squares = this.engine.squares;
        this.rows = this.engine.rows;
        this.cols = this.engine.columns;
        this.figure(f);
    }
    CrtacPozicije.prototype.selectEngine = function (engine) {
        if (typeof engine == 'undefined') {
            return draughts_engine(20);
        }
        else if ($.isNumeric(engine)) {
            return draughts_engine(engine);
        }
        else {
            return engine;
        }
    };
    CrtacPozicije.prototype.displayBodyCount = function (bodyCount) {
        var bc = bodyCount[3] ? bodyCount[3].toString() : '0';
        if (bodyCount[4] > 0) {
            bc = bc + '+' + bodyCount[4];
        }
        bc = bc + ' - ' + (bodyCount[1] ? bodyCount[1] : '0');
        if (bodyCount[0] > 0) {
            bc = bc + '+' + bodyCount[0];
        }
        return bc;
    };
    CrtacPozicije.prototype.setupSquare = function (pozicija, id, n, blackSquare, upsideDown, bodyCount) {
        var nn = upsideDown ? (this.squares - 1 - n) : n, po = pozicija[nn], sq = $("<td class='cp_" + this._figure.id + "'>");
        if (po == 0 && !blackSquare) {
            po = 3;
        }
        // TODO : Ovdje nastaje problem ukoliko nije definirana grafika za
        // prazno (crno) polje.
        // Prvi pokusaj je bio da se ovo potpuno izbaci, ali u tom slucaju
        // dolazi do problema u dopisno.js (i, pretpostavljam, drugdje)
        // kada se pomice figura, buduci da nije odredjeno sto se kamo animira.
        // Drugi pokusaj trebao bi biti taj da se umjesto <img> stavi <div>
        // odgovarajucih dimenzija.
        // Ni to bas ne daje najbolji rezultat :-(
        // Ovo dolje je dalo pristojne rezultate, ali sad trebam svugdje promijeniti :-(
        if (this.gifs[po + 2]) {
            sq.append("<img src='" + this.gifs[po + 2] + "' alt='" + CrtacPozicije.alts[po + 2] + "' />");
        }
        else {
            sq.append("<div width='" + this._figure.width + "' height='" + this._figure.height + "' />");
        }
        if (!bodyCount[po + 2]) {
            bodyCount[po + 2] = 0;
        }
        ++bodyCount[po + 2];
        sq.attr('id', 'sq_' + id + '_' + (n + 1));
        return sq;
    };
    CrtacPozicije.prototype.showBodyCount = function (bodyCount) {
        this._bc.text(this.bodyCountString(bodyCount));
    };
    CrtacPozicije.prototype.figure = function (f) {
        if (!f) {
            if (!this._figure.id) {
                this._figure.id = new Date().getTime();
            }
            return this._figure;
        }
        //_figure = $.extend(_figure, f);
        this._figure = f;
        if (this._figure.directory.substring(this._figure.directory.length - 1) != '/') {
            this._figure.directory += '/';
        }
        this.gifs = [];
        for (var n = 0; n < CrtacPozicije.names.length; ++n) {
            if (this._figure[CrtacPozicije.names[n]]) {
                this.gifs[n] = this._figure.directory + this._figure[CrtacPozicije.names[n]];
            }
        }
        if (!this.engine.firstMoveWhite) {
            var tmp = this.gifs[0];
            this.gifs[0] = this.gifs[4];
            this.gifs[4] = tmp;
            tmp = this.gifs[1];
            this.gifs[1] = this.gifs[3];
            this.gifs[3] = tmp;
        }
        //console.log('Directory: ' + _figure.directory);
        //console.log('gifs:', gifs);
        // TODO : Check if style is already present!
        var st;
        if (this.msiestyle) {
            st = $('style[title=figure_' + this._figure.id + ']');
        }
        else {
            st = $('style#figure_' + this._figure.id);
        }
        if (st.length == 0) {
            var style = this.buildStyleString();
            if (this.msiestyle) {
                this.createStyleSheetIE(style);
            }
            else {
                this.createStyleSheetNotIE(style);
            }
        }
    };
    CrtacPozicije.prototype.buildStyleString = function () {
        var wh = 'line-height: 0.5; padding: 0;';
        if (this._figure.width) {
            wh += 'width: ' + this._figure.width + 'px;';
        }
        if (this._figure.height) {
            wh += 'height: ' + this._figure.height + 'px;';
        }
        var style = '.bp_' + this._figure.id + ' {' + wh;
        if (this._figure.backgroundColorWhite) {
            style += 'background-color: ' + this._figure.backgroundColorWhite + ';';
        }
        if (this._figure.bijeloPolje) {
            style += 'background-image: url(' + this._figure.directory + this._figure.bijeloPolje + ');' +
                'background-position: center center;' +
                'background-repeat: no-repeat';
        }
        style += '}\n' +
            '.cp_' + this._figure.id + ' {' + wh;
        if (this._figure.backgroundColorBlack) {
            style += 'background-color: ' + this._figure.backgroundColorBlack + ';';
        }
        if (this._figure.praznoPolje) {
            style += 'background-image: url(' + this._figure.directory + this._figure.praznoPolje + ');' +
                'background-position: center center;' +
                'background-repeat: no-repeat';
        }
        return style + '}\n';
    };
    CrtacPozicije.prototype.createStyleSheetNotIE = function (style) {
        var s = $(document.createElement('style')).attr({
            'type': 'text/css',
            'id': 'figure_' + this._figure.id
        });
        try {
            s.append(document.createTextNode(style));
        }
        catch (e) {
            s[0].cssText = style;
        }
        s.appendTo('head');
    };
    CrtacPozicije.prototype.createStyleSheetIE = function (style) {
        var s = document.createStyleSheet(); // TODO : !!!!!
        s.cssText = style;
        s.title = 'figure_' + this._figure.id;
    };
    CrtacPozicije.prototype.highlight = function (id, highlighted) {
        if (!this._figure.transparent) {
            alert('Not transparent');
        }
        if (!this._figure.transparent || !this._figure.highlightedBlack) {
            return;
        }
        if (highlighted instanceof Array) {
            for (var n = 0; n < highlighted.length; ++n) {
                $('#' + id + '_' + highlighted[n]).css('backgroundColor', this._figure.highlightedBlack);
            }
        }
        else {
            $('#' + id + '_' + highlighted).css('backgroundColor', this._figure.highlightedBlack);
        }
    };
    // TODO : Ovo bi trebalo srediti tako da se umjesto ID-a moze navesti element ili tako nesto ...
    CrtacPozicije.prototype.crtaj = function (pozicija, id, upsideDown, highlighted, bc) {
        var board = $(id);
        if (board.length < 1 && typeof (id) == 'string') {
            board = $('#' + id);
        }
        this._bc = bc || $('.bodyCount');
        this._board_id = board[0].id ? board[0].id : '' + Math.random();
        id = this._board_id;
        var bodyCount = []; // TODO : !!!!!
        pozicija = this.engine.unpackPosition(pozicija);
        var table = $('<table>').attr({
            cellspacing: 0,
            cellpadding: 0
        }).addClass('figure_' + this._figure.id);
        for (var r = 0; r < this.rows; ++r) {
            var tr = $('<tr>');
            for (var c = 0; c < this.cols; ++c) {
                var map = this.engine.mapping(r, c, upsideDown);
                if (map.active) {
                    tr.append(this.setupSquare(pozicija, id, map.number, map.black, upsideDown, bodyCount));
                }
                else if (map.black) {
                    tr.append('<td class="cp_' + this._figure.id + '"></td>');
                }
                else {
                    tr.append('<td class="bp_' + this._figure.id + '"></td>');
                }
            }
            table.append(tr);
        }
        board.html(table).addClass('pozicija'); // TODO : !!!!!
        if (highlighted && this._figure.transparent && this._figure.highlightedBlack) {
            for (var mm = 0; mm < highlighted.length; ++mm) {
                $('#sq_' + id + '_' + (highlighted[mm]), board).attr('bgcolor', this._figure.highlightedBlack);
            }
        }
        /*
        bc = bodyCount[3] ? bodyCount[3] : '0';
        if (bodyCount[4] > 0) {
          bc = bc + '+' + bodyCount[4];
        }
        bc = bc + ' - ' + (bodyCount[1] ? bodyCount[1] : '0');
        if (bodyCount[0] > 0) {
          bc = bc + '+' + bodyCount[0];
        }
        _bc.text(bc);
        */
        this.showBodyCount(bodyCount);
    };
    CrtacPozicije.prototype.osvjezi = function (poz, upsideDown, id, bc) {
        if (!id) {
            id = this._board_id;
        }
        this._bc = bc || $('.bodyCount');
        var pozicija = this.engine.unpackPosition(poz);
        var bodyCount = []; // TODO : !!!!!
        for (var n = 0; n < this.squares; ++n) {
            var f = pozicija[upsideDown ? (this.squares - 1 - n) : n];
            if (!bodyCount[f + 2]) {
                bodyCount[f + 2] = 0;
            }
            ++bodyCount[f + 2];
            $('#sq_' + id + '_' + (n + 1) + ' img')
                .attr({
                src: this.gifs[f + 2],
                alt: CrtacPozicije.alts[f + 2]
            });
        }
        this.showBodyCount(bodyCount);
    };
    return CrtacPozicije;
}());
CrtacPozicije.names = [
    'crnaDama',
    'crnaFigura',
    'praznoPolje',
    'bijelaFigura',
    'bijelaDama',
    'bijeloPolje'
];
CrtacPozicije.alts = ['O ', 'o ', '. ', 'x ', 'X ', '  '];
// $Id: TurnirTabela.ts 19912 2016-12-29 09:20:18Z cigaly $
/// <reference path="typings/jquery/jquery.d.ts"/>
/// <reference path="typings/jqueryui/jqueryui.d.ts"/>
/// <reference path="include/misc.d.ts"/>
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
/// <reference path="typings/Hogan.d.ts" />
/// <reference path="CrtacPozicije.ts" />
var TurnirTabela;
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
        Internal.prototype.showTeamMatchHandler = function (event) {
            var _this = this;
            event.preventDefault();
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
        };
        Internal.prototype.hideTeamMatchHandler = function (event, test) {
            if (test(event)) {
                event.preventDefault();
                $(".team_match").hide();
            }
            return false;
        };
        Internal.prototype.initTeamMatchesDisplay = function () {
            var _this = this;
            $("a.team_match_link").parent()
                .on('click touchstart', function (event) { return _this.showTeamMatchHandler(event); })
                .on('mouseout touchend', function (event) { return _this.hideTeamMatchHandler(event, function (ev) { return ev.target.tagName == 'TD'; }); })
                .on('keypress', function (event) { return _this.hideTeamMatchHandler(event, function (ev) { return ev.keyCode == 27; }); })
                .on('keydown keyup', function (event) { return console.log(event.type, ' : ', event); });
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
            groups.forEach(function (group, n) { return _this.displayGroup(group, n, tabs, ul); });
            if (tabs) {
                this.table.tabs({});
            }
            this.table_top = this.table.position().top;
            this.table_bottom = this.table_top + this.table.height();
        };
        Internal.prototype.displayGroup = function (group, n, tabs, ul) {
            var _this = this;
            var groupSize = group.data.length;
            var hasTotal = groupSize > 0 && typeof group.data[0].total !== 'undefined';
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
            else if (tabs) {
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
            for (var m = 0; m < groupSize; ++m) {
                $("<th>").css({
                    'font-size': 'x-small',
                    'text-align': 'center',
                    'vertical-align': 'bottom'
                }).text(m + 1)
                    .appendTo(headRow);
            }
            headRow.append($("<th>").addClass('tt1').html("&nbsp;"));
            if (hasTotal) {
                headRow.append($('<th>').addClass('tt1').html('&nbsp;'));
            }
            if (this.props.show_sb) {
                headRow.append($("<th>").addClass('tt1').text("SB"));
            }
            headRow.appendTo(thead);
            var tbody = $("<tbody>").appendTo(table);
            //group.data.forEach((igrac, nn) => { });
            var makeGameLink = function (game) { return _this.gameLink(game, group.data[game.wh].igrac, group.data[game.bl].igrac); };
            for (var nn = 0; nn < groupSize; ++nn) {
                var igrac = group.data[nn];
                var rc = this.props.rowClass[nn % this.props.rowClass.length];
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
                for (var mm = 0; mm < groupSize; ++mm) {
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
                    .append($("<b>").text(igrac.score)).append(' (' + igrac.count + ')'));
                if (hasTotal) {
                    tr.append($('<td>').addClass(rc).addClass('r').text(igrac.total));
                }
                if (this.props.show_sb) {
                    tr.append($("<td>").addClass(rc).addClass('r').text(igrac.sb));
                }
            }
        };
        return Internal;
    }());
    TurnirTabela.gameLink_extra = function (table) {
        var table_top = table.position().top;
        var table_bottom = table_top + table.height();
        return function (lnk, game, white, black) {
            //if (game.pozicija && lnk.length > 0) {
            if (game.pozicija) {
                lnk.data('pozicija', game.pozicija)
                    .on('click touchstart mouseover', function (event) {
                    var st = $("#status"), h, diag_top, position = $(event.target).position();
                    CP.crtaj($(event.target).data('pozicija'), 'pozicija', false);
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
                })
                    .on('mouseout touchend', function (event) { return $("#status").hide(); }).attr("title", null);
            }
            return lnk;
        };
    };
    TurnirTabela.init = function (tabela, props) {
        var data = $.getJSON('https://e-dama.net/e/dama/service/dopisno_tabela/' + props.turnirId + (props.sort ? ('/sort/' + props.sort) : '') + (props.gr ? '/groups/true' : ''));
        var obj = new Internal(tabela, props);
        $(function () {
            data.done(function (groups) {
                obj.turnir_tabela(groups);
                obj.initTeamMatchesDisplay();
            });
        });
    };
})(TurnirTabela || (TurnirTabela = {}));
if (!!!templates)
    var templates = {};
templates["team_match"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); t.b("<table class=\"team_match\" border=\"1\">"); t.b("\n" + i); t.b("  <tr>"); t.b("\n" + i); t.b("    <th style=\"width: 50%;\">"); if (t.s(t.f("whiteLabel", c, p, 1), c, p, 0, 88, 105, "{{ }}")) {
        t.rs(c, p, function (c, p, t) { t.b("("); t.b(t.v(t.f("whiteLabel", c, p, 0))); t.b(") "); });
        c.pop();
    } t.b(t.v(t.f("whiteName", c, p, 0))); t.b("&nbsp;("); t.b(t.v(t.f("whiteScore", c, p, 0))); t.b(")</th>"); t.b("\n" + i); t.b("    <th style=\"width: 50%;\">"); if (t.s(t.f("blackLabel", c, p, 1), c, p, 0, 204, 221, "{{ }}")) {
        t.rs(c, p, function (c, p, t) { t.b("("); t.b(t.v(t.f("blackLabel", c, p, 0))); t.b(") "); });
        c.pop();
    } t.b(t.v(t.f("blackName", c, p, 0))); t.b("&nbsp;("); t.b(t.v(t.f("blackScore", c, p, 0))); t.b(")</th>"); t.b("\n" + i); t.b("  </tr>"); t.b("\n" + i); t.b("  <tr>"); t.b("\n" + i); t.b("    <td colspan=\"2\"><table border=\"1\" style=\"width: 100%\">"); t.b("\n" + i); if (t.s(t.f("partije", c, p, 1), c, p, 0, 369, 835, "{{ }}")) {
        t.rs(c, p, function (c, p, t) { t.b("        <tr>"); t.b("\n" + i); t.b("          <td>"); t.b(t.v(t.f("board", c, p, 0))); t.b("</td>"); t.b("\n" + i); t.b("          <td><a href=\""); t.b(t.v(t.f("urlArhivaPartija", c, p, 0))); t.b("?game="); t.b(t.v(t.f("id", c, p, 0))); t.b("\" target=\"_blank\">"); t.b(t.v(t.f("id", c, p, 0))); t.b("</a></td>"); t.b("\n" + i); t.b("          <td><a href=\""); t.b(t.v(t.f("urlArhivaIgrac", c, p, 0))); t.b("?u="); t.b(t.v(t.f("whiteId", c, p, 0))); t.b("\" target=\"_blank\">"); t.b(t.v(t.f("whiteName", c, p, 0))); t.b("</a>"); if (t.s(t.f("teamW", c, p, 1), c, p, 0, 601, 613, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b(" ("); t.b(t.v(t.f("teamW", c, p, 0))); t.b(")"); });
            c.pop();
        } t.b("</td>"); t.b("\n" + i); t.b("          <td><a href=\""); t.b(t.v(t.f("urlArhivaIgrac", c, p, 0))); t.b("?u="); t.b(t.v(t.f("blackId", c, p, 0))); t.b("\" target=\"_blank\">"); t.b(t.v(t.f("blackName", c, p, 0))); t.b("</a>"); if (t.s(t.f("teamB", c, p, 1), c, p, 0, 729, 741, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b(" ("); t.b(t.v(t.f("teamB", c, p, 0))); t.b(")"); });
            c.pop();
        } t.b("</td>"); t.b("\n" + i); t.b("          <td style=\"text-align: center;\">"); t.b(t.v(t.f("result", c, p, 0))); t.b("</td>"); t.b("\n" + i); t.b("        </tr>"); t.b("\n" + i); });
        c.pop();
    } t.b("    </table></td>"); t.b("\n" + i); t.b("  </tr>"); t.b("\n" + i); t.b("</table>"); return t.fl(); }, partials: {}, subs: {} });
  return TurnirTabela;
})(jQuery);
