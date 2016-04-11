// $Id: CrtacPozicije.js 18196 2016-01-08 14:17:15Z cigaly $


function CrtacPozicije(f, size, bcs, engine) {
  /*
   *
   */

  if (!f.id) f.id = new Date().getTime();
  if (typeof engine == 'undefined') { engine = draughts_engine(20); }
  else if ($.isNumeric(engine)) { engine = draughts_engine(engine); }

  var msiestyle = typeof document.createStyleSheet != 'undefined';

  var bodyCountString = bcs ||
      function(bodyCount) {
        var bc = bodyCount[3] ? bodyCount[3] : '0';
        if (bodyCount[4] > 0) {
          bc = bc + '+' + bodyCount[4];
        }
        bc = bc + ' - ' + (bodyCount[1] ? bodyCount[1] : '0');
        if (bodyCount[0] > 0) {
          bc = bc + '+' + bodyCount[0];
        }
        return bc;
      };

  var squares = engine.squares;
  var rows = engine.rows;
  var cols = engine.columns;
  var _bc;
  var _board_id;

  var _figure = {};
  var alts = [ 'O ', 'o ', '. ', 'x ', 'X ', '  ' ],
      xx1 = [
        'crnaDama',
        'crnaFigura',
        'praznoPolje',
        'bijelaFigura',
        'bijelaDama',
        'bijeloPolje'
  ];
  var gifs = [];

  this.figure = function(f) { return __figure(f); };

  var __figure = function(f) {
    if (!_figure.id) {
      _figure.id = new Date().getTime();
    }
    if (!f) {
      return _figure;
    }
    //_figure = $.extend(_figure, f);
    _figure = f;
    if (_figure.directory.substring(_figure.directory.length-1) != '/') {
      _figure.directory += '/';
    }

    gifs = [];
    for (var n = 0; n < xx1.length; ++n) {
      if (_figure[xx1[n]]) {
        gifs[n] = _figure.directory + _figure[xx1[n]];
      }
    }
    if (!engine.firstMoveWhite) {
      var tmp = gifs[0];
      gifs[0] = gifs[4];
      gifs[4] = tmp;
      tmp = gifs[1];
      gifs[1] = gifs[3];
      gifs[3] = tmp;
    }
    //console.log('Directory: ' + _figure.directory);
    //console.log('gifs:', gifs);

    // TODO : Check if style is already present!
    var st;
    //if ($.browser.msie) {
    if (msiestyle) {
      st = $('style[title=figure_' + _figure.id + ']');
    } else {
      st = $('style#figure_' + _figure.id);
    }
    if (st.length == 0) {
      //var wh = '';
      var wh = 'line-height: 0.5; padding: 0;';
      if (_figure.width) {
        wh += 'width: ' + _figure.width + 'px;';
      }
      if (_figure.height) {
        wh += 'height: ' + _figure.height + 'px;';
      }
      var style =
        '.bp_' + _figure.id + ' {' + wh;
      if (_figure.backgroundColorWhite) {
        style += 'background-color: ' + _figure.backgroundColorWhite + ';';
      }
      if (_figure.bijeloPolje) {
        style += 'background-image: url(' + _figure.directory + _figure.bijeloPolje + ');' +
           'background-position: center center;' +
           'background-repeat: no-repeat';
      }
      style += '}\n' +
        '.cp_' + _figure.id + ' {' + wh;
      if (_figure.backgroundColorBlack) {
        style += 'background-color: ' + _figure.backgroundColorBlack + ';';
      }
      if (_figure.praznoPolje) {
        style += 'background-image: url(' + _figure.directory + _figure.praznoPolje + ');' +
           'background-position: center center;' +
           'background-repeat: no-repeat';
      }
      style += '}\n';

      var s;
      //if ($.browser.msie) {
      if (msiestyle) {
        s = document.createStyleSheet();
        s.cssText = style;
        s.title = 'figure_' + _figure.id;
      } else {
        s = $(document.createElement('style')).attr({
      'type' : 'text/css',
      'id'   : 'figure_' + _figure.id
        });
        try {
    s.append(document.createTextNode(style));
        } catch (e) {
    s[0].cssText = style;
        }
        s.appendTo('head');
      }
    }
    //console.log('Figure:', _figure);
  };

  __figure(f);

  var setupSquare = function(pozicija, id, n, blackSquare, upsideDown, bodyCount) {
    var nn = upsideDown ? (squares - 1 - n) : n,
        po = pozicija[nn],
        sq = $("<td class='cp_" + _figure.id + "'>");
    if (po == 0 && !blackSquare) { po = 3; }
    // TODO : Ovdje nastaje problem ukoliko nije definirana grafika za
    // prazno (crno) polje.
    // Prvi pokusaj je bio da se ovo potpuno izbaci, ali u tom slucaju
    // dolazi do problema u dopisno.js (i, pretpostavljam, drugdje)
    // kada se pomice figura, buduci da nije odredjeno sto se kamo animira.
    // Drugi pokusaj trebao bi biti taj da se umjesto <img> stavi <div>
    // odgovarajucih dimenzija.
    // Ni to bas ne daje najbolji rezultat :-(
    // Ovo dolje je dalo pristojne rezultate, ali sad trebam svugdje promijeniti :-(
    if (gifs[po+2]) {
      sq.append("<img src='" + gifs[po+2] + "' alt='" + alts[po+2] + "' />");
    } else {
      sq.append("<div width='" + _figure.width + "' height='" + _figure.height + "' />");
    }
    if (!bodyCount[po+2]) {
      bodyCount[po+2] = 0;
    }
    ++bodyCount[po+2];
    sq.attr('id', 'sq_' + id + '_' + (n+1));
    return sq;
  };

  var showBodyCount = function(bodyCount) {
    _bc.text(bodyCountString(bodyCount));
  };

    // TODO : Ovo bi trebalo srediti tako da se umjesto ID-a moze navesti element ili tako nesto ...
  this.crtaj = function (pozicija, id, upsideDown, highlighted, bc) {
    var board = $(id);
    if (board.length < 1 && typeof(id) == 'string') {
        board = $('#' + id);
    }
    _bc = bc || $('.bodyCount');
    _board_id = board[0].id ? board[0].id : '' + Math.random();
    id = _board_id;
    var bodyCount = [];
    pozicija = engine.unpackPosition(pozicija);
    var n = 0,
        m, mm/*, bc*/;
    var table = $('<table>').attr({
        cellspacing : 0,
        cellpadding : 0
    }).addClass('figure_' + _figure.id);
    for (var r = 0; r < rows; ++r) {
      var tr = $('<tr>');
      for (var c = 0; c < cols; ++c) {
        var m = engine.mapping(r, c, upsideDown);
        if (m.active) {
          tr.append(setupSquare(pozicija, id, m.number, m.black, upsideDown, bodyCount));
        } else if (m.black) {
          tr.append('<td class="cp_' + _figure.id + '"></td>');
        } else {
          tr.append('<td class="bp_' + _figure.id + '"></td>');
        }
      }
      table.append(tr);
    }
    board.html(table).addClass('pozicija');

    if (highlighted && _figure.transparent && _figure.highlightedBlack) {
      for (mm = 0; mm < highlighted.length; ++mm) {
        $('#sq_' + id + '_' + (highlighted[mm]), board).attr('bgcolor', _figure.highlightedBlack);
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
    showBodyCount(bodyCount);
  };

  this.highlight = function(id, highlighted) {
    if (!_figure.transparent) {
      alert('Not transparent');
    }
    if (!_figure.transparent || !_figure.highlightedBlack) {
      return;
    }
    if (highlighted instanceof Array) {
      for (var n = 0; n < highlighted.length; ++n) {
        $('#' + id + '_' + highlighted[n]).css('backgroundColor', _figure.highlightedBlack);
      }
    } else {
      $('#' + id + '_' + highlighted).css('backgroundColor', _figure.highlightedBlack);
    }
  };

  this.osvjezi = function(pozicija, upsideDown, id, bc) {
    if (!id) { id = _board_id; }
    _bc = bc || $('.bodyCount');
    pozicija = engine.unpackPosition(pozicija);
    var bodyCount = [];
    for (var n = 0; n < squares; ++n) {
      var f = pozicija[upsideDown ? (squares - 1 - n) : n];
      if (!bodyCount[f+2]) {
        bodyCount[f+2] = 0;
      }
      ++bodyCount[f+2];
      $('#sq_' + id + '_' + (n+1) + ' img')
        .attr({
            src : gifs[f+2],
            alt : alts[f+2]
        });
    }
    showBodyCount(bodyCount);
  };
}
